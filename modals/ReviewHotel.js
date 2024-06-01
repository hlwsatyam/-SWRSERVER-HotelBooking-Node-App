const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel', // Reference to the Hotel model if you have one
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guest', // Reference to the User model if you have one
    required: true
  },
  revText: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
