const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['Lakes', 'Forts & History', 'Nature & Trails', 'Food & Cafes', 'Hidden Spots']
    },
    location: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true, default: 0 },
      lng: { type: Number, required: true, default: 0 }
    },
    images: [{ type: String, required: true }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        userName: String,
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: String,
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Place', placeSchema);