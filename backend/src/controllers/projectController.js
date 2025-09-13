const Project = require('../models/Project');
const Department = require('../models/Department');
const { createAuditLog } = require('../utils/auditLogger');

// @desc    Create new project
// @route   POST /api/projects
// @access  Private/Admin
exports.createProject = async (req, res) => {
  try {
    // Add user to req.body
    req.body.createdBy = req.user.id;

    // Check if department exists
    const department = await Department.findById(req.body.departmentId);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: `Department not found with id of ${req.body.departmentId}`
      });
    }

    // Create project
    const project = await Project.create(req.body);

    // Create audit log
    await createAuditLog(
      'Project',
      project._id,
      'create',
      req.user.id,
      req.body
    );

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res) => {
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
    query = Project.find(JSON.parse(queryStr));

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
    const total = await Project.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Populate with department and transactions
    query = query.populate({
      path: 'departmentId',
      populate: {
        path: 'budgetId'
      }
    }).populate('transactions');

    // Execute query
    const projects = await query;

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
      count: projects.length,
      pagination,
      data: projects
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get projects for a department
// @route   GET /api/departments/:departmentId/projects
// @access  Private
exports.getDepartmentProjects = async (req, res) => {
  try {
    const projects = await Project.find({ departmentId: req.params.departmentId })
      .populate('transactions');

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate({
        path: 'departmentId',
        populate: {
          path: 'budgetId'
        }
      })
      .populate('transactions');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: `Project not found with id of ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private/Admin
exports.updateProject = async (req, res) => {
  try {
    // Get project before update for audit log
    const oldProject = await Project.findById(req.params.id);

    if (!oldProject) {
      return res.status(404).json({
        success: false,
        message: `Project not found with id of ${req.params.id}`
      });
    }

    // Update project
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Create audit log with diff
    const diff = {};
    for (const key in req.body) {
      if (oldProject[key] !== req.body[key]) {
        diff[key] = {
          old: oldProject[key],
          new: req.body[key]
        };
      }
    }

    await createAuditLog(
      'Project',
      project._id,
      'update',
      req.user.id,
      diff
    );

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get projects by department
// @route   GET /api/projects/department/:departmentId
// @access  Private
exports.getProjectsByDepartment = async (req, res) => {
  try {
    const projects = await Project.find({ departmentId: req.params.departmentId })
      .populate({
        path: 'departmentId',
        populate: {
          path: 'budgetId'
        }
      })
      .populate('transactions');

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: `Project not found with id of ${req.params.id}`
      });
    }

    await project.deleteOne();

    // Create audit log
    await createAuditLog(
      'Project',
      req.params.id,
      'delete',
      req.user.id,
      { id: req.params.id, name: project.name }
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