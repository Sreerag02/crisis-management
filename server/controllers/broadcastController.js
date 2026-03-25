const Broadcast = require('../models/Broadcast');
const asyncHandler = require('../middlewares/asyncHandler');

// @desc    Get all broadcasts
// @route   GET /api/broadcasts
// @access  Public
const getBroadcasts = asyncHandler(async (req, res) => {
  const broadcasts = await Broadcast.find({});
  res.json(broadcasts);
});

// @desc    Get single broadcast
// @route   GET /api/broadcasts/:id
// @access  Public
const getBroadcastById = asyncHandler(async (req, res) => {
  const broadcast = await Broadcast.findById(req.params.id);
  if (broadcast) {
    res.json(broadcast);
  } else {
    res.status(404);
    throw new Error('Broadcast not found');
  }
});

// @desc    Create a broadcast
// @route   POST /api/broadcasts
// @access  Public
const createBroadcast = asyncHandler(async (req, res) => {
  const { type, title, district, urgent, message, time } = req.body;
  const broadcast = new Broadcast({
    type,
    title,
    district,
    urgent,
    message,
    time
  });
  const createdBroadcast = await broadcast.save();
  res.status(201).json(createdBroadcast);
});

// @desc    Update a broadcast
// @route   PUT /api/broadcasts/:id
// @access  Public
const updateBroadcast = asyncHandler(async (req, res) => {
  const { type, title, district, urgent, message, time } = req.body;
  const broadcast = await Broadcast.findById(req.params.id);
  if (broadcast) {
    broadcast.type = type || broadcast.type;
    broadcast.title = title || broadcast.title;
    broadcast.district = district || broadcast.district;
    broadcast.urgent = urgent !== undefined ? urgent : broadcast.urgent;
    broadcast.message = message || broadcast.message;
    broadcast.time = time || broadcast.time;

    const updatedBroadcast = await broadcast.save();
    res.json(updatedBroadcast);
  } else {
    res.status(404);
    throw new Error('Broadcast not found');
  }
});

// @desc    Delete a broadcast
// @route   DELETE /api/broadcasts/:id
// @access  Public
const deleteBroadcast = asyncHandler(async (req, res) => {
  const broadcast = await Broadcast.findById(req.params.id);
  if (broadcast) {
    await broadcast.deleteOne();
    res.json({ message: 'Broadcast removed' });
  } else {
    res.status(404);
    throw new Error('Broadcast not found');
  }
});

module.exports = {
  getBroadcasts,
  getBroadcastById,
  createBroadcast,
  updateBroadcast,
  deleteBroadcast,
};
