const AuditLog = require('../models/AuditLog');
const { verifyAuditLog } = require('../utils/auditLogger');

// @desc    Get audit logs for an entity
// @route   GET /api/audit/:entityId
// @access  Private/Auditor
exports.getEntityAuditLogs = async (req, res) => {
  try {
    const auditLogs = await AuditLog.find({ entityId: req.params.entityId })
      .populate('actor', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: auditLogs.length,
      data: auditLogs
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all audit logs
// @route   GET /api/audit
// @access  Private/Auditor
exports.getAuditLogs = async (req, res) => {
  try {
    // Build query
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    query = AuditLog.find(JSON.parse(queryStr));

    // Select fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await AuditLog.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Populate with actor
    query = query.populate('actor', 'name email');

    // Execute query
    const auditLogs = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: auditLogs.length,
      pagination,
      data: auditLogs
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Verify audit log
// @route   GET /api/audit/:id/verify
// @access  Private/Auditor
exports.verifyAuditLogIntegrity = async (req, res) => {
  try {
    const isValid = await verifyAuditLog(req.params.id);

    res.status(200).json({
      success: true,
      data: {
        isValid
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};