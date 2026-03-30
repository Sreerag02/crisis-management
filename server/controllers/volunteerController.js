const Volunteer = require('../models/Volunteer');
const asyncHandler = require('../middlewares/asyncHandler');
const bcrypt = require('bcryptjs');

// @desc    Get all volunteers
// @route   GET /api/volunteers
// @access  Public
const getVolunteers = asyncHandler(async (req, res) => {
  const volunteers = await Volunteer.find({}).select('-password');
  res.json(volunteers);
});

// @desc    Get single volunteer
// @route   GET /api/volunteers/:id
// @access  Public
const getVolunteerById = asyncHandler(async (req, res) => {
  const volunteer = await Volunteer.findById(req.params.id).select('-password');
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
  const { name, email, password, skill, district, phone, status, location } = req.body;
  
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  const volunteer = new Volunteer({
    name,
    email,
    password: hashedPassword,
    skill,
    district,
    phone,
    status,
    location: location ? {
      type: 'Point',
      coordinates: [parseFloat(location.lng), parseFloat(location.lat)]
    } : undefined
  });
  
  const createdVolunteer = await volunteer.save();
  res.status(201).json({
    _id: createdVolunteer._id,
    name: createdVolunteer.name,
    email: createdVolunteer.email,
    skill: createdVolunteer.skill,
    district: createdVolunteer.district,
    phone: createdVolunteer.phone,
    status: createdVolunteer.status
  });
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
