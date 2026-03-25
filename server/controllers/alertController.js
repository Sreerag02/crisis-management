const Alert = require('../models/Alert');
const asyncHandler = require('../middlewares/asyncHandler');

// @desc    Get all alerts
// @route   GET /api/alerts
// @access  Public
const getAlerts = asyncHandler(async (req, res) => {
  const alerts = await Alert.find({});
  res.json(alerts);
});

// @desc    Get single alert
// @route   GET /api/alerts/:id
// @access  Public
const getAlertById = asyncHandler(async (req, res) => {
  const alert = await Alert.findById(req.params.id);
  if (alert) {
    res.json(alert);
  } else {
    res.status(404);
    throw new Error('Alert not found');
  }
});

// @desc    Create an alert
// @route   POST /api/alerts
// @access  Public
const createAlert = asyncHandler(async (req, res) => {
  const { severity, district, title, message, time } = req.body;
  const alert = new Alert({
    severity,
    district,
    title,
    message,
    time
  });
  const createdAlert = await alert.save();
  res.status(201).json(createdAlert);
});

// @desc    Update an alert
// @route   PUT /api/alerts/:id
// @access  Public
const updateAlert = asyncHandler(async (req, res) => {
  const { severity, district, title, message, time } = req.body;
  const alert = await Alert.findById(req.params.id);
  if (alert) {
    alert.severity = severity || alert.severity;
    alert.district = district || alert.district;
    alert.title = title || alert.title;
    alert.message = message || alert.message;
    alert.time = time || alert.time;

    const updatedAlert = await alert.save();
    res.json(updatedAlert);
  } else {
    res.status(404);
    throw new Error('Alert not found');
  }
});

// @desc    Delete an alert
// @route   DELETE /api/alerts/:id
// @access  Public
const deleteAlert = asyncHandler(async (req, res) => {
  const alert = await Alert.findById(req.params.id);
  if (alert) {
    await alert.deleteOne();
    res.json({ message: 'Alert removed' });
  } else {
    res.status(404);
    throw new Error('Alert not found');
  }
});

module.exports = {
  getAlerts,
  getAlertById,
  createAlert,
  updateAlert,
  deleteAlert,
};
