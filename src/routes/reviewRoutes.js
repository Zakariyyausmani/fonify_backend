const express = require('express');
const router = express.Router();
const { createReview } = require('../controllers/review');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Secure routes
router.post('/', createReview);

module.exports = router;
