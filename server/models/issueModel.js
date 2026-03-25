const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true } // [lng, lat]
  },
  priority: { type: String, enum: ['critical', 'high', 'medium', 'low'], default: 'medium' },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: Date,
  notifiedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['active', 'resolved'], default: 'active' }
}, { timestamps: true });

issueSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Issue', issueSchema);
