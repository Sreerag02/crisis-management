const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  severity: { type: String, enum: ['critical', 'high', 'medium', 'low'], required: true },
  district: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  time: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Alert', AlertSchema);
