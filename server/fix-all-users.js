require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/mongodb');
const User = require('./models/userModel');

const fixAll = async () => {
  try {
    await connectDB();
    console.log('=== FIXING ALL USER LOCATIONS ===\n');

    // Remove location field from ALL users
    const result = await User.updateMany(
      {},
      { $unset: { location: 1 } }
    );
    
    console.log(`✓ Removed location from ${result.modifiedCount} users\n`);

    // Drop and recreate index
    try {
      await User.collection.dropIndex('location_2dsphere');
      console.log('✓ Dropped old index');
    } catch (err) {
      console.log('Index did not exist');
    }

    // Create sparse index - only indexes docs with valid location
    await User.collection.createIndex(
      { 'location.coordinates': '2dsphere' },
      { 
        sparse: true,
        background: true,
        name: 'location_sparse_2dsphere'
      }
    );
    
    console.log('✓ Created sparse geospatial index\n');
    console.log('✅ DONE! Now users will only have location if explicitly set.\n');
    console.log('Users should register family and CLICK THE MAP to set location.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

fixAll();
