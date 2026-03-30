require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/mongodb');
const User = require('./models/userModel');

const cleanup = async () => {
  try {
    await connectDB();
    console.log('Connected to database\n');

    // Find users with incomplete location (type but no coordinates)
    const users = await User.find({
      'location.type': 'Point',
      $or: [
        { 'location.coordinates': { $exists: false } },
        { 'location.coordinates': null },
        { 'location.coordinates': { $size: 0 } }
      ]
    });

    console.log(`Found ${users.length} users with incomplete location\n`);

    for (const user of users) {
      console.log(`Fixing: ${user.name} (${user.email})`);
      user.location = undefined;
      await user.save();
    }

    console.log(`\n✅ Fixed ${users.length} users`);
    
    // Recreate index
    try {
      await User.collection.dropIndex('location_2dsphere');
      console.log('✓ Dropped old index');
    } catch (err) {
      console.log('Index did not exist');
    }

    await User.collection.createIndex({ location: '2dsphere' }, { 
      sparse: true,
      background: true 
    });
    console.log('✓ Created sparse index\n');
    
    console.log('✅ DONE! User registration should work now.\n');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

cleanup();
