const Family = require('../models/Family');
const asyncHandler = require('../middlewares/asyncHandler');

// @desc    Get all families
// @route   GET /api/families
// @access  Public
const getFamilies = asyncHandler(async (req, res) => {
  const families = await Family.find({});
  res.json(families);
});

// @desc    Get single family
// @route   GET /api/families/:id
// @access  Public
const getFamilyById = asyncHandler(async (req, res) => {
  const family = await Family.findById(req.params.id);
  if (family) {
    res.json(family);
  } else {
    res.status(404);
    throw new Error('Family not found');
  }
});

// @desc    Create a family
// @route   POST /api/families
// @access  Public
const createFamily = asyncHandler(async (req, res) => {
  const { head, members, area, status } = req.body;
  const family = new Family({
    head,
    members,
    area,
    status
  });
  const createdFamily = await family.save();
  res.status(201).json(createdFamily);
});

// @desc    Update a family
// @route   PUT /api/families/:id
// @access  Public
const updateFamily = asyncHandler(async (req, res) => {
  const { head, members, area, status } = req.body;
  const family = await Family.findById(req.params.id);
  if (family) {
    family.head = head || family.head;
    family.members = members || family.members;
    family.area = area || family.area;
    family.status = status || family.status;

    const updatedFamily = await family.save();
    res.json(updatedFamily);
  } else {
    res.status(404);
    throw new Error('Family not found');
  }
});

// @desc    Delete a family
// @route   DELETE /api/families/:id
// @access  Public
const deleteFamily = asyncHandler(async (req, res) => {
  const family = await Family.findById(req.params.id);
  if (family) {
    await family.deleteOne();
    res.json({ message: 'Family removed' });
  } else {
    res.status(404);
    throw new Error('Family not found');
  }
});

module.exports = {
  getFamilies,
  getFamilyById,
  createFamily,
  updateFamily,
  deleteFamily,
};
