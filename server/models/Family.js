const mongoose = require('mongoose');

const FamilySchema = new mongoose.Schema({
  head: { type: String, required: true },
  members: { type: Number, required: true },
  area: { type: String, required: true },
  status: { type: String, enum: ['safe', 'assist', 'danger'], default: 'safe' },
}, { timestamps: true });

module.exports = mongoose.model('Family', FamilySchema);
