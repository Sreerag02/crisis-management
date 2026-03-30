require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/mongodb');
const User = require('./models/userModel');

const checkUsers = async () => {
  try {
    await connectDB();
    console.log('=== CHECKING USER LOCATION DATA ===\n');

    // Get ALL users
    const allUsers = await User.find({});
    console.log(`Total users: ${allUsers.length}\n`);

    for (const user of allUsers) {
      console.log(`User: ${user.name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Location object:`, JSON.stringify(user.location, null, 2));
      console.log(`  Has valid coords: ${user.location && Array.isArray(user.location.coordinates) && user.location.coordinates.length === 2 && user.location.coordinates[0] !== 0 && user.location.coordinates[1] !== 0}`);
      console.log('---\n');
    }
    
    // Now test the $near query
    console.log('\n=== TESTING $near QUERY ===\n');
    
    const testLocation = [76.3419, 10.0159]; // Kochi
    
    const nearbyUsers = await User.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: testLocation
          },
          $maxDistance: 100000 // 100km - very large to catch all
        }
      }
    });
    
    console.log(`Users within 100km of Kochi: ${nearbyUsers.length}\n`);
    
    nearbyUsers.forEach(u => {
      console.log(`  - ${u.name}: [${u.location.coordinates?.[1]}, ${u.location.coordinates?.[0]}]`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

checkUsers();
