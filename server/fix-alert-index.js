const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('./config/mongodb');

const Alert = require('./models/Alert');

const fixIndex = async () => {
  try {
    await connectDB();
    console.log('Connected to database');

    // Drop the existing 2dsphere index
    await Alert.collection.dropIndex('location_2dsphere');
    console.log('Dropped location_2dsphere index');

    // Recreate the index with background option
    await Alert.collection.createIndex({ location: '2dsphere' }, { background: true });
    console.log('Created new 2dsphere index (background)');

    process.exit(0);
  } catch (error) {
    console.error('Index fix failed:', error.message);
    // If index doesn't exist, that's fine
    if (error.codeName === 'IndexNotFound') {
      console.log('Index does not exist, creating new one...');
      await Alert.collection.createIndex({ location: '2dsphere' }, { background: true });
      console.log('Created new 2dsphere index');
      process.exit(0);
    }
    process.exit(1);
  }
};

fixIndex();
