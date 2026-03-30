const User = require('../models/userModel');
const Shelter = require('../models/Shelter');
const Alert = require('../models/Alert');
const asyncHandler = require('../middlewares/asyncHandler');

// @desc    Get all locations and alerts for heatmap
// @route   GET /api/heatmap/data
// @access  Public
const getHeatmapData = asyncHandler(async (req, res) => {
  const users = await User.find({ role: { $in: ['user', 'volunteer'] } }).select('name role status location mobile');
  const shelters = await Shelter.find({}).select('name status capacity occupied location');
  // Only return active (non-resolved) alerts
  const alerts = await Alert.find({ status: { $ne: 'resolved' } }).select('title message location radius severity status');

  const points = [
    ...users.filter(u => u.location && u.location.coordinates && u.location.coordinates.length >= 2).map(u => ({
      id: u._id,
      type: u.role,
      name: u.name,
      status: u.status,
      mobile: u.mobile,
      location: {
        lat: u.location.coordinates[1],
        lng: u.location.coordinates[0]
      }
    })),
    ...shelters.filter(s => s.location && s.location.coordinates && s.location.coordinates.length >= 2).map(s => ({
      id: s._id,
      type: 'shelter',
      name: s.name,
      status: s.status,
      capacity: s.capacity,
      occupied: s.occupied,
      location: {
        lat: s.location.coordinates[1],
        lng: s.location.coordinates[0]
      }
    }))
  ];

  const alertList = alerts
    .filter(a => a.location && a.location.coordinates && a.location.coordinates.length >= 2)
    .map(i => ({
      id: i._id,
      title: i.title,
      description: i.message,
      radius: i.radius || 1000,
      priority: i.severity || 'medium',
      status: i.status,
      location: {
        lat: i.location.coordinates[1],
        lng: i.location.coordinates[0]
      }
    }));

  res.json({ points, alerts: alertList });
});

module.exports = {
  getHeatmapData
};
