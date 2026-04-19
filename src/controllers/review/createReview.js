const Review = require('../../models/Review');
const User = require('../../models/User');

exports.createReview = async (req, res) => {
  try {
    const { revieweeId, transactionId, rating, comment } = req.body;

    if (revieweeId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot review yourself' });
    }

    const existingReview = await Review.findOne({ reviewerId: req.user._id, transactionId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this transaction' });
    }

    const review = new Review({
      reviewerId: req.user._id,
      revieweeId,
      transactionId,
      rating,
      comment
    });

    await review.save();

    // Recalculate robust average rating
    const reviews = await Review.find({ revieweeId });
    const totalRating = reviews.reduce((acc, item) => acc + item.rating, 0);
    const averageRating = (totalRating / reviews.length).toFixed(1);

    await User.findByIdAndUpdate(revieweeId, {
      averageRating: Number(averageRating),
      reviewCount: reviews.length
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
