require('dotenv').config();
console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
if (process.env.MONGO_URI) {
  const parts = process.env.MONGO_URI.split('@');
  console.log('Parts after @ split:', parts.length);
  console.log('Hostname part:', parts[parts.length - 1]);
}
