const express = require('express');
const router = express.Router();
const {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  getMyListings
} = require('../controllers/listingController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', getListings);
router.get('/my-listings', protect, getMyListings);
router.get('/:id', getListingById);
router.post('/', protect, upload.array('images', 5), createListing);
router.put('/:id', protect, upload.array('images', 5), updateListing);
router.delete('/:id', protect, deleteListing);

module.exports = router;
