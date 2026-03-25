const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');

// @desc    Register a new user
// @route   POST /api/client/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, aadhaar, mobile, familyGroup } = req.body;

  const userExists = await User.findOne({ $or: [{ email }, { aadhaar }] });

  if (userExists) {
    return res.status(400).json({ message: 'User already exists with this email or Aadhaar' });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    aadhaar,
    mobile,
    familyGroup
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      aadhaar: user.aadhaar,
      token: generateToken(user._id)
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/client/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id)
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

// @desc    Update personal safety status
// @route   POST /api/client/status
// @access  Private
const updateUserStatus = async (req, res) => {
  const { status, lat, lng } = req.body;
  const user = await User.findById(req.user._id).populate('familyMembers', 'name');

  if (user) {
    user.status = status || user.status;
    if (lat && lng) {
      user.location = {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)]
      };
    }
    await user.save();

    let message = `Status updated to ${user.status}.`;
    if (user.familyGroup && user.familyMembers.length > 0) {
      const names = user.familyMembers.map(m => m.name).join(', ');
      message += ` Your family members [${names}] are also notified.`;
    }

    res.json({ message, user });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  updateUserStatus
};
