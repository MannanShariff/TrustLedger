const Vendor = require('../models/Vendor');
const { createAuditLog } = require('../utils/auditLogger');

// @desc    Create new vendor
// @route   POST /api/vendors
// @access  Private/Admin
exports.createVendor = async (req, res) => {
  try {
    // Add user to req.body
    req.body.createdBy = req.user.id;

    // Create vendor
    const vendor = await Vendor.create(req.body);

    // Create audit log
    await createAuditLog(
      'Vendor',
      vendor._id,
      'create',
      req.user.id,
      req.body
    );

    res.status(201).json({
      success: true,
      data: vendor
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all vendors
// @route   GET /api/vendors
// @access  Private
exports.getVendors = async (req, res) => {
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
    query = Vendor.find(JSON.parse(queryStr));

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
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Vendor.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Execute query
    const vendors = await query;

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
      count: vendors.length,
      pagination,
      data: vendors
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single vendor
// @route   GET /api/vendors/:id
// @access  Private
exports.getVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id).populate('transactions');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: `Vendor not found with id of ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: vendor
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update vendor
// @route   PUT /api/vendors/:id
// @access  Private/Admin
exports.updateVendor = async (req, res) => {
  try {
    // Get vendor before update for audit log
    const oldVendor = await Vendor.findById(req.params.id);

    if (!oldVendor) {
      return res.status(404).json({
        success: false,
        message: `Vendor not found with id of ${req.params.id}`
      });
    }

    // Update vendor
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Create audit log with diff
    const diff = {};
    for (const key in req.body) {
      if (oldVendor[key] !== req.body[key]) {
        diff[key] = {
          old: oldVendor[key],
          new: req.body[key]
        };
      }
    }

    await createAuditLog(
      'Vendor',
      vendor._id,
      'update',
      req.user.id,
      diff
    );

    res.status(200).json({
      success: true,
      data: vendor
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete vendor
// @route   DELETE /api/vendors/:id
// @access  Private/Admin
exports.deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: `Vendor not found with id of ${req.params.id}`
      });
    }

    await vendor.deleteOne();

    // Create audit log
    await createAuditLog(
      'Vendor',
      req.params.id,
      'delete',
      req.user.id,
      { id: req.params.id, name: vendor.name }
    );

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};