const Issue = require('../models/issueModel');

// @desc    Create new issue (Admin or Client)
// @route   POST /api/admin/issue or POST /api/client/report-issue
// @access  Private
const createIssue = async (req, res) => {
  const { title, description, lat, lng, priority } = req.body;

  const issue = await Issue.create({
    title,
    description,
    location: {
      type: 'Point',
      coordinates: [parseFloat(lng), parseFloat(lat)]
    },
    priority,
    reportedBy: req.user ? req.user._id : null
  });

  res.status(201).json(issue);
};

// @desc    Get dashboard alerts/issues (Admin)
// @route   GET /api/admin/dashboard?lat=<lat>&lng=<lng>
// @access  Private/Admin
const getAdminDashboard = async (req, res) => {
  const { lat, lng } = req.query;

  let query = { status: 'active' };

  if (lat && lng) {
    const issues = await Issue.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          }
        }
      }
    }).sort({ priority: 1 }); // Sort by distance and then priority (or vice-versa)
    
    // Note: $near automatically sorts by distance. 
    // To sort by priority first, we might need a different approach or manual sorting.
    // However, MongoDB's $near sorts by distance.
    // Let's do a manual sort for priority if distance is similar or just let it be.
    
    return res.json(issues);
  }

  const issues = await Issue.find(query).sort({ priority: 1, createdAt: -1 });
  res.json(issues);
};

// @desc    Get nearby alerts for clients
// @route   GET /api/client/alerts?lat=<lat>&lng=<lng>
// @access  Public
const getNearbyAlerts = async (req, res) => {
  const { lat, lng } = req.query;

  if (lat && lng) {
    const issues = await Issue.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          }
        }
      }
    });
    return res.json(issues);
  }

  const issues = await Issue.find({ status: 'active' }).sort({ createdAt: -1 });
  res.json(issues);
};

// @desc    Update issue
// @route   PUT /api/admin/issue/:id
// @access  Private/Admin
const updateIssue = async (req, res) => {
  const issue = await Issue.findById(req.params.id);

  if (issue) {
    issue.title = req.body.title || issue.title;
    issue.description = req.body.description || issue.description;
    issue.priority = req.body.priority || issue.priority;
    issue.status = req.body.status || issue.status;
    if (req.body.status === 'resolved') {
      issue.resolvedAt = Date.now();
    }

    const updatedIssue = await issue.save();
    res.json(updatedIssue);
  } else {
    res.status(404).json({ message: 'Issue not found' });
  }
};

// @desc    Delete issue
// @route   DELETE /api/admin/issue/:id
// @access  Private/Admin
const deleteIssue = async (req, res) => {
  const issue = await Issue.findById(req.params.id);

  if (issue) {
    await issue.deleteOne();
    res.json({ message: 'Issue removed' });
  } else {
    res.status(404).json({ message: 'Issue not found' });
  }
};

module.exports = {
  createIssue,
  getAdminDashboard,
  getNearbyAlerts,
  updateIssue,
  deleteIssue
};
