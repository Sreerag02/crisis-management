const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('./config/mongodb');

const Alert = require('./models/Alert');

const cleanup = async () => {
  try {
    await connectDB();
    console.log('Connected to database');

    // Find alerts with incomplete location data
    const badAlerts = await Alert.find({
      'location.type': 'Point',
      $or: [
        { 'location.coordinates': { $exists: false } },
        { 'location.coordinates': { $size: 0 } },
        { 'location.coordinates': null }
      ]
    });

    console.log(`Found ${badAlerts.length} alerts with bad location data`);

    // Delete them
    if (badAlerts.length > 0) {
      const result = await Alert.deleteMany({
        'location.type': 'Point',
        $or: [
          { 'location.coordinates': { $exists: false } },
          { 'location.coordinates': { $size: 0 } },
          { 'location.coordinates': null }
        ]
      });
      console.log(`Deleted ${result.deletedCount} bad alerts`);
    }

    console.log('Cleanup complete');
    process.exit(0);
  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
  }
};

cleanup();
