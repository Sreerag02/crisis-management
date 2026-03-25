const mongoose = require('mongoose');

const sosSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  mobile: String,
  aadhaar: String,
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true } // [lng, lat]
  },
  status: { type: String, enum: ['active', 'resolved'], default: 'active' }
}, { timestamps: true });

sosSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('SOS', sosSchema);
