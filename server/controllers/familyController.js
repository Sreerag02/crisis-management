const Family = require('../models/Family');
const User = require('../models/userModel');
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
  const { head, email, mobile, members, totalMembers, area, location, status } = req.body;

  const family = new Family({
    head,
    email,
    mobile,
    members: members || [],
    totalMembers: totalMembers || (members ? members.length : 1),
    area,
    location,
    status
  });

  const createdFamily = await family.save();
  
  // If the family head is a registered user, link family members for notifications
  if (email) {
    const user = await User.findOne({ email });
    if (user && members && members.length > 0) {
      // Create or find user accounts for family members with emails
      const familyMemberIds = [];
      
      for (const member of members) {
        if (member.email) {
          // Try to find existing user or create new one for family member
          let memberUser = await User.findOne({ email: member.email });
          
          if (!memberUser) {
            memberUser = await User.create({
              name: member.name,
              email: member.email,
              mobile: member.mobile || '',
              aadhaar: member.aadhaar || '',
              password: 'family_member_' + Date.now(), // Temporary password
              familyGroup: createdFamily._id,
              location: location // Same location as family home
            });
          }
          
          familyMemberIds.push(memberUser._id);
        }
      }
      
      // Link family members to the head's user account
      if (familyMemberIds.length > 0) {
        user.familyMembers = [...new Set([...(user.familyMembers || []), ...familyMemberIds])];
        user.familyGroup = createdFamily._id;
        await user.save();
      }
    }
  }
  
  res.status(201).json(createdFamily);
});

// @desc    Update a family
// @route   PUT /api/families/:id
// @access  Public
const updateFamily = asyncHandler(async (req, res) => {
  const { head, email, mobile, members, totalMembers, area, location, status } = req.body;
  const family = await Family.findById(req.params.id);
  if (family) {
    family.head = head || family.head;
    family.email = email || family.email;
    family.mobile = mobile || family.mobile;
    family.members = members || family.members;
    family.totalMembers = totalMembers || family.totalMembers;
    family.area = area || family.area;
    family.location = location || family.location;
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
