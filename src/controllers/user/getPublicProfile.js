const User = require('../../models/User');
const Listing = require('../../models/Listing');

exports.getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name profileImage city isVerified createdAt');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const activeListings = await Listing.find({ seller: user._id, status: 'approved' })
      .select('brand model price images condition createdAt year');

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        profileImage: user.profileImage,
        city: user.city,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
      activeListings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
