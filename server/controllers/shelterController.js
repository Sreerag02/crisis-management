const Shelter = require('../models/Shelter');
const asyncHandler = require('../middlewares/asyncHandler');

// @desc    Get all shelters
// @route   GET /api/shelters
// @access  Public
const getShelters = asyncHandler(async (req, res) => {
  const shelters = await Shelter.find({});
  res.json(shelters);
});

// @desc    Get single shelter
// @route   GET /api/shelters/:id
// @access  Public
const getShelterById = asyncHandler(async (req, res) => {
  const shelter = await Shelter.findById(req.params.id);
  if (shelter) {
    res.json(shelter);
  } else {
    res.status(404);
    throw new Error('Shelter not found');
  }
});

// @desc    Create a shelter
// @route   POST /api/shelters
// @access  Private/Admin
const createShelter = asyncHandler(async (req, res) => {
  const { name, district, capacity, occupied, status, facilities } = req.body;
  const shelter = new Shelter({
    name,
    district,
    capacity,
    occupied,
    status,
    facilities
  });
  const createdShelter = await shelter.save();
  res.status(201).json(createdShelter);
});

// @desc    Update a shelter
// @route   PUT /api/shelters/:id
// @access  Private/Admin
const updateShelter = asyncHandler(async (req, res) => {
  const { name, district, capacity, occupied, status, facilities } = req.body;
  const shelter = await Shelter.findById(req.params.id);
  if (shelter) {
    shelter.name = name || shelter.name;
    shelter.district = district || shelter.district;
    shelter.capacity = capacity || shelter.capacity;
    shelter.occupied = occupied || shelter.occupied;
    shelter.status = status || shelter.status;
    shelter.facilities = facilities || shelter.facilities;

    const updatedShelter = await shelter.save();
    res.json(updatedShelter);
  } else {
    res.status(404);
    throw new Error('Shelter not found');
  }
});

// @desc    Delete a shelter
// @route   DELETE /api/shelters/:id
// @access  Private/Admin
const deleteShelter = asyncHandler(async (req, res) => {
  const shelter = await Shelter.findById(req.params.id);
  if (shelter) {
    await shelter.deleteOne();
    res.json({ message: 'Shelter removed' });
  } else {
    res.status(404);
    throw new Error('Shelter not found');
  }
});

module.exports = {
  getShelters,
  getShelterById,
  createShelter,
  updateShelter,
  deleteShelter,
};
