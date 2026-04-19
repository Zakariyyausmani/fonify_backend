const express = require('express');
const router = express.Router();
const {
  requestVerification,
  getVerificationRequests,
  assignAgent,
  submitReport,
  getReportByListing,
  scheduleMeeting
} = require('../controllers/verification');
const { protect, agent } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/request', requestVerification);
router.get('/listing/:listingId', getReportByListing);

// Agent restricted routes
router.get('/requests', agent, getVerificationRequests);
router.put('/:id/assign', agent, assignAgent);
router.put('/:id/schedule', agent, scheduleMeeting);
router.put('/:id/submit', agent, submitReport);

module.exports = router;
