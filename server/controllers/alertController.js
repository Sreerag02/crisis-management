const Alert = require('../models/Alert');
const User = require('../models/userModel');
const Family = require('../models/Family');
const Shelter = require('../models/Shelter');
const sendEmail = require('../utils/mailer');
const asyncHandler = require('../middlewares/asyncHandler');

// @desc    Get all alerts
// @route   GET /api/alerts
// @access  Public
const getAlerts = asyncHandler(async (req, res) => {
  const alerts = await Alert.find({}).sort({ createdAt: -1 });
  res.json(alerts);
});

// @desc    Get single alert
// @route   GET /api/alerts/:id
// @access  Public
const getAlertById = asyncHandler(async (req, res) => {
  const alert = await Alert.findById(req.params.id);
  if (alert) {
    res.json(alert);
  } else {
    res.status(404);
    throw new Error('Alert not found');
  }
});

// @desc    Create an alert and trigger crisis flow
// @route   POST /api/alerts
// @access  Private/Admin
const createAlert = asyncHandler(async (req, res) => {
  const { severity, district, title, message, time, location, radius, isCrisis } = req.body;

  const alert = new Alert({
    severity,
    district,
    title,
    message,
    time,
    location: location && location.lat && location.lng ? {
      type: 'Point',
      coordinates: [parseFloat(location.lng), parseFloat(location.lat)]
    } : undefined,
    radius: radius || 1000,
    status: 'active'
  });

  const createdAlert = await alert.save();

  // Always send notifications for alerts with location
  if (location && location.lat && location.lng) {
    const rad = radius || 5000;
    
    console.log('\n=== ALERT CREATED WITH LOCATION ===');
    console.log('Location:', location.lat, location.lng);
    console.log('Radius:', rad, 'meters');

    // 1. Find nearby families within radius (families have locations)
    const nearbyFamilies = await Family.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [location.lng, location.lat]
          },
          $maxDistance: rad
        }
      }
    });
    
    console.log('Nearby families found:', nearbyFamilies.length);

    // 2. Find nearby shelters
    const Shelter = require('../models/Shelter');
    const nearbyShelters = await Shelter.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [location.lng, location.lat]
          },
          $maxDistance: rad + 5000
        }
      }
    }).limit(5);
    
    console.log('Nearby shelters found:', nearbyShelters.length);

    const shelterList = nearbyShelters.map(s => 
      `<a href="https://www.google.com/maps?q=${s.location.coordinates[1]},${s.location.coordinates[0]}">${s.name}</a> - ${s.status} (Capacity: ${s.capacity}, Occupied: ${s.occupied})`
    ).join('<br/>');
    
    const googleMapsLink = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
    
    // Email for families
    const familyEmailMessage = `
      <h2>🚨 CRISIS ALERT: ${title}</h2>
      <p><strong>Message:</strong> ${message}</p>
      <p><strong>Severity:</strong> ${severity?.toUpperCase()}</p>
      <p><strong>Alert Location:</strong> <a href="${googleMapsLink}">View on Google Maps</a></p>
      <hr/>
      <h3>🏠 Nearby Shelters:</h3>
      ${shelterList || '<p><em>No shelters found nearby. Stay tuned for updates.</em></p>'}
      <hr/>
      <p style="color: #d9534f; font-weight: bold;">Please stay safe and follow official instructions. Move to the nearest shelter if advised.</p>
    `;

    // Email for family members
    const familyMemberEmailMessage = `
      <h2>🚨 FAMILY ALERT: ${title}</h2>
      <p>A crisis alert has been issued in your family's area.</p>
      <p><strong>Message:</strong> ${message}</p>
      <p><strong>Severity:</strong> ${severity?.toUpperCase()}</p>
      <p><strong>Alert Location:</strong> <a href="${googleMapsLink}">View on Google Maps</a></p>
      <hr/>
      <h3>🏠 Nearby Shelters:</h3>
      ${shelterList || '<p><em>No shelters found nearby.</em></p>'}
      <hr/>
      <p style="color: #d9534f; font-weight: bold;">Please contact your family members immediately and follow safety instructions.</p>
    `;

    // Email for volunteers (stay ready message)
    const volunteerEmailMessage = `
      <h2>🚨 VOLUNTEER ALERT: Standby Required</h2>
      <p><strong>Alert:</strong> ${title}</p>
      <p><strong>Message:</strong> ${message}</p>
      <p><strong>Severity:</strong> ${severity?.toUpperCase()}</p>
      <p><strong>Location:</strong> <a href="${googleMapsLink}">View on Google Maps</a></p>
      <p><strong>Alert Radius:</strong> ${rad / 1000} km</p>
      <hr/>
      <h3>⚠️ Action Required:</h3>
      <ul>
        <li>Stay alert and keep your phone accessible</li>
        <li>Monitor the crisis management dashboard for updates</li>
        <li>Be ready to respond if an SOS is triggered in your area</li>
        <li>Check on registered families who may need assistance</li>
      </ul>
      <p><em>You are receiving this because you are registered as a volunteer in or near the affected area.</em></p>
    `;

    const io = req.app.get('socketio');

    // Send emails to families in the affected area
    console.log('\n=== SENDING FAMILY NOTIFICATIONS ===');
    for (const family of nearbyFamilies) {
      console.log('Processing family:', family.head, family.email, 'Location:', family.location);
      
      // Send email to family head
      if (family.email) {
        try {
          console.log('Sending email to family head:', family.email);
          await sendEmail({
            email: family.email,
            subject: `🚨 CRISIS ALERT: ${title} - Your Area is Affected`,
            message: familyEmailMessage,
            html: familyEmailMessage
          });
        } catch (emailError) {
          console.error('Failed to send email to family head:', family.email, emailError.message);
        }
      }

      // Send emails to family members
      if (family.members && family.members.length > 0) {
        console.log(`Sending alerts to ${family.members.length} family members of ${family.head}`);
        
        for (const member of family.members) {
          if (member.email) {
            try {
              console.log('Sending email to family member:', member.email, '(', member.name, ')');
              await sendEmail({
                email: member.email,
                subject: `🚨 FAMILY ALERT: ${title} - Your family is in the affected area`,
                message: familyMemberEmailMessage,
                html: familyMemberEmailMessage
              });
            } catch (emailError) {
              console.error('Failed to send email to family member:', member.email, emailError.message);
            }
          }
        }
      }
    }

    // Notify all volunteers in the area with "stay ready" message
    console.log('\n=== SENDING VOLUNTEER NOTIFICATIONS ===');
    const volunteersInArea = await User.find({
      role: 'volunteer',
      'location.type': 'Point',
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [location.lng, location.lat]
          },
          $maxDistance: rad
        }
      }
    });
    
    console.log('Volunteers in area found:', volunteersInArea.length);

    for (const volunteer of volunteersInArea) {
      console.log('Processing volunteer:', volunteer.name, volunteer.email);
      
      if (volunteer.email) {
        try {
          console.log('Sending standby email to volunteer:', volunteer.email);
          await sendEmail({
            email: volunteer.email,
            subject: `🚨 VOLUNTEER ALERT: Standby - ${title}`,
            message: volunteerEmailMessage,
            html: volunteerEmailMessage
          });
        } catch (emailError) {
          console.error('Failed to send email to volunteer:', volunteer.email, emailError.message);
        }
      }
      
      // Socket notification to volunteers
      io.to(volunteer._id.toString()).emit('volunteer_standby', {
        alertId: createdAlert._id,
        title,
        message,
        severity,
        location: { lat: location.lat, lng: location.lng },
        radius: rad,
        shelters: nearbyShelters
      });
    }
    
    console.log('\n=== NOTIFICATION COMPLETE ===\n');
  }

  res.status(201).json(createdAlert);
});

