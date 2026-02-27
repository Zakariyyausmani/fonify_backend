const express = require('express');
const router = express.Router();
const {
  getPendingListings,
  updateListingStatus,
  getAllUsers,
  updateUserRole,
  getPendingVerifications,
  updateUserVerificationStatus
} = require('../controllers/admin');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect);
router.use(admin);

router.get('/listings/pending', getPendingListings);
router.put('/listings/:id/status', updateListingStatus);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.get('/verifications/pending', getPendingVerifications);
router.put('/users/:id/verification', updateUserVerificationStatus);

module.exports = router;
