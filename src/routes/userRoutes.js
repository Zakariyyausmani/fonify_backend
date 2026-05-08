const express = require('express');
const router = express.Router();
const multer = require('multer');
const { toggleMode, updateProfile, getFavorites, toggleFavorite, verifyIdentity, updateShopInfo, getPublicProfile, getAdminContact } = require('../controllers/user');
const { protect } = require('../middleware/authMiddleware');
const { storage } = require('../config/cloudinaryConfig');

const upload = multer({ storage });

router.use(protect);

router.put('/toggle-mode', toggleMode);
router.put('/profile', upload.fields([{ name: 'profileImage', maxCount: 1 }]), updateProfile);
router.post('/profile', upload.fields([{ name: 'profileImage', maxCount: 1 }]), updateProfile);
router.put('/setup-shop', updateShopInfo);
router.get('/favorites', getFavorites);
router.post('/favorites/:id', toggleFavorite);
router.get('/admin-contact', getAdminContact);
router.get('/:id/public', getPublicProfile);
router.post('/verify-identity', upload.fields([
  { name: 'cnicFront', maxCount: 1 },
  { name: 'cnicBack', maxCount: 1 },
  { name: 'selfie', maxCount: 1 }
]), verifyIdentity);

module.exports = router;
