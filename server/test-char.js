require('dotenv').config({ override: true });
const uri = process.env.MONGO_URI;
console.log('URI:', uri);
console.log('Characters:');
for (let i = 0; i < uri.length; i++) {
  if (uri[i] === '@') {
    console.log(`@ at index ${i}`);
  }
}
