const express = require('express');
const router = express.Router();
const { registerUser, loginUser, updateUserStatus } = require('../controllers/userController');
const { triggerSOS } = require('../controllers/sosController');
const { getNearbyAlerts } = require('../controllers/issueController');
// const { protect } = require('../middlewares/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/sos', triggerSOS);
router.post('/status', updateUserStatus);
router.get('/alerts', getNearbyAlerts);

module.exports = router;
