const mongoose = require('mongoose');

const VolunteerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  password: { type: String, required: true },
  skill: { type: String, required: true },
  district: { type: String, required: true },
  phone: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Deployed', 'Standby'], default: 'Active' },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number] } // [lng, lat]
  }
}, { timestamps: true });

VolunteerSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Volunteer', VolunteerSchema);
