require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/mongodb');
const Alert = require('./models/Alert');

const cleanupAlerts = async () => {
  try {
    await connectDB();
    console.log('Connected to database\n');

    // Find ALL alerts and check each one
    const allAlerts = await Alert.find({});
    console.log(`Total alerts: ${allAlerts.length}\n`);

    let fixed = 0;
    for (const alert of allAlerts) {
      const hasValidLocation = 
        alert.location && 
        alert.location.coordinates && 
        Array.isArray(alert.location.coordinates) && 
        alert.location.coordinates.length === 2;

      if (!hasValidLocation) {
        console.log(`⚠️  Alert "${alert.title}" has invalid location:`, alert.location);
        
        // Completely remove the invalid location
        const result = await Alert.updateOne(
          { _id: alert._id },
          { 
            $unset: { location: 1 },
            $set: { 
              status: alert.status || 'active',
              resolvedAt: alert.resolvedAt || null
            }
          }
        );
        
        if (result.modifiedCount > 0) {
          console.log(`   ✓ Fixed - removed invalid location\n`);
          fixed++;
        }
      }
    }

    console.log(`\n✅ Fixed ${fixed} alerts with invalid locations`);
    
    // Recreate index
    console.log('\nRecreating geospatial index...\n');
    try {
      await Alert.collection.dropIndex('location.coordinates_2dsphere');
      console.log('✓ Dropped old index');
    } catch (err) {
      console.log('Index did not exist');
    }

    await Alert.collection.createIndex({ 'location.coordinates': '2dsphere' }, { 
      sparse: true,
      background: true 
    });
    console.log('✓ Created new sparse index\n');

    console.log('✅ DONE! Now you can resolve alerts without errors.\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

cleanupAlerts();
