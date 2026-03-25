const mongoose = require('mongoose');

const BroadcastSchema = new mongoose.Schema({
  type: { type: String, enum: ['Donation', 'Volunteer', 'Information'], required: true },
  title: { type: String, required: true },
  district: { type: String, required: true },
  urgent: { type: Boolean, default: false },
  message: { type: String, required: true },
  time: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Broadcast', BroadcastSchema);
