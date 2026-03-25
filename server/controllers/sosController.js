const SOS = require('../models/sosModel');
const User = require('../models/userModel');
const sendEmail = require('../utils/mailer');

// @desc    Trigger SOS
// @route   POST /api/client/sos
// @access  Public (or Private if token is available)
const triggerSOS = async (req, res) => {
  const { lat, lng, aadhaar, name, mobile } = req.body;

  let user = null;
  if (aadhaar) {
    user = await User.findOne({ aadhaar }).populate('familyMembers');
  } else if (name && mobile) {
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

  // Prepare Email Content
  const googleMapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
  const userName = user ? user.name : name;
  const emailMessage = `
    SOS ALERT!
    Name: ${userName}
    Location: ${googleMapsLink}
    Time: ${new Date().toLocaleString()}
    Aadhaar: ${user ? user.aadhaar : aadhaar}
    Mobile: ${user ? user.mobile : mobile}
  `;

  // 1. Send to Admin(s)
  const admins = await User.find({ isAdmin: true });
  for (const admin of admins) {
    await sendEmail({
      email: admin.email,
      subject: `URGENT SOS: ${userName}`,
      message: emailMessage
    });
  }

  // 2. Send to Family Members
  if (user && user.familyMembers) {
    for (const member of user.familyMembers) {
      if (member.email) {
        await sendEmail({
          email: member.email,
          subject: `FAMILY SOS ALERT: ${userName}`,
          message: emailMessage
        });
      }
    }
  }

  res.status(201).json({
    message: 'SOS triggered and alerts sent',
    sosRecord
  });
};

// @desc    Get all SOS alerts (Admin)
// @route   GET /api/admin/sos-alerts
// @access  Private/Admin
const getSOSAlerts = async (req, res) => {
  const alerts = await SOS.find().sort({ createdAt: -1 });
  res.json(alerts);
};

module.exports = {
  triggerSOS,
  getSOSAlerts
};
