const express = require('express');
const router = express.Router();
const { getPhoneModels, getPhoneModelByDetails } = require('../controllers/phoneModel');

router.get('/', getPhoneModels);
router.get('/details', getPhoneModelByDetails);

module.exports = router;
