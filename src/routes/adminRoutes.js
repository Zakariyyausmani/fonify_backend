const express = require('express');
const router = express.Router();
const { getDashboardStats, getUsers, updateUserRole, deleteUser, previewUpload, importDataset } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/stats', protect, admin, getDashboardStats);
router.get('/users', protect, admin, getUsers);
router.put('/users/:id/role', protect, admin, updateUserRole);
router.delete('/users/:id', protect, admin, deleteUser);

// RAG Dataset Management
router.post('/preview-upload', protect, admin, upload.single('file'), previewUpload);
router.post('/import-dataset', protect, admin, upload.single('file'), importDataset);

module.exports = router;
