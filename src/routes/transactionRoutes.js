const express = require('express');
const router = express.Router();
const { createPaymentIntent, capturePayment } = require('../controllers/transaction');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Secure routes

router.post('/create-payment-intent', createPaymentIntent);
router.post('/capture', capturePayment);

module.exports = router;
