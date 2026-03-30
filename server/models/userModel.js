const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  aadhaar: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  familyGroup: String,
  familyMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['safe', 'evacuated', 'need_help', 'unknown'], default: 'unknown' },
  location: {
    type: { type: String, enum: 'Point' },
    coordinates: { type: [Number] } // [lng, lat] - optional
  },
  role: { type: String, enum: ['admin', 'user', 'volunteer'], default: 'user' },
  isAdmin: { type: Boolean, default: false }
}, { timestamps: true });

// Create 2dsphere index for geospatial queries (sparse - only indexes docs with location)
userSchema.index({ location: '2dsphere' }, { sparse: true });

module.exports = mongoose.model('User', userSchema);
