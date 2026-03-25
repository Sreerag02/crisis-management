const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  type: { type: String, required: true },
  location: { type: String, required: true },
  total: { type: Number, required: true },
  available: { type: Number, required: true },
  unit: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Resource', ResourceSchema);