// @desc    Update an alert
// @route   PUT /api/alerts/:id
// @access  Private/Admin
const updateAlert = asyncHandler(async (req, res) => {
  const { severity, district, title, message, time, status, location, radius } = req.body;
  const alert = await Alert.findById(req.params.id);

  if (alert) {
    alert.severity = severity || alert.severity;
    alert.district = district || alert.district;
    alert.title = title || alert.title;
    alert.message = message || alert.message;
    alert.time = time || alert.time;

    // Update status if provided
    if (status) {
      alert.status = status;
      if (status === 'resolved') {
        alert.resolvedAt = new Date();
        console.log(`✅ Alert "${alert.title}" marked as resolved`);
      }
    }

    const updatedAlert = await alert.save();

    // Send notifications if alert location is provided and status is active
    if (location && location.lat && location.lng && status !== 'resolved') {
      const rad = radius || alert.radius || 5000;
      const alertLocation = location || {
        lat: alert.location?.coordinates[1],
        lng: alert.location?.coordinates[0]
      };

      console.log('\n=== ALERT UPDATED - SENDING NOTIFICATIONS ===');
      console.log('Location:', alertLocation.lat, alertLocation.lng);
      console.log('Radius:', rad, 'meters');

      // Find nearby families
      const nearbyFamilies = await Family.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [alertLocation.lng, alertLocation.lat]
            },
            $maxDistance: rad
          }
        }
      });

      console.log('Nearby families found:', nearbyFamilies.length);

      const googleMapsLink = `https://www.google.com/maps?q=${alertLocation.lat},${alertLocation.lng}`;

      // Email for families
      const familyEmailMessage = `
        <h2>🚨 CRISIS ALERT UPDATE: ${alert.title}</h2>
        <p><strong>Message:</strong> ${alert.message}</p>
        <p><strong>Severity:</strong> ${alert.severity?.toUpperCase()}</p>
        <p><strong>Status:</strong> ${alert.status}</p>
        <p><strong>Alert Location:</strong> <a href="${googleMapsLink}">View on Google Maps</a></p>
        <hr/>
        <p style="color: #d9534f; font-weight: bold;">Please stay safe and follow official instructions.</p>
      `;

      const io = req.app.get('socketio');

      // Send emails to families in the affected area
      console.log('\n=== SENDING FAMILY NOTIFICATIONS (UPDATE) ===');
      for (const family of nearbyFamilies) {
        console.log('Processing family:', family.head, family.email);

        // Send email to family head
        if (family.email) {
          try {
            console.log('Sending email to family head:', family.email);
            await sendEmail({
              email: family.email,
              subject: `🚨 CRISIS ALERT UPDATE: ${alert.title} - Status: ${alert.status}`,
              message: familyEmailMessage,
              html: familyEmailMessage
            });
          } catch (emailError) {
            console.error('Failed to send email to family head:', family.email, emailError.message);
          }
        }

        // Send emails to family members
        if (family.members && family.members.length > 0) {
          for (const member of family.members) {
            if (member.email) {
              try {
                console.log('Sending email to family member:', member.email, '(', member.name, ')');
                await sendEmail({
                  email: member.email,
                  subject: `🚨 FAMILY ALERT UPDATE: ${alert.title} - Status: ${alert.status}`,
                  message: familyEmailMessage,
                  html: familyEmailMessage
                });
              } catch (emailError) {
                console.error('Failed to send email to family member:', member.email, emailError.message);
              }
            }
          }
        }
      }

      console.log('\n=== UPDATE NOTIFICATION COMPLETE ===\n');
    }

    res.json(updatedAlert);
  } else {
    res.status(404);
    throw new Error('Alert not found');
  }
});

// @desc    Delete an alert
// @route   DELETE /api/alerts/:id
// @access  Private/Admin
const deleteAlert = asyncHandler(async (req, res) => {
  const alert = await Alert.findById(req.params.id);
  if (alert) {
    await alert.deleteOne();
    res.json({ message: 'Alert removed' });
  } else {
    res.status(404);
    throw new Error('Alert not found');
  }
});

module.exports = {
  getAlerts,
  getAlertById,
  createAlert,
  updateAlert,
  deleteAlert,
};
