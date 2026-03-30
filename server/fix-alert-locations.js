require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/mongodb');
const Alert = require('./models/Alert');

const fixAlerts = async () => {
  try {
    await connectDB();
    console.log('Connected to database\n');

    // Find alerts with incomplete location data
    const badAlerts = await Alert.find({
      'location.type': 'Point',
      $or: [
        { 'location.coordinates': { $exists: false } },
        { 'location.coordinates': null },
        { 'location.coordinates': { $size: 0 } }
      ]
    });

    console.log(`Found ${badAlerts.length} alerts with incomplete location data\n`);

    if (badAlerts.length > 0) {
      console.log('Fixing alerts by removing invalid location data...\n');
      
      for (const alert of badAlerts) {
        console.log(`Fixing alert: "${alert.title}"`);
        // Remove the invalid location completely
        alert.location = undefined;
        await alert.save();
      }

      console.log(`\n✅ Fixed ${badAlerts.length} alerts`);
    } else {
      console.log('✅ No bad alerts found');
    }

    // Also fix by allowing null locations in the future
    console.log('\nDropping and recreating location index...\n');
    try {
      await Alert.collection.dropIndex('location_2dsphere');
      console.log('✓ Dropped old index');
    } catch (err) {
      console.log('Index did not exist, creating new one...');
    }

    await Alert.collection.createIndex({ location: '2dsphere' }, { 
      background: true,
      sparse: true  // Only index documents that have the location field
    });
    console.log('✓ Created new sparse index (allows null locations)\n');

    console.log('✅ All done! Alerts should now resolve properly.\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

fixAlerts();
