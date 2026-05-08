const Rule = require('../models/Rule');

// @desc    Get all rules with filtering and pagination
exports.getRules = async (req, res) => {
  try {
    const { 
      source = 'rules', 
      category, 
      subcategory, 
      province = 'Punjab', 
      page = 1, 
      limit = 20, 
      vehicleType, // motorcycle, private, public
      search 
    } = req.query;

    let query = { source, province };

    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { rule_no: { $regex: search, $options: 'i' } }
      ];
    }

    // Vehicle specific filter: only show rules where the fine is applicable (not null)
    if (vehicleType) {
      if (vehicleType === 'motorcycle') query.fine_motorcycle = { $ne: null };
      if (vehicleType === 'private') query.fine_private_vehicle = { $ne: null };
      if (vehicleType === 'public') query.fine_public_vehicle = { $ne: null };
    }

    const total = await Rule.countDocuments(query);
    const rules = await Rule.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      rules,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get single rule
// @route   GET /api/rules/:id
// @access  Public
exports.getRuleById = async (req, res) => {
  try {
    const rule = await Rule.findById(req.params.id);
    if (!rule) {
      return res.status(404).json({ message: 'Rule not found' });
    }
    res.status(200).json(rule);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create new rule
// @route   POST /api/rules
// @access  Private (Admin)
exports.createRule = async (req, res) => {
  try {
    const { ruleNumber, title, description, category, subcategory, fineAmount, punishment, severity, mediaUrl } = req.body;

    const ruleExists = await Rule.findOne({ ruleNumber });
    if (ruleExists) {
      return res.status(400).json({ message: 'Rule already exists' });
    }

    const rule = await Rule.create({
      ruleNumber,
      title,
      description,
      category,
      subcategory,
      fineAmount,
      punishment,
      severity,
      mediaUrl
    });

    res.status(201).json(rule);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update a rule
// @route   PUT /api/rules/:id
// @access  Private (Admin)
exports.updateRule = async (req, res) => {
  try {
    const rule = await Rule.findById(req.params.id);

    if (!rule) {
      return res.status(404).json({ message: 'Rule not found' });
    }

    const updatedRule = await Rule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedRule);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get dynamic categories and subcategories
// @route   GET /api/rules/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const { source = 'rules', province = 'Punjab' } = req.query;
    
    const results = await Rule.aggregate([
      { $match: { source, province } },
      {
        $group: {
          _id: "$category",
          totalRules: { $sum: 1 },
          subcategories: { $addToSet: "$subcategory" }
        }
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          totalRules: 1,
          subcategories: {
             $filter: {
               input: "$subcategories",
               as: "sub",
               cond: { $ne: ["$$sub", null] }
             }
          }
        }
      },
      { $sort: { category: 1 } }
    ]);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Bulk upload rules
// @route   POST /api/rules/bulk-upload
// @access  Private (Admin)
exports.bulkUploadRules = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a CSV or Excel file' });
    }

    const path = require('path');
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    let rules = [];

    if (fileExtension === '.csv') {
      const { Readable } = require('stream');
      const csv = require('csv-parser');
      const results = [];
      const stream = Readable.from(req.file.buffer.toString());

      stream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          await processRules(results, res);
        });
    } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
      const xlsx = require('xlsx');
      const workbook = xlsx.read(req.file.buffer);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      rules = xlsx.utils.sheet_to_json(sheet);
      await processRules(rules, res);
    } else {
      return res.status(400).json({ message: 'Unsupported file format' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Helper to process and save rules
async function processRules(data, res) {
  try {
    const formattedRules = data.map(r => ({
      ruleNumber: r.ruleNumber || r.RuleNumber || r.id || `R${Math.floor(Math.random() * 10000)}`,
      title: r.title || r.Title || r.name || 'Untitled Rule',
      description: r.description || r.Description || r.desc || 'No description provided',
      category: r.category || r.Category || 'Traffic',
      subcategory: r.subcategory || r.Subcategory || 'General',
      fineAmount: parseInt(r.fineAmount || r.FineAmount || r.penalty || 0),
      punishment: r.punishment || r.Punishment || 'Fine Only',
      severity: r.severity || r.Severity || 'Medium',
      mediaUrl: r.mediaUrl || r.MediaUrl || ''
    }));

    const result = await Rule.insertMany(formattedRules, { ordered: false });

    res.status(201).json({
      message: 'Rules uploaded successfully',
      count: result.length
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(201).json({
        message: 'Rules processed with some duplicates skipped',
        count: error.result.nInserted
      });
    }
    res.status(500).json({ message: 'Error saving rules', error: error.message });
  }
}
