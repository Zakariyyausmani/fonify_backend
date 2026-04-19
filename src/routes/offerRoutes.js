const express = require('express');
const router = express.Router();
const { createOffer, respondOffer } = require('../controllers/offer');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Secure routes

router.post('/', createOffer);
router.put('/respond', respondOffer);

module.exports = router;
