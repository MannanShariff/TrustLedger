const Budget = require('../models/Budget');
const { createAuditLog } = require('../utils/auditLogger');

// @desc    Create new budget
// @route   POST /api/budgets
// @access  Private/Admin
exports.createBudget = async (req, res) => {
  try {
    // Add user to req.body
    req.body.createdBy = req.user.id;

    // Create budget
    const budget = await Budget.create(req.body);

    // Create audit log
    await createAuditLog(
      'Budget',
      budget._id,
      'create',
      req.user.id,
      req.body
    );

    res.status(201).json({
      success: true,
      data: budget
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all budgets
// @route   GET /api/budgets
// @access  Private
exports.getBudgets = async (req, res) => {
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
    query = Budget.find(JSON.parse(queryStr));

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
    const total = await Budget.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Populate with departments
    query = query.populate('departments');

    // Execute query
    const budgets = await query;

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
      count: budgets.length,
      pagination,
      data: budgets
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single budget
// @route   GET /api/budgets/:id
// @access  Private
exports.getBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id).populate('departments');

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: `Budget not found with id of ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: budget
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update budget
// @route   PUT /api/budgets/:id
// @access  Private/Admin
exports.updateBudget = async (req, res) => {
  try {
    // Get budget before update for audit log
    const oldBudget = await Budget.findById(req.params.id);

    if (!oldBudget) {
      return res.status(404).json({
        success: false,
        message: `Budget not found with id of ${req.params.id}`
      });
    }

    // Update budget
    const budget = await Budget.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Create audit log with diff
    const diff = {};
    for (const key in req.body) {
      if (oldBudget[key] !== req.body[key]) {
        diff[key] = {
          old: oldBudget[key],
          new: req.body[key]
        };
      }
    }

    await createAuditLog(
      'Budget',
      budget._id,
      'update',
      req.user.id,
      diff
    );

    res.status(200).json({
      success: true,
      data: budget
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private/Admin
exports.deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: `Budget not found with id of ${req.params.id}`
      });
    }

    await budget.deleteOne();

    // Create audit log
    await createAuditLog(
      'Budget',
      req.params.id,
      'delete',
      req.user.id,
      { id: req.params.id, name: budget.name }
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