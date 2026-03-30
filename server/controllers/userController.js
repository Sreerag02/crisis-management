const User = require('../models/userModel');
const Volunteer = require('../models/Volunteer');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// @desc    Register a new user
// @route   POST /api/client/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, aadhaar, mobile, familyGroup, role } = req.body;

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
    familyGroup,
    role: role || 'user'
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
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

  let user;

  // Check for admin login from .env credentials
  const adminEmail = process.env.ADMIN_USER;
  const adminPass = process.env.ADMIN_PASS;
  
  if (email === adminEmail && password === adminPass) {
    // Admin login from environment variables
    user = {
      _id: 'admin_' + Date.now(),
      name: 'Administrator',
      email: adminEmail,
      role: 'admin',
      isAdmin: true
    };
  } else {
    // Check if logging in as volunteer
    const volunteer = await Volunteer.findOne({ email });
    if (volunteer && (await bcrypt.compare(password, volunteer.password))) {
      user = {
        _id: volunteer._id,
        name: volunteer.name,
        email: volunteer.email,
        role: 'volunteer',
        volunteerId: volunteer._id
      };
    } else {
      // Regular user login with email
      const regularUser = await User.findOne({ email });
      if (regularUser && (await bcrypt.compare(password, regularUser.password))) {
        user = {
          _id: regularUser._id,
          name: regularUser.name,
          email: regularUser.email,
          role: regularUser.role || 'user',
          isAdmin: regularUser.isAdmin
        };
      }
    }
  }

  if (user) {
    const token = generateToken(user._id);
    res.json({
      ...user,
      token,
      avatar: user.name?.charAt(0)?.toUpperCase() || 'A'
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

    // Emit status update via socket
    const io = req.app.get('socketio');
    if (io) {
      io.emit('status_updated', {
        userId: user._id,
        status: user.status,
        location: user.location
      });
    }

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
