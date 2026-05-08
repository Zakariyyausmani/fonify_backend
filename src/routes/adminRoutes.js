const express = require('express');
const router = express.Router();
const {
  getPendingListings,
  updateListingStatus,
  getAllUsers,
  updateUserRole,
  getPendingVerifications,
  updateUserVerificationStatus,
  getVerificationChats,
  getFinancials,
  getReports,
  getAllChats,
  handleReport,
  createCategory,
  getCategories,
  deleteCategory,
  updateCategory,
  bulkUpdateListings,
  getActivityLogs,
  sendBroadcast,
  getApprovedListings,
  getDisputedTransactions,
  resolveDispute,
  updateUserStatus,
  getSystemPulse,
} = require('../controllers/admin');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect);
router.use(admin);

// Dashboard & Stats
router.get('/pulse', getSystemPulse);
router.get('/financials', getFinancials);

// Trust & Safety
router.get('/reports', getReports);
router.put('/reports/:id/action', handleReport);
router.get('/chats', getAllChats);

// Listing Management
router.get('/listings/pending', getPendingListings);
router.get('/listings/approved', getApprovedListings);
router.put('/listings/:id/status', updateListingStatus);
router.post('/listings/bulk', bulkUpdateListings);

// User Management
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/status', updateUserStatus);

// Verifications
router.get('/verifications/pending', getPendingVerifications);
router.get('/verifications/:id/chats', getVerificationChats);
router.put('/users/:id/verification', updateUserVerificationStatus);

// Activity Logs
router.get('/logs', getActivityLogs);

// Broadcast Notification
router.post('/broadcast', sendBroadcast);
 
// Categories
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Disputes
router.get('/disputes', getDisputedTransactions);
router.put('/disputes/:id/action', resolveDispute);

module.exports = router;
