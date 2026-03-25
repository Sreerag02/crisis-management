const express = require('express');
const router = express.Router();
const {
  getFamilies,
  getFamilyById,
  createFamily,
  updateFamily,
  deleteFamily,
} = require('../controllers/familyController');

router.route('/').get(getFamilies).post(createFamily);
router.route('/:id').get(getFamilyById).put(updateFamily).delete(deleteFamily);

module.exports = router;
