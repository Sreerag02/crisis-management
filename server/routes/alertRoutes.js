const express = require('express');
const router = express.Router();
const {
  getAlerts,
  getAlertById,
  createAlert,
  updateAlert,
  deleteAlert,
} = require('../controllers/alertController');

router.route('/').get(getAlerts).post(createAlert);
router.route('/:id').get(getAlertById).put(updateAlert).delete(deleteAlert);

module.exports = router;
