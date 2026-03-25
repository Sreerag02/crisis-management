const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Alert = require('./models/Alert');
const Broadcast = require('./models/Broadcast');
const Family = require('./models/Family');
const Resource = require('./models/Resource');
const Shelter = require('./models/Shelter');
const Volunteer = require('./models/Volunteer');
const Issue = require('./models/issueModel');

dotenv.config();

const SHELTERS = [
  { name: 'St. Mary’s School', district: 'Ernakulam', capacity: 500, occupied: 450, status: 'Near Full', facilities: ['Food', 'Water', 'Medical'] },
  { name: 'Town Hall TVM', district: 'Thiruvananthapuram', capacity: 300, occupied: 120, status: 'Available', facilities: ['Food', 'Water', 'Sanitation'] },
  { name: 'Govt College Thrissur', district: 'Thrissur', capacity: 400, occupied: 390, status: 'Near Full', facilities: ['Food', 'Water', 'Medical', 'Power'] },
  { name: 'Community Center Kozhikode', district: 'Kozhikode', capacity: 250, occupied: 250, status: 'Full', facilities: ['Food', 'Water'] },
  { name: 'NSS Camp TVM', district: 'Thiruvananthapuram', capacity: 150, occupied: 148, status: 'Full', facilities: ['Food', 'Water', 'Medical'] },
];

const VOLUNTEERS = [
  { name: 'Arjun Nair', skill: 'Rescue', district: 'Ernakulam', phone: '9876543210', status: 'Deployed' },
  { name: 'Sita Ram', skill: 'Medical', district: 'Thrissur', phone: '9876543211', status: 'Active' },
  { name: 'Kevin Paul', skill: 'Logistics', district: 'Kozhikode', phone: '9876543212', status: 'Active' },
  { name: 'Anjali M.', skill: 'Medical', district: 'Thiruvananthapuram', phone: '9876543213', status: 'Deployed' },
  { name: 'Rahul V.', skill: 'Rescue', district: 'Kannur', phone: '9876543214', status: 'Standby' },
];

const BROADCASTS = [
  { type: 'Donation', title: 'Dry Food Packets Needed', district: 'Ernakulam', urgent: true, time: '08:40', message: 'Urgent need for 500 dry food packets at Aluva collection center.' },
  { type: 'Volunteer', title: 'Medical Volunteers Required', district: 'Thiruvananthapuram', urgent: false, time: '08:20', message: 'Nurses and doctors needed for camp at Central School.' },
  { type: 'Information', title: 'Road Closure Update', district: 'Thrissur', urgent: true, time: '07:15', message: 'NH-544 blocked near Kuthiran due to minor landslide.' },
];

const FAMILIES = [
  { head: 'Ravi Kumar', members: 4, area: 'Aluva', status: 'safe' },
  { head: 'Mary Joseph', members: 3, area: 'Chellanam', status: 'assist' },
  { head: 'Basheer Ali', members: 6, area: 'Vypeen', status: 'danger' },
  { head: 'Suresh G.', members: 2, area: 'Kochi', status: 'safe' },
];

const RESOURCES = [
  { type: 'Inflatable Boats', location: 'Ernakulam Port', total: 50, available: 12, unit: 'units' },
  { type: 'Medical Kits', location: 'TVM Medical College', total: 1000, available: 450, unit: 'kits' },
  { type: 'Life Jackets', location: 'Thrissur Fire Station', total: 300, available: 210, unit: 'units' },
  { type: 'Water Cans (20L)', location: 'Kozhikode Depot', total: 2000, available: 100, unit: 'cans' },
];

const ALERTS = [
  { severity: 'critical', district: 'Ernakulam', title: 'RED ALERT: Extreme Rainfall', time: '08:00', message: 'Expected rainfall over 204mm in 24 hours. Move to safer locations.' },
  { severity: 'high', district: 'Thrissur', title: 'ORANGE ALERT: High Winds', time: '09:30', message: 'Strong winds expected. Avoid travel and stay indoors.' },
  { severity: 'medium', district: 'Kottayam', title: 'YELLOW ALERT: Rising Water Levels', time: '10:15', message: 'River levels are rising. Residents on banks should be vigilant.' },
];

const ISSUES = [
  { title: 'Flood in Aluva', description: 'Water level rising rapidly', location: { coordinates: [76.35, 10.11] }, priority: 'critical' },
  { title: 'Landslide in Wayanad', description: 'Road blocked due to landslide', location: { coordinates: [76.08, 11.68] }, priority: 'high' },
  { title: 'Tree fallen in Kochi', description: 'Traffic interrupted near MG Road', location: { coordinates: [76.28, 9.98] }, priority: 'medium' },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    await Alert.deleteMany();
    await Alert.insertMany(ALERTS);

    await Broadcast.deleteMany();
    await Broadcast.insertMany(BROADCASTS);

    await Family.deleteMany();
    await Family.insertMany(FAMILIES);

    await Resource.deleteMany();
    await Resource.insertMany(RESOURCES);

    await Shelter.deleteMany();
    await Shelter.insertMany(SHELTERS);

    await Volunteer.deleteMany();
    await Volunteer.insertMany(VOLUNTEERS);

    await Issue.deleteMany();
    await Issue.insertMany(ISSUES);

    console.log('Database Seeded Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedDB();
