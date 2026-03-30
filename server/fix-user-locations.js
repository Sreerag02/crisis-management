require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/mongodb');
const User = require('./models/userModel');

const fixLocations = async () => {
  try {
    await connectDB();
    console.log('Connected to database\n');

    // Find users with [0,0] location
    const users = await User.find({
      'location.coordinates.0': 0,
      'location.coordinates.1': 0
    });

    console.log(`Found ${users.length} users with [0,0] location\n`);

    for (const user of users) {
      console.log(`Removing location for: ${user.name} (${user.email})`);
      user.location = undefined;
      await user.save();
    }

    console.log(`\n✅ Fixed ${users.length} users`);
    console.log('Users must now set their location via the Family page map\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

fixLocations();
