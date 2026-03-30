const mongoose = require('mongoose');

const FamilySchema = new mongoose.Schema({
  head: { type: String, required: true },
  email: { type: String },
  mobile: { type: String },
  members: [{
    name: { type: String, required: true },
    aadhaar: { type: String },
    mobile: { type: String },
    email: { type: String },
    relation: { type: String, default: 'Family' }
  }],
  totalMembers: { type: Number, default: 1 },
  area: { type: String, required: true },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number] } // [lng, lat]
  },
  status: { type: String, enum: ['safe', 'assist', 'danger'], default: 'safe' },
}, { timestamps: true });

FamilySchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Family', FamilySchema);
