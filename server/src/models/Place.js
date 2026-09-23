const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String, required: true },
  visitDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
  rating: { type: Number, required: true, min: 1, max: 5 },
  vibeTag: { type: String, default: 'Peaceful' },
  companionType: { type: String, default: 'Friends' },
  comment: { type: String, required: true }
}, { timestamps: true });

const placeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  area: { type: String, required: true, immutable: true },
  state: { type: String, default: 'Madhya Pradesh' },
  city: { type: String, default: 'Bhopal' },
  category: { type: String, required: true },
  bestTimeToVisit: { type: String, required: true },
  bestSeasons: [{ type: String }],
  suitableFor: [{ type: String }],
  safetyRating: { type: String, required: true },
  coordinates: {
    lat: { type: Number, required: true, immutable: true },
    lng: { type: Number, required: true, immutable: true }
  },
  images: [{ type: String, required: true }],
  travelTips: {
    roadCondition: String,
    parking: String,
    fee: String
  },
  story: { type: String, required: true },
  author: { type: String, required: true },
  authorEmail: { type: String, required: true, immutable: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, immutable: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  experiences: [experienceSchema]
}, { timestamps: true });

module.exports = mongoose.model('Place', placeSchema);