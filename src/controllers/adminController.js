const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const User = require('../models/User');
const Rule = require('../models/Rule');
const RuleEmbedding = require('../models/RuleEmbedding');
const { generateEmbedding } = require('../services/embeddingService');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalRules = await Rule.countDocuments();
    const activeRules = await Rule.countDocuments({ status: 'active' });

    // Calculate compliance (mock calculation for now, or based on future logging)
    const complianceRate = 98.5;

    // Category distribution
    const rulesByCategory = await Rule.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      totalUsers,
      totalRules,
      activeRules,
      complianceRate,
      rulesByCategory
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin)
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role || user.role;
    await user.save();

    res.status(200).json({ message: 'User role updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.deleteOne();
    res.status(200).json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Preview uploaded dataset columns and first few rows
// @route   POST /api/admin/preview-upload
// @access  Private (Admin)
exports.previewUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    let columns = [];
    let preview = [];
    let totalRows = 0;

    if (fileExtension === '.csv') {
      const { Readable } = require('stream');
      const results = [];
      const stream = Readable.from(req.file.buffer.toString()).pipe(csv());
      
      for await (const row of stream) {
        if (results.length < 5) results.push(row);
        totalRows++;
      }
      if (results.length > 0) {
        columns = Object.keys(results[0] || {});
      }
      preview = results;
    } else {
      const workbook = xlsx.read(req.file.buffer);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet);
      
      totalRows = data.length;
      if (data.length > 0) {
        columns = Object.keys(data[0] || {});
      }
      preview = data.slice(0, 5);
    }

    res.status(200).json({
      fileToken: 'memory', // No longer needed for disk lookup
      columns,
      preview,
      totalRows,
      detectedDatasetType: columns.some(c => c.toLowerCase().includes('sign')) ? 'signs' : 'rules'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error parsing file', error: error.message });
  }
};

// @desc    Map and import full dataset
// @route   POST /api/admin/import-dataset
// @access  Private (Admin)
exports.importDataset = async (req, res) => {
  const { fileToken, datasetType, province, mapping } = req.body;
  
  try {
    let rawData = [];
    
    if (req.file) {
      // Priority 1: Handle re-uploaded file (Memory)
      const fileExtension = path.extname(req.file.originalname).toLowerCase();
      if (fileExtension === '.csv') {
        const { Readable } = require('stream');
        const stream = Readable.from(req.file.buffer.toString()).pipe(csv());
        for await (const row of stream) {
          rawData.push(row);
        }
      } else {
        const workbook = xlsx.read(req.file.buffer);
        rawData = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
      }
    } else if (fileToken && fileToken !== 'memory') {
      // Priority 2: Handle disk file (Local Dev Legacy)
      const filePath = path.join(__dirname, '../../uploads/', fileToken);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File not found or expired' });
      }
      const fileExtension = path.extname(filePath).toLowerCase();
      if (fileExtension === '.csv') {
        const stream = fs.createReadStream(filePath).pipe(csv());
        for await (const row of stream) {
          rawData.push(row);
        }
      } else {
        const workbook = xlsx.readFile(filePath);
        rawData = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
      }
      // Cleanup
      try { fs.unlinkSync(filePath); } catch (e) {}
    } else {
      return res.status(400).json({ message: 'No file data found for import' });
    }

    let successCount = 0;
    let failedCount = 0;

    for (const row of rawData) {
      try {
        // 1. Map values
        const mappedData = {
          source: datasetType,
          province: province || 'Punjab',
          title: row[mapping.title],
          category: row[mapping.category],
          subcategory: row[mapping.subcategory] || null,
          rule_no: row[mapping.rule_no] || null,
          fine_motorcycle: row[mapping.fine_motorcycle] === 'N/A' ? null : row[mapping.fine_motorcycle],
          fine_private_vehicle: row[mapping.fine_private_vehicle] === 'N/A' ? null : row[mapping.fine_private_vehicle],
          fine_public_vehicle: row[mapping.fine_public_vehicle] === 'N/A' ? null : row[mapping.fine_public_vehicle],
          points_deducted: parseInt(row[mapping.points_deducted]) || 0,
          sign_meaning: row[mapping.sign_meaning] || null,
          description: row[mapping.description] || row[mapping.title],
          media_url: row[mapping.media_url] || null,
          extra_fields: {}
        };

        // 2. Store unmapped columns in extra_fields
        const mappedColumns = Object.values(mapping);
        Object.keys(row).forEach(key => {
          if (!mappedColumns.includes(key)) {
            mappedData.extra_fields[key] = row[key];
          }
        });

        if (!mappedData.title || !mappedData.category) {
            failedCount++;
            continue;
        }

        // 3. Save Rule
        const newRule = await Rule.create(mappedData);

        // 4. Generate Embedding Text
        let embeddingText = '';
        if (datasetType === 'rules') {
          embeddingText = `Rule: ${mappedData.title}. Category: ${mappedData.category}. Violation: ${mappedData.description || mappedData.title}. Motorcycle challan / fine: ${mappedData.fine_motorcycle || 'not applicable'}. Car / private vehicle challan / fine: ${mappedData.fine_private_vehicle || 'not applicable'}. Bus / public vehicle challan / fine: ${mappedData.fine_public_vehicle || 'not applicable'}. Points deducted from license: ${mappedData.points_deducted || 0}. Province: Punjab Pakistan.`.replace(/\s+/g, ' ').trim();
        } else {
          embeddingText = `Sign name: ${mappedData.title}. Category: ${mappedData.category}. Meaning: ${mappedData.sign_meaning || ''}. Description: ${mappedData.description || ''}. Province: Punjab Pakistan.`.replace(/\s+/g, ' ').trim();
        }

        // 5. Generate and Save Embedding
        const vector = await generateEmbedding(embeddingText);
        if (vector) {
            await RuleEmbedding.create({
              rule_id: newRule._id,
              source: datasetType,
              embedding: vector
            });
        }

        successCount++;
      } catch (err) {
        console.error('Row process error:', err);
        failedCount++;
      }
    }

    }

    res.status(200).json({
      success: true,
      processed: successCount,
      failed: failedCount,
      total: rawData.length
    });

  } catch (error) {
    res.status(500).json({ message: 'Import failed', error: error.message });
  }
};
