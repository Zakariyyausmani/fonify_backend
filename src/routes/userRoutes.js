const express = require('express');
const router = express.Router();
const { toggleMode, updateProfile, getFavorites, toggleFavorite, verifyIdentity, updateShopInfo } = require('../controllers/user');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect); // All user routes are protected

router.put('/toggle-mode', toggleMode);
router.put('/profile', upload.fields([{ name: 'profileImage', maxCount: 1 }]), updateProfile);
router.put('/setup-shop', updateShopInfo);
router.get('/favorites', getFavorites);
router.post('/favorites/:id', toggleFavorite);
router.post('/verify-identity', upload.fields([
  { name: 'cnicFront', maxCount: 1 },
  { name: 'cnicBack', maxCount: 1 },
  { name: 'selfie', maxCount: 1 }
]), verifyIdentity);

module.exports = router;
