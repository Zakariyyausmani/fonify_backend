const express = require('express');
const router = express.Router();
const { getRules, getRuleById, createRule, updateRule, deleteRule, bulkUploadRules, getCategories } = require('../controllers/ruleController');
const { protect, admin } = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = require('../middleware/uploadMiddleware');

router.get('/', getRules);
router.get('/categories', getCategories);
router.get('/:id', getRuleById);

// Protected Admin Routes
router.post('/', protect, admin, createRule);
router.put('/:id', protect, admin, updateRule);
router.delete('/:id', protect, admin, deleteRule);
router.post('/bulk-upload', protect, admin, upload.single('file'), bulkUploadRules);

module.exports = router;
