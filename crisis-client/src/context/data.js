export const SHELTERS = [
  { id: 1, name: 'St. Mary’s School', district: 'Ernakulam', capacity: 500, occupied: 450, status: 'Near Full', facilities: ['Food', 'Water', 'Medical'] },
  { id: 2, name: 'Town Hall TVM', district: 'Thiruvananthapuram', capacity: 300, occupied: 120, status: 'Available', facilities: ['Food', 'Water', 'Sanitation'] },
  { id: 3, name: 'Govt College Thrissur', district: 'Thrissur', capacity: 400, occupied: 390, status: 'Near Full', facilities: ['Food', 'Water', 'Medical', 'Power'] },
  { id: 4, name: 'Community Center Kozhikode', district: 'Kozhikode', capacity: 250, occupied: 250, status: 'Full', facilities: ['Food', 'Water'] },
  { id: 5, name: 'NSS Camp TVM', district: 'Thiruvananthapuram', capacity: 150, occupied: 148, status: 'Full', facilities: ['Food', 'Water', 'Medical'] },
];

export const VOLUNTEERS = [
  { id: 1, name: 'Arjun Nair', skill: 'Rescue', district: 'Ernakulam', phone: '9876543210', status: 'Deployed' },
  { id: 2, name: 'Sita Ram', skill: 'Medical', district: 'Thrissur', phone: '9876543211', status: 'Active' },
  { id: 3, name: 'Kevin Paul', skill: 'Logistics', district: 'Kozhikode', phone: '9876543212', status: 'Active' },
  { id: 4, name: 'Anjali M.', skill: 'Medical', district: 'Thiruvananthapuram', phone: '9876543213', status: 'Deployed' },
  { id: 5, name: 'Rahul V.', skill: 'Rescue', district: 'Kannur', phone: '9876543214', status: 'Standby' },
];

export const BROADCASTS = [
  { id: 1, type: 'Donation', title: 'Dry Food Packets Needed', district: 'Ernakulam', urgent: true, time: '08:40', message: 'Urgent need for 500 dry food packets at Aluva collection center.' },
  { id: 2, type: 'Volunteer', title: 'Medical Volunteers Required', district: 'Thiruvananthapuram', urgent: false, time: '08:20', message: 'Nurses and doctors needed for camp at Central School.' },
  { id: 3, type: 'Information', title: 'Road Closure Update', district: 'Thrissur', urgent: true, time: '07:15', message: 'NH-544 blocked near Kuthiran due to minor landslide.' },
];

export const FAMILIES = [
  { id: 1, head: 'Ravi Kumar', members: 4, area: 'Aluva', status: 'safe' },
  { id: 2, head: 'Mary Joseph', members: 3, area: 'Chellanam', status: 'assist' },
  { id: 3, head: 'Basheer Ali', members: 6, area: 'Vypeen', status: 'danger' },
  { id: 4, head: 'Suresh G.', members: 2, area: 'Kochi', status: 'safe' },
];

export const RESOURCES = [
  { id: 1, type: 'Inflatable Boats', location: 'Ernakulam Port', total: 50, available: 12, unit: 'units' },
  { id: 2, type: 'Medical Kits', location: 'TVM Medical College', total: 1000, available: 450, unit: 'kits' },
  { id: 3, type: 'Life Jackets', location: 'Thrissur Fire Station', total: 300, available: 210, unit: 'units' },
  { id: 4, type: 'Water Cans (20L)', location: 'Kozhikode Depot', total: 2000, available: 100, unit: 'cans' },
];

export const ALERTS = [
  { id: 1, severity: 'critical', district: 'Ernakulam', title: 'RED ALERT: Extreme Rainfall', time: '08:00', message: 'Expected rainfall over 204mm in 24 hours. Move to safer locations.' },
  { id: 2, severity: 'high', district: 'Thrissur', title: 'ORANGE ALERT: High Winds', time: '09:30', message: 'Strong winds expected. Avoid travel and stay indoors.' },
  { id: 3, severity: 'medium', district: 'Kottayam', title: 'YELLOW ALERT: Rising Water Levels', time: '10:15', message: 'River levels are rising. Residents on banks should be vigilant.' },
];
