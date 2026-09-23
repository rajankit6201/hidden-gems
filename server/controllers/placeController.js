const Place = require('../models/Place');

exports.createPlace = async (req, res) => {
  try {
    const { title, description, category, location, coordinates, images } = req.body;

    if (!images || images.length === 0) {
      return res.status(400).json({ message: 'At least one photo/video is required.' });
    }

    const newPlace = new Place({
      title,
      description,
      category,
      location,
      coordinates,
      images,
      createdBy: req.user ? req.user._id : null
    });

    await newPlace.save();
    res.status(201).json(newPlace);
  } catch (err) {
    res.status(500).json({ message: 'Error creating place record.', error: err.message });
  }
};

exports.addReview = async (req, res) => {
  try {
    const { rating, comment, userName } = req.body;
    const place = await Place.findById(req.params.id);

    if (!place) return res.status(404).json({ message: 'Place not found' });

    const newReview = {
      user: req.user ? req.user._id : null,
      userName: userName || 'Anonymous Explorer',
      rating: Number(rating),
      comment,
      createdAt: new Date()
    };

    place.reviews.unshift(newReview);
    await place.save();

    res.status(200).json(place);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add review.' });
  }
};