require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/mongodb');
const User = require('./models/userModel');
const Alert = require('./models/Alert');
const sendEmail = require('./utils/mailer');

const completeTest = async () => {
  try {
    await connectDB();
    console.log('=== COMPLETE EMAIL NOTIFICATION TEST ===\n');

    // STEP 1: Create test users with VALID locations
    console.log('STEP 1: Creating test users with locations...\n');
    
    const testUsers = [
      {
        name: 'Test User 1',
        email: 'test1.' + Date.now() + '@test.com',
        password: 'test123',
        aadhaar: '111111111111',
        mobile: '9999999991',
        location: { type: 'Point', coordinates: [76.3419, 10.0159] } // Kochi
      },
      {
        name: 'Test User 2',
        email: 'test2.' + Date.now() + '@test.com',
        password: 'test456',
        aadhaar: '222222222222',
        mobile: '9999999992',
        location: { type: 'Point', coordinates: [76.3500, 10.0200] } // Nearby Kochi
      }
    ];

    // Also send a copy to admin email for verification
    const adminEmail = process.env.EMAIL_USER;

    // Remove existing test users
    await User.deleteMany({ aadhaar: { $in: ['111111111111', '222222222222'] } });
    console.log('Cleared old test users\n');

    // Create new test users
    const createdUsers = [];
    for (const userData of testUsers) {
      const user = await User.create(userData);
      createdUsers.push(user);
      console.log(`✓ Created: ${user.name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Location: [${user.location.coordinates[1]}, ${user.location.coordinates[0]}]\n`);
    }

    // STEP 2: Create an alert near the test users
    console.log('STEP 2: Creating test alert...\n');
    
    const testAlert = await Alert.create({
      severity: 'high',
      district: 'Kochi',
      title: '🧪 AUTOMATED TEST - Alert Notification',
      message: 'This is an automated test to verify that email notifications are sent when an alert is created.',
      location: {
        type: 'Point',
        coordinates: [76.3450, 10.0180] // Center point near test users
      },
      radius: 5000, // 5km radius
      status: 'active'
    });

    console.log(`✓ Created alert: "${testAlert.title}"`);
    console.log(`  Location: [10.0180, 76.3450]`);
    console.log(`  Radius: 5000m (5km)\n`);

    // STEP 3: Simulate what alertController does - find nearby users
    console.log('STEP 3: Finding users within alert radius...\n');
    
    const alertLocation = testAlert.location;
    const radius = testAlert.radius;

    const nearbyUsers = await User.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: alertLocation.coordinates
          },
          $maxDistance: radius
        }
      }
    });

    console.log(`✓ Found ${nearbyUsers.length} users within ${radius}m radius\n`);

    if (nearbyUsers.length === 0) {
      console.log('❌ ERROR: No users found! The $near query is not working.\n');
      console.log('Debug info:');
      console.log(`  Alert location: [${alertLocation.coordinates[1]}, ${alertLocation.coordinates[0]}]`);
      console.log(`  User locations:`);
      createdUsers.forEach(u => {
        console.log(`    - ${u.name}: [${u.location.coordinates[1]}, ${u.location.coordinates[0]}]`);
      });
      console.log('\n');
    }

    // STEP 4: Send emails to nearby users (simulating alertController)
    console.log('STEP 4: Sending email notifications...\n');

    let emailCount = 0;
    for (const user of nearbyUsers) {
      if (user.email) {
        // Send to test user AND admin email for verification
        const emailsToSend = [user.email, adminEmail];
        
        for (const recipientEmail of emailsToSend) {
          console.log(`Sending email to: ${recipientEmail}`);
          console.log(`  User: ${user.name}`);
          console.log(`  Location: [${user.location.coordinates[1]}, ${user.location.coordinates[0]}]`);
          
          const emailHtml = `
            <h2>🚨 TEST CRISIS ALERT</h2>
            <p><strong>Title:</strong> ${testAlert.title}</p>
            <p><strong>Message:</strong> ${testAlert.message}</p>
            <p><strong>Severity:</strong> ${testAlert.severity.toUpperCase()}</p>
            <p><strong>Alert Location:</strong> <a href="https://www.google.com/maps?q=${alertLocation.coordinates[1]},${alertLocation.coordinates[0]}">View on Google Maps</a></p>
            <p><strong>Your Distance:</strong> Within ${radius/1000}km radius</p>
            <hr/>
            <h3>🏠 Nearby Shelters:</h3>
            <p><em>No shelters found in test mode.</em></p>
            <hr/>
            <p style="color: green; font-weight: bold; font-size: 16px;">
              ✓ SUCCESS! If you receive this email, the notification system is working!
            </p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            <p style="font-size: 11px; color: #666;">Test ID: ${testAlert._id}</p>
          `;

          try {
            const result = await sendEmail({
              email: recipientEmail,
              subject: `🚨 TEST ALERT - Crisis Notification System`,
              html: emailHtml
            });
            
            if (result) {
              console.log(`  ✅ Email sent successfully!\n`);
              emailCount++;
            } else {
              console.log(`  ⚠️ Email function returned without sending\n`);
            }
          } catch (error) {
            console.log(`  ❌ Failed: ${error.message}\n`);
          }
        }
      }
    }

    // STEP 5: Summary
    console.log('\n=== TEST SUMMARY ===\n');
    console.log(`Test users created: ${createdUsers.length}`);
    console.log(`Users within radius: ${nearbyUsers.length}`);
    console.log(`Emails sent: ${emailCount}`);
    console.log(`\n${emailCount > 0 ? '✅' : '❌'} TEST ${emailCount > 0 ? 'PASSED' : 'FAILED'}\n`);
    
    if (emailCount > 0) {
      console.log('Check your email inbox!');
      console.log('If you received the email, the automatic notification system should work.\n');
    } else {
      console.log('No emails were sent. Check the logs above for errors.\n');
    }

    // Cleanup
    console.log('Cleaning up test data...\n');
    await User.deleteMany({ aadhaar: { $in: ['111111111111', '222222222222'] } });
    await Alert.deleteOne({ _id: testAlert._id });
    console.log('✓ Test data cleaned up\n');
    
    process.exit(emailCount > 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ Test Error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

completeTest();
