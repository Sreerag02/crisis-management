const mongoose = require('mongoose');

const ShelterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  district: { type: String, required: true },
  capacity: { type: Number, required: true },
  occupied: { type: Number, default: 0 },
  status: { type: String, enum: ['Available', 'Near Full', 'Full'], default: 'Available' },
  facilities: [String],
}, { timestamps: true });

module.exports = mongoose.model('Shelter', ShelterSchema);
