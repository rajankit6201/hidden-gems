const express = require('express');
const router = express.Router();
const {
  getPlaces,
  getMyPlaces,
  getPlaceById,
  createPlace,
  updatePlace,
  deletePlace,
  toggleLike,
  addExperience
} = require('../controllers/placeController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getPlaces);
router.get('/my-places', protect, getMyPlaces);
router.get('/:id', getPlaceById);
router.post('/', protect, createPlace);
router.put('/:id', protect, updatePlace);
router.delete('/:id', protect, deletePlace);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/experience', protect, addExperience);

module.exports = router;