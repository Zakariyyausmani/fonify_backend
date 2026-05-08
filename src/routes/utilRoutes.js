const express = require('express');
const router = express.Router();
const cities = require('../utils/cities');

router.get('/cities', (req, res) => {
  res.json({
    success: true,
    data: cities
  });
});

module.exports = router;
