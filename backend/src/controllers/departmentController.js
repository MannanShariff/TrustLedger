const Department = require('../models/Department');
const Budget = require('../models/Budget');
const { createAuditLog } = require('../utils/auditLogger');

// @desc    Create new department
// @route   POST /api/departments
// @access  Private/Admin
exports.createDepartment = async (req, res) => {
  try {
    // Add user to req.body
    req.body.createdBy = req.user.id;

    // Check if budget exists
    const budget = await Budget.findById(req.body.budgetId);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: `Budget not found with id of ${req.body.budgetId}`
      });
    }

    // Create department
    const department = await Department.create(req.body);

    // Create audit log
    await createAuditLog(
      'Department',
      department._id,
      'create',
      req.user.id,
      req.body
    );

    res.status(201).json({
      success: true,
      data: department
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private
exports.getDepartments = async (req, res) => {
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
    query = Department.find(JSON.parse(queryStr));

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
    const total = await Department.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Populate with budget and projects
    query = query.populate('budgetId').populate('projects');

    // Execute query
    const departments = await query;

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
      count: departments.length,
      pagination,
      data: departments
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get departments for a budget
// @route   GET /api/budgets/:budgetId/departments
// @access  Private
exports.getBudgetDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ budgetId: req.params.budgetId })
      .populate('projects');

    res.status(200).json({
      success: true,
      count: departments.length,
      data: departments
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get departments by budget ID
// @route   GET /api/departments/budget/:budgetId
// @access  Private
exports.getDepartmentsByBudget = async (req, res) => {
  try {
    const departments = await Department.find({ budgetId: req.params.budgetId })
      .populate('projects');

    res.status(200).json({
      success: true,
      count: departments.length,
      data: departments
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single department
// @route   GET /api/departments/:id
// @access  Private
exports.getDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('budgetId')
      .populate('projects');

    if (!department) {
      return res.status(404).json({
        success: false,
        message: `Department not found with id of ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: department
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private/Admin
exports.updateDepartment = async (req, res) => {
  try {
    // Get department before update for audit log
    const oldDepartment = await Department.findById(req.params.id);

    if (!oldDepartment) {
      return res.status(404).json({
        success: false,
        message: `Department not found with id of ${req.params.id}`
      });
    }

    // Update department
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Create audit log with diff
    const diff = {};
    for (const key in req.body) {
      if (oldDepartment[key] !== req.body[key]) {
        diff[key] = {
          old: oldDepartment[key],
          new: req.body[key]
        };
      }
    }

    await createAuditLog(
      'Department',
      department._id,
      'update',
      req.user.id,
      diff
    );

    res.status(200).json({
      success: true,
      data: department
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private/Admin
exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: `Department not found with id of ${req.params.id}`
      });
    }

    await department.deleteOne();

    // Create audit log
    await createAuditLog(
      'Department',
      req.params.id,
      'delete',
      req.user.id,
      { id: req.params.id, name: department.name }
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