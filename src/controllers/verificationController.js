const VerificationReport = require('../models/VerificationReport');
const Listing = require('../models/Listing');
const { createNotification } = require('./notificationController');

// @desc    Request a physical verification
// @route   POST /api/verification/request
// @access  Private (Buyer)
exports.requestVerification = async (req, res) => {
  try {
    const { listingId } = req.body;

    // Check if listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    // Check if report already exists for this buyer and listing
    const existingReport = await VerificationReport.findOne({ listingId, buyerId: req.user._id });
    if (existingReport) return res.status(400).json({ message: 'Verification already requested' });

    const report = new VerificationReport({
      listingId,
      buyerId: req.user._id,
      status: 'requested'
    });

    await report.save();
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all verification requests (Admin/Agent)
// @route   GET /api/verification/requests
// @access  Private (Agent/Admin)
exports.getVerificationRequests = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'agent') {
      query = { $or: [{ status: 'requested' }, { agentId: req.user._id }] };
    }

    const reports = await VerificationReport.find(query)
      .populate('listingId', 'brand model images price')
      .populate('buyerId', 'name phoneNumber');
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign an agent to a verification request
// @route   PUT /api/verification/:id/assign
// @access  Private (Agent)
exports.assignAgent = async (req, res) => {
  try {
    const report = await VerificationReport.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    if (report.status !== 'requested') {
      return res.status(400).json({ message: 'Already assigned or completed' });
    }

    report.agentId = req.user._id;
    report.status = 'assigned';
    await report.save();

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit verification report
// @route   PUT /api/verification/:id/submit
// @access  Private (Agent)
exports.submitReport = async (req, res) => {
  try {
    const report = await VerificationReport.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    if (report.agentId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    report.checks = req.body.checks;
    report.comments = req.body.comments;
    report.reportImages = req.body.reportImages;
    report.status = 'completed';
    report.completedDate = Date.now();

    await report.save();

    // Update listing verification status
    const listing = await Listing.findByIdAndUpdate(report.listingId, { verificationStatus: 'verified' });

    // Notify the buyer
    await createNotification(
      report.buyerId,
      'Verification Report Ready',
      `The physical inspection report for ${listing.brand} ${listing.model} is now available.`,
      'verification_ready',
      listing._id
    );

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get report detail for buyer
// @route   GET /api/verification/listing/:listingId
// @access  Private
exports.getReportByListing = async (req, res) => {
  try {
    const report = await VerificationReport.findOne({
      listingId: req.params.listingId,
      buyerId: req.user._id,
      status: 'completed'
    }).populate('agentId', 'name profileImage');

    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
