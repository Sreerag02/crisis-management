const mongoose = require('mongoose');

const ShelterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  district: { type: String, required: true },
  capacity: { type: Number, required: true },
  occupied: { type: Number, default: 0 },
  status: { type: String, enum: ['Available', 'Near Full', 'Full'], default: 'Available' },
  facilities: [String],
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number] } // [lng, lat] - optional
  }
}, { timestamps: true });

ShelterSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Shelter', ShelterSchema);
