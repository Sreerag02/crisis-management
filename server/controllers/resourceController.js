const Resource = require('../models/Resource');
const asyncHandler = require('../middlewares/asyncHandler');

// @desc    Get all resources
// @route   GET /api/resources
// @access  Public
const getResources = asyncHandler(async (req, res) => {
  const resources = await Resource.find({});
  res.json(resources);
});

// @desc    Get single resource
// @route   GET /api/resources/:id
// @access  Public
const getResourceById = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);
  if (resource) {
    res.json(resource);
  } else {
    res.status(404);
    throw new Error('Resource not found');
  }
});

// @desc    Create a resource
// @route   POST /api/resources
// @access  Public
const createResource = asyncHandler(async (req, res) => {
  const { type, location, total, available, unit } = req.body;
  const resource = new Resource({
    type,
    location,
    total,
    available,
    unit
  });
  const createdResource = await resource.save();
  res.status(201).json(createdResource);
});

// @desc    Update a resource
// @route   PUT /api/resources/:id
// @access  Public
const updateResource = asyncHandler(async (req, res) => {
  const { type, location, total, available, unit } = req.body;
  const resource = await Resource.findById(req.params.id);
  if (resource) {
    resource.type = type || resource.type;
    resource.location = location || resource.location;
    resource.total = total || resource.total;
    resource.available = available || resource.available;
    resource.unit = unit || resource.unit;

    const updatedResource = await resource.save();
    res.json(updatedResource);
  } else {
    res.status(404);
    throw new Error('Resource not found');
  }
});

// @desc    Delete a resource
// @route   DELETE /api/resources/:id
// @access  Public
const deleteResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);
  if (resource) {
    await resource.deleteOne();
    res.json({ message: 'Resource removed' });
  } else {
    res.status(404);
    throw new Error('Resource not found');
  }
});

module.exports = {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
};
