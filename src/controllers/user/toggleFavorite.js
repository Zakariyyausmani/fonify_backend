const User = require('../../models/User');

// @desc    Add/Remove from favorites
// @route   POST /api/users/favorites/:id
// @access  Private
exports.toggleFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const listingId = req.params.id;

    if (user.favorites.includes(listingId)) {
      user.favorites = user.favorites.filter(id => id.toString() !== listingId);
    } else {
      user.favorites.push(listingId);
    }

    await user.save();
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
