const express = require('express');
const router = express.Router();
const { registerUser, loginUser, updateUserStatus } = require('../controllers/userController');
const { triggerSOS, respondToSOS } = require('../controllers/sosController');
const { getNearbyAlerts } = require('../controllers/issueController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/sos', triggerSOS);
router.post('/sos/:id/respond', respondToSOS);
router.post('/status', updateUserStatus);
router.get('/alerts', getNearbyAlerts);

module.exports = router;
