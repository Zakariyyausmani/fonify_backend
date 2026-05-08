const express = require('express');
const router = express.Router();
const { createReport } = require('../controllers/report');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Secure routes
router.post('/', createReport);

module.exports = router;
