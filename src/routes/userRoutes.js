const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');
const {
  updateProfileImage,
  toggleBookmark,
  getBookmarks
} = require('../controllers/userController');

const { storage } = require('../config/cloudinaryConfig');
const upload = multer({ storage });

router.post('/profile-image', protect, upload.single('image'), updateProfileImage);
router.post('/bookmarks/:ruleId', protect, toggleBookmark);
router.get('/bookmarks', protect, getBookmarks);
router.get('/profile', protect, require('../controllers/userController').getProfile);

module.exports = router;
