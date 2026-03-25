const Volunteer = require('../models/Volunteer');
const asyncHandler = require('../middlewares/asyncHandler');

// @desc    Get all volunteers
// @route   GET /api/volunteers
// @access  Public
const getVolunteers = asyncHandler(async (req, res) => {
  const volunteers = await Volunteer.find({});
  res.json(volunteers);
});

// @desc    Get single volunteer
// @route   GET /api/volunteers/:id
// @access  Public
const getVolunteerById = asyncHandler(async (req, res) => {
  const volunteer = await Volunteer.findById(req.params.id);
  if (volunteer) {
    res.json(volunteer);
  } else {
    res.status(404);
    throw new Error('Volunteer not found');
  }
});

// @desc    Create a volunteer
// @route   POST /api/volunteers
// @access  Public
const createVolunteer = asyncHandler(async (req, res) => {
  const { name, skill, district, phone, status } = req.body;
  const volunteer = new Volunteer({
    name,
    skill,
    district,
    phone,
    status
  });
  const createdVolunteer = await volunteer.save();
  res.status(201).json(createdVolunteer);
});

// @desc    Update a volunteer
// @route   PUT /api/volunteers/:id
// @access  Public
const updateVolunteer = asyncHandler(async (req, res) => {
  const { name, skill, district, phone, status } = req.body;
  const volunteer = await Volunteer.findById(req.params.id);
  if (volunteer) {
    volunteer.name = name || volunteer.name;
    volunteer.skill = skill || volunteer.skill;
    volunteer.district = district || volunteer.district;
    volunteer.phone = phone || volunteer.phone;
    volunteer.status = status || volunteer.status;

    const updatedVolunteer = await volunteer.save();
    res.json(updatedVolunteer);
  } else {
    res.status(404);
    throw new Error('Volunteer not found');
  }
});

// @desc    Delete a volunteer
// @route   DELETE /api/volunteers/:id
// @access  Public
const deleteVolunteer = asyncHandler(async (req, res) => {
  const volunteer = await Volunteer.findById(req.params.id);
  if (volunteer) {
    await volunteer.deleteOne();
    res.json({ message: 'Volunteer removed' });
  } else {
    res.status(404);
    throw new Error('Volunteer not found');
  }
});

module.exports = {
  getVolunteers,
  getVolunteerById,
  createVolunteer,
  updateVolunteer,
  deleteVolunteer,
};
