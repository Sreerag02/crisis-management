require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/mongodb');
const User = require('./models/userModel');

const cleanup = async () => {
  try {
    await connectDB();
    console.log('=== CLEANING UP USER LOCATIONS ===\n');

    // Find users with location.type but no valid coordinates
    const badUsers = await User.find({
      'location.type': { $exists: true },
      $or: [
        { 'location.coordinates': { $exists: false } },
        { 'location.coordinates': null },
        { 'location.coordinates': { $size: 0 } },
        { 'location.coordinates.0': { $exists: false } },
        { 'location.coordinates.1': { $exists: false } }
      ]
    });

    console.log(`Found ${badUsers.length} users with invalid locations\n`);

    for (const user of badUsers) {
      console.log(`Removing invalid location from: ${user.name} (${user.email})`);
      user.location = undefined;
      await user.save();
    }

    console.log(`\n✅ Cleaned ${badUsers.length} users`);
    console.log('Users must set location via Family page (click map)\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

cleanup();
