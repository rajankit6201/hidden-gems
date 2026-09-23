const Place = require('../models/Place');

// @desc    Get All Places with Optional Filters (State, City, Category, Timing, Sort)
// @route   GET /api/places
exports.getPlaces = async (req, res) => {
  try {
    const { state, city, category, bestTimeToVisit, search, sort } = req.query;
    let query = {};

    if (state) query.state = new RegExp(state, 'i');
    if (city) query.city = new RegExp(city, 'i');
    if (category) query.category = category;
    if (bestTimeToVisit) query.bestTimeToVisit = new RegExp(bestTimeToVisit, 'i');
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { area: { $regex: search, $options: 'i' } },
        { story: { $regex: search, $options: 'i' } }
      ];
    }

    let placesQuery = Place.find(query);

    // Sorting Option
    if (sort === 'likes') {
      placesQuery = placesQuery.sort({ likes: -1 });
    } else if (sort === 'oldest') {
      placesQuery = placesQuery.sort({ createdAt: 1 });
    } else {
      placesQuery = placesQuery.sort({ createdAt: -1 }); // Newest first
    }

    const places = await placesQuery;
    return res.status(200).json(places);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get Places Created By Logged-in User
// @route   GET /api/places/my-places
exports.getMyPlaces = async (req, res) => {
  try {
    const places = await Place.find({ authorId: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json(places);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get Single Place By ID
// @route   GET /api/places/:id
exports.getPlaceById = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }
    return res.status(200).json(place);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Create New Place Spot
// @route   POST /api/places
exports.createPlace = async (req, res) => {
  try {
    const {
      title,
      area,
      state,
      city,
      category,
      bestTimeToVisit,
      bestSeasons,
      suitableFor,
      safetyRating,
      coordinates,
      images,
      travelTips,
      story
    } = req.body;

    if (!title || !area || !category || !coordinates || !images || images.length === 0) {
      return res.status(400).json({ message: 'Title, area, category, coordinates, and images are required.' });
    }

    const newPlace = await Place.create({
      title,
      area,
      state: state || 'Madhya Pradesh',
      city: city || 'Bhopal',
      category,
      bestTimeToVisit,
      bestSeasons: bestSeasons || [],
      suitableFor: suitableFor || [],
      safetyRating,
      coordinates,
      images,
      travelTips,
      story,
      author: req.user.name,
      authorEmail: req.user.email,
      authorId: req.user.id,
      likes: []
    });

    return res.status(201).json(newPlace);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update Place (Enforces Immutability on area, coordinates, authorId, authorEmail)
// @route   PUT /api/places/:id
exports.updatePlace = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);

    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }

    if (place.authorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this spot' });
    }

    // Strip immutable fields from updates if provided in req.body
    delete req.body.area;
    delete req.body.coordinates;
    delete req.body.authorId;
    delete req.body.authorEmail;

    const updatedPlace = await Place.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    return res.status(200).json(updatedPlace);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Delete Place Spot
// @route   DELETE /api/places/:id
exports.deletePlace = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);

    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }

    if (place.authorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this spot' });
    }

    await place.deleteOne();
    return res.status(200).json({ message: 'Spot deleted successfully', id: req.params.id });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle Like Place
// @route   POST /api/places/:id/like
exports.toggleLike = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);

    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }

    const userId = req.user.id;
    const isLiked = place.likes.includes(userId);

    if (isLiked) {
      place.likes = place.likes.filter((id) => id.toString() !== userId);
    } else {
      place.likes.push(userId);
    }

    await place.save();
    return res.status(200).json({ likes: place.likes, placeId: place._id });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Add Experience / Review to Place
// @route   POST /api/places/:id/experience
exports.addExperience = async (req, res) => {
  try {
    const { rating, vibeTag, companionType, comment } = req.body;
    const place = await Place.findById(req.params.id);

    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }

    const newExperience = {
      userId: req.user.id,
      userName: req.user.name,
      rating: Number(rating),
      vibeTag: vibeTag || 'Peaceful',
      companionType: companionType || 'Friends',
      comment
    };

    place.experiences.push(newExperience);
    await place.save();

    return res.status(201).json(place);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};