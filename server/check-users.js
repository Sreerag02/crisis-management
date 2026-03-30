require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/mongodb');
const User = require('./models/userModel');
const Family = require('./models/Family');

const checkUsers = async () => {
  try {
    await connectDB();
    console.log('=== CHECKING DATABASE STATE ===\n');

    // Check all users
    const users = await User.find({});
    console.log(`Total users: ${users.length}`);
    
    let usersWithEmail = 0;
    let usersWithLocation = 0;
    let usersWithBoth = 0;
    
    users.forEach(u => {
      const hasEmail = !!u.email;
      const hasLocation = u.location && u.location.coordinates && u.location.coordinates.length === 2;
      
      if (hasEmail) usersWithEmail++;
      if (hasLocation) usersWithLocation++;
      if (hasEmail && hasLocation) usersWithBoth++;
      
      console.log(`\nUser: ${u.name}`);
      console.log(`  Email: ${u.email || '❌ NONE'}`);
      console.log(`  Role: ${u.role}`);
      console.log(`  Location: ${hasLocation ? `✓ ${u.location.coordinates}` : '❌ NONE'}`);
      console.log(`  Family Members: ${u.familyMembers ? u.familyMembers.length : 0}`);
    });
    
    console.log('\n\n=== SUMMARY ===');
    console.log(`Users with email: ${usersWithEmail}`);
    console.log(`Users with location: ${usersWithLocation}`);
    console.log(`Users with BOTH (can receive alerts): ${usersWithBoth}`);
    
    // Check families
    const families = await Family.find({});
    console.log(`\nTotal families: ${families.length}`);
    families.forEach(f => {
      console.log(`\nFamily: ${f.head}`);
      console.log(`  Email: ${f.email || '❌ NONE'}`);
      console.log(`  Members: ${f.members ? f.members.length : 0}`);
      if (f.members && f.members.length > 0) {
        f.members.forEach((m, i) => {
          console.log(`    ${i+1}. ${m.name} - ${m.email || '❌ No email'}`);
        });
      }
    });
    
    console.log('\n\n💡 TIP: For email alerts to work:');
    console.log('   1. Users must have email addresses');
    console.log('   2. Users must have location set (click map in Family page)');
    console.log('   3. Family members must have email addresses\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkUsers();
