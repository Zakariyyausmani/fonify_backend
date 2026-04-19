const express = require('express');
const router = express.Router();
const {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  getMyListings
} = require('../controllers/listing');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const { listingValidationRules, validate } = require('../middleware/validation');

router.get('/', getListings);
router.get('/my-listings', protect, getMyListings);
router.get('/:id', getListingById);
router.post('/', protect, upload.array('images', 5), listingValidationRules(), validate, createListing);
router.put('/:id', protect, upload.array('images', 5), listingValidationRules(), validate, updateListing);
router.delete('/:id', protect, deleteListing);

module.exports = router;
