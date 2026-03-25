const mongoose = require('mongoose');

const VolunteerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  skill: { type: String, required: true },
  district: { type: String, required: true },
  phone: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Deployed', 'Standby'], default: 'Active' },
}, { timestamps: true });

module.exports = mongoose.model('Volunteer', VolunteerSchema);
