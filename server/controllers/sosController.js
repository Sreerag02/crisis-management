const SOS = require('../models/sosModel');
const User = require('../models/userModel');
const sendEmail = require('../utils/mailer');

// @desc    Trigger SOS
// @route   POST /api/client/sos
// @access  Public
const triggerSOS = async (req, res) => {
  const { lat, lng, aadhaar, name, mobile } = req.body;

  let user = null;
  if (aadhaar && aadhaar !== 'N/A') {
    user = await User.findOne({ aadhaar }).populate('familyMembers');
  } else if (name && mobile && name !== 'Anonymous') {
    user = await User.findOne({ name, mobile }).populate('familyMembers');
  }

  const sosRecord = await SOS.create({
    user: user ? user._id : null,
    name: user ? user.name : name,
    mobile: user ? user.mobile : mobile,
    aadhaar: user ? user.aadhaar : aadhaar,
    location: {
      type: 'Point',
      coordinates: [parseFloat(lng), parseFloat(lat)]
    }
  });

  const io = req.app.get('socketio');
  const googleMapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
  const userName = user ? user.name : name;
  const userMobile = user ? user.mobile : mobile;

  // 1. Emit to Admin via Socket.io
  io.emit('new_sos_alert', {
    ...sosRecord._doc,
    googleMapsLink,
    userName
  });

  // 2. Find nearest volunteer
  const nearestVolunteer = await User.findOne({
    role: 'volunteer',
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)]
        },
        $maxDistance: 10000 // 10km
      }
    }
  });

  // 3. Find all volunteers within 15km
  const volunteersNearby = await User.find({
    role: 'volunteer',
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)]
        },
        $maxDistance: 15000 // 15km
      }
    }
  });

  // Prepare SOS email content
  const sosEmailMessage = `
    <h2>🚨 EMERGENCY SOS ALERT</h2>
    <p><strong>Name:</strong> ${userName}</p>
    <p><strong>Mobile:</strong> ${userMobile}</p>
    <p><strong>Location:</strong> <a href="${googleMapsLink}">View on Google Maps</a></p>
    <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
    <p><strong>Aadhaar:</strong> ${user ? user.aadhaar : aadhaar}</p>
    <hr/>
    <p style="color: #d9534f; font-weight: bold;">
      A person near your location is in danger. Click the link above to navigate and help them.
    </p>
    <p><em>Please respond immediately if you can help.</em></p>
  `;

  // Send email to nearest volunteer
  if (nearestVolunteer) {
    io.to(nearestVolunteer._id.toString()).emit('emergency_sos', {
      name: userName,
      mobile: userMobile,
      location: { lat, lng },
      googleMapsLink,
      sosId: sosRecord._id
    });

    // Send email to nearest volunteer
    if (nearestVolunteer.email) {
      await sendEmail({
        email: nearestVolunteer.email,
        subject: `🚨 URGENT: SOS Alert - ${userName} needs help!`,
        message: sosEmailMessage,
        html: sosEmailMessage
      });
      console.log(`Sent SOS email to nearest volunteer: ${nearestVolunteer.email}`);
    }
  }

  // Send email to all nearby volunteers
  for (const volunteer of volunteersNearby) {
    if (volunteer.email && (!nearestVolunteer || volunteer._id.toString() !== nearestVolunteer._id.toString())) {
      await sendEmail({
        email: volunteer.email,
        subject: `🚨 SOS Alert: Person in danger near you`,
        message: sosEmailMessage,
        html: sosEmailMessage
      });
      console.log(`Sent SOS email to volunteer: ${volunteer.email}`);
    }
  }

  // Send to Admin(s)
  const admins = await User.find({ role: 'admin' });
  for (const admin of admins) {
    if (admin.email) {
      await sendEmail({
        email: admin.email,
        subject: `🚨 SOS ALERT: ${userName} needs immediate help`,
        message: sosEmailMessage,
        html: sosEmailMessage
      });
    }
  }

  // Send to Family Members if user is registered
  if (user && user.familyMembers) {
    for (const member of user.familyMembers) {
      if (member.email) {
        await sendEmail({
          email: member.email,
          subject: `FAMILY SOS ALERT: ${userName}`,
          message: sosEmailMessage,
          html: sosEmailMessage
        });
      }
    }
  }

  res.status(201).json({
    message: 'SOS triggered and alerts sent to volunteers and admins',
    sosRecord
  });
};

// @desc    Get all SOS alerts (Admin)
// @route   GET /api/admin/sos-alerts
// @access  Private/Admin
const getSOSAlerts = async (req, res) => {
  const alerts = await SOS.find().sort({ createdAt: -1 }).populate('respondingVolunteer', 'name mobile');
  res.json(alerts);
};

// @desc    Volunteer respond to SOS
// @route   POST /api/sos/:id/respond
// @access  Private/Volunteer
const respondToSOS = async (req, res) => {
  const { id } = req.params;
  const { volunteerId, volunteerName, volunteerMobile } = req.body;

  const sos = await SOS.findById(id);
  if (!sos) {
    return res.status(404).json({ message: 'SOS not found' });
  }

  if (sos.status === 'resolved') {
    return res.status(400).json({ message: 'This SOS has already been resolved' });
  }

  sos.status = 'responding';
  sos.respondingVolunteer = volunteerId;
  sos.respondedAt = new Date();
  await sos.save();

  const io = req.app.get('socketio');
  
  // Notify admins that a volunteer is responding
  io.emit('sos_being_responded', {
    sosId: id,
    volunteerName,
    volunteerMobile,
    sosName: sos.name,
    sosMobile: sos.mobile
  });

  // Send email confirmation to volunteer
  const volunteer = await User.findById(volunteerId);
  if (volunteer && volunteer.email) {
    await sendEmail({
      email: volunteer.email,
      subject: `✓ You're responding to SOS: ${sos.name}`,
      message: `
        <h2>✓ Thank you for responding!</h2>
        <p>You've marked yourself as responding to:</p>
        <p><strong>Name:</strong> ${sos.name}</p>
        <p><strong>Mobile:</strong> ${sos.mobile}</p>
        <p><strong>Location:</strong> <a href="https://www.google.com/maps?q=${sos.location.coordinates[1]},${sos.location.coordinates[0]}">View on Maps</a></p>
        <p>Please proceed to the location and provide assistance. Update the status once you've helped.</p>
      `,
      html: `
        <h2 style="color: green;">✓ Thank you for responding!</h2>
        <p>You've marked yourself as responding to:</p>
        <p><strong>Name:</strong> ${sos.name}</p>
        <p><strong>Mobile:</strong> ${sos.mobile}</p>
        <p><strong>Location:</strong> <a href="https://www.google.com/maps?q=${sos.location.coordinates[1]},${sos.location.coordinates[0]}">View on Google Maps</a></p>
        <hr/>
        <p><em>Please proceed to the location and provide assistance. Update the status to "resolved" once you've helped.</em></p>
      `
    });
  }

  res.json({ message: 'Response recorded', sos });
};

module.exports = {
  triggerSOS,
  getSOSAlerts,
  respondToSOS
};
