const express = require('express');
const router = express.Router();
const { createPlace, addReview } = require('../controllers/placeController');

// Post new place
router.post('/', createPlace);

// Post new review for a place
router.post('/:id/reviews', addReview);

module.exports = router;