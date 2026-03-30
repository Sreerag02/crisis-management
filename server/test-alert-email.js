require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/mongodb');
const User = require('./models/userModel');
const Alert = require('./models/Alert');
const sendEmail = require('./utils/mailer');

const testAlertSystem = async () => {
  try {
    await connectDB();
    console.log('=== TESTING ALERT NOTIFICATION SYSTEM ===\n');

    // Step 1: Check if we have users with valid locations
    console.log('Step 1: Checking for users with valid locations...\n');
    const usersWithLocation = await User.find({
      'location.coordinates.0': { $exists: true, $ne: null },
      'location.coordinates.1': { $exists: true, $ne: null },
      'location.coordinates.0': { $ne: 0 },
      'location.coordinates.1': { $ne: 0 }
    });

    console.log(`Found ${usersWithLocation.length} users with valid locations\n`);

    if (usersWithLocation.length === 0) {
      console.log('❌ No users with valid locations found!');
      console.log('Creating a test user with location...\n');
      
      const testUser = await User.create({
        name: 'Test User',
        email: process.env.EMAIL_USER, // Send to your email
        password: 'test123',
        aadhaar: '999999999999',
        mobile: '9999999999',
        role: 'user',
        location: {
          type: 'Point',
          coordinates: [76.3419, 10.0159] // Kochi coordinates
        }
      });
      
      usersWithLocation.push(testUser);
      console.log(`✓ Created test user: ${testUser.name} at ${testUser.location.coordinates}\n`);
    }

    // Show users
    usersWithLocation.forEach(u => {
      console.log(`User: ${u.name}`);
      console.log(`  Email: ${u.email}`);
      console.log(`  Location: [${u.location?.coordinates?.[1] || 'N/A'}, ${u.location?.coordinates?.[0] || 'N/A'}]\n`);
    });

    // Step 2: Create an alert near the test user
    console.log('\nStep 2: Creating test alert near users...\n');
    
    const testAlert = await Alert.create({
      severity: 'high',
      district: 'Kochi',
      title: '🧪 TEST ALERT - Email Notification Test',
      message: 'This is a test alert to verify email notifications are working. If you receive this email, the system is working correctly!',
      location: {
        type: 'Point',
        coordinates: [76.3419, 10.0159] // Same as test user - Kochi
      },
      radius: 10000, // 10km radius
      status: 'active'
    });

    console.log(`✓ Created alert: "${testAlert.title}"`);
    console.log(`  Location: [10.0159, 76.3419]`);
    console.log(`  Radius: 10000m (10km)\n`);

    // Step 3: Query for nearby users (same query as alertController)
    console.log('Step 3: Querying for nearby users...\n');
    
    const nearbyUsers = await User.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [76.3419, 10.0159]
          },
          $maxDistance: 10000
        }
      }
    });

    console.log(`✓ Found ${nearbyUsers.length} users within 10km radius\n`);

    if (nearbyUsers.length === 0) {
      console.log('❌ No users found within radius!');
      console.log('This means the $near query is not working.\n');
    }

    // Step 4: Send emails
    console.log('\nStep 4: Sending email notifications...\n');

    for (const user of nearbyUsers) {
      if (user.email) {
        console.log(`Sending email to: ${user.email}`);
        
        const emailHtml = `
          <h2>🚨 TEST CRISIS ALERT</h2>
          <p><strong>Title:</strong> ${testAlert.title}</p>
          <p><strong>Message:</strong> ${testAlert.message}</p>
          <p><strong>Severity:</strong> ${testAlert.severity.toUpperCase()}</p>
          <p><strong>Location:</strong> <a href="https://www.google.com/maps?q=10.0159,76.3419">View on Google Maps</a></p>
          <p><strong>Radius:</strong> 10km</p>
          <hr/>
          <p style="color: green; font-weight: bold;">✓ If you receive this, email notifications are working!</p>
          <p><em>Time: ${new Date().toLocaleString()}</em></p>
        `;

        try {
          await sendEmail({
            email: user.email,
            subject: `🚨 TEST ALERT - Crisis Notification System`,
            html: emailHtml
          });
          console.log(`  ✓ Email sent successfully!\n`);
        } catch (error) {
          console.log(`  ❌ Failed: ${error.message}\n`);
        }
      }
    }

    console.log('\n=== TEST COMPLETE ===\n');
    console.log('Check your email inbox!');
    console.log('If you received the email, the system is working correctly.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

testAlertSystem();
