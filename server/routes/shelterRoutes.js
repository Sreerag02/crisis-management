const express = require('express');
const router = express.Router();
const {
  getShelters,
  getShelterById,
  getNearbyShelters,
  createShelter,
  updateShelter,
  deleteShelter,
} = require('../controllers/shelterController');

router.route('/').get(getShelters).post(createShelter);
router.get('/nearby', getNearbyShelters);
router.route('/:id').get(getShelterById).put(updateShelter).delete(deleteShelter);

module.exports = router;
