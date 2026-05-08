const { requestVerification } = require('./requestVerification');
const { getVerificationRequests } = require('./getVerificationRequests');
const { assignAgent } = require('./assignAgent');
const { submitReport } = require('./submitReport');
const { getReportByListing } = require('./getReportByListing');
const { scheduleMeeting } = require('./scheduleMeeting');

module.exports = {
  requestVerification,
  getVerificationRequests,
  assignAgent,
  submitReport,
  getReportByListing,
  scheduleMeeting
};
