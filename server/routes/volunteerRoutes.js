const express = require('express');
const router = express.Router();
const {
  getVolunteers,
  getVolunteerById,
  createVolunteer,
  updateVolunteer,
  deleteVolunteer,
} = require('../controllers/volunteerController');

router.route('/').get(getVolunteers).post(createVolunteer);
router.route('/:id').get(getVolunteerById).put(updateVolunteer).delete(deleteVolunteer);

module.exports = router;
