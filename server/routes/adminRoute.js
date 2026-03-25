const express = require('express');
const router = express.Router();
const { loginUser } = require('../controllers/userController');
const { 
  getAdminDashboard, 
  createIssue, 
  updateIssue, 
  deleteIssue 
} = require('../controllers/issueController');
const { getSOSAlerts } = require('../controllers/sosController');
// const { protect, admin } = require('../middlewares/auth');

router.post('/login', loginUser);
router.get('/dashboard', getAdminDashboard);
router.post('/issue', createIssue);
router.put('/issue/:id', updateIssue);
router.delete('/issue/:id', deleteIssue);
router.get('/sos-alerts', getSOSAlerts);

module.exports = router;
