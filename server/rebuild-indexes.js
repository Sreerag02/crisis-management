require('dotenv').config();
const connectDB = require('./config/mongodb');
const User = require('./models/userModel');
const Family = require('./models/Family');
const Alert = require('./models/Alert');
const Shelter = require('./models/Shelter');

const rebuildIndexes = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();

    console.log('\n=== Rebuilding Indexes ===\n');

    // Drop and recreate User indexes
    console.log('User indexes:');
    await User.collection.dropIndexes().catch(() => {});
    await User.collection.createIndex({ location: '2dsphere' }, { sparse: true });
    const userIndexes = await User.collection.indexes();
    console.log(userIndexes);

    // Drop and recreate Family indexes
    console.log('\nFamily indexes:');
    await Family.collection.dropIndexes().catch(() => {});
    await Family.collection.createIndex({ location: '2dsphere' });
    const familyIndexes = await Family.collection.indexes();
    console.log(familyIndexes);

    // Drop and recreate Alert indexes
    console.log('\nAlert indexes:');
    await Alert.collection.dropIndexes().catch(() => {});
    await Alert.collection.createIndex({ 'location.coordinates': '2dsphere' }, { sparse: true });
    const alertIndexes = await Alert.collection.indexes();
    console.log(alertIndexes);

    // Drop and recreate Shelter indexes
    console.log('\nShelter indexes:');
    await Shelter.collection.dropIndexes().catch(() => {});
    await Shelter.collection.createIndex({ location: '2dsphere' });
    const shelterIndexes = await Shelter.collection.indexes();
    console.log(shelterIndexes);

    console.log('\n✅ All indexes rebuilt successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error rebuilding indexes:', error);
    process.exit(1);
  }
};

rebuildIndexes();
