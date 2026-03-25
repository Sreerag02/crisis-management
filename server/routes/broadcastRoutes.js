const express = require('express');
const router = express.Router();
const {
  getBroadcasts,
  getBroadcastById,
  createBroadcast,
  updateBroadcast,
  deleteBroadcast,
} = require('../controllers/broadcastController');

router.route('/').get(getBroadcasts).post(createBroadcast);
router.route('/:id').get(getBroadcastById).put(updateBroadcast).delete(deleteBroadcast);

module.exports = router;
