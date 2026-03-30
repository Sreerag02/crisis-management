const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  severity: { type: String, enum: ['critical', 'high', 'medium', 'low'], required: true },
  district: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  time: { type: String },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number] } // [lng, lat] - optional
  },
  radius: { type: Number, default: 1000 },
  status: { type: String, enum: ['active', 'resolved'], default: 'active' },
  resolvedAt: { type: Date }
}, { 
  timestamps: true,
  // Skip validation on location if it's incomplete
  strict: false 
});

// Create sparse index - only indexes documents with complete location
AlertSchema.index({ 'location.coordinates': '2dsphere' }, { 
  sparse: true,
  background: true 
});

module.exports = mongoose.model('Alert', AlertSchema);
