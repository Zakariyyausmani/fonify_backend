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

router.get('/', getListings);
router.get('/my-listings', getMyListings);
router.get('/:id', getListingById);
router.post('/', upload.array('images', 5), createListing);
router.put('/:id', upload.array('images', 5), updateListing);
router.delete('/:id', deleteListing);

module.exports = router;
