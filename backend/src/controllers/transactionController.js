const Transaction = require('../models/Transaction');
const Project = require('../models/Project');
const Vendor = require('../models/Vendor');
const { createAuditLog } = require('../utils/auditLogger');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const { generateDocumentHash, verifyDocumentHash, signTransaction, verifySignature } = require('../utils/hashUtils');
const { getOrCreateKeyPair } = require('../utils/keyGenerator');

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private/Admin
exports.createTransaction = async (req, res) => {
  try {
    // Add user to req.body
    req.body.createdBy = req.user.id;

    // Check if project exists
    const project = await Project.findById(req.body.projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: `Project not found with id of ${req.body.projectId}`
      });
    }

    // Check if vendor exists
    const vendor = await Vendor.findById(req.body.vendorId);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: `Vendor not found with id of ${req.body.vendorId}`
      });
    }

    // If file was uploaded, add file info to req.body
    if (req.fileInfo) {
      req.body.invoiceUrl = `/uploads/${req.fileInfo.filename}`;
      req.body.documentHash = req.fileInfo.documentHash;
    }

    // Create transaction
    const transaction = await Transaction.create(req.body);

    // Create audit log
    await createAuditLog(
      'Transaction',
      transaction._id,
      'create',
      req.user.id,
      req.body
    );

    res.status(201).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private
exports.getTransactions = async (req, res) => {
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
    query = Transaction.find(JSON.parse(queryStr));

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
      query = query.sort('-date');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Transaction.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Populate with project and vendor
    query = query.populate({
      path: 'projectId',
      populate: {
        path: 'departmentId',
        populate: {
          path: 'budgetId'
        }
      }
    }).populate('vendorId').populate('createdBy', 'name');

    // Execute query
    const transactions = await query;

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
      count: transactions.length,
      pagination,
      data: transactions
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get transactions for a project
// @route   GET /api/projects/:projectId/transactions
// @access  Private
exports.getProjectTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ projectId: req.params.projectId })
      .populate('vendorId')
      .populate('createdBy', 'name')
      .sort('-date');

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get transactions for a vendor
// @route   GET /api/vendors/:vendorId/transactions
// @access  Private
exports.getVendorTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ vendorId: req.params.vendorId })
      .populate({
        path: 'projectId',
        populate: {
          path: 'departmentId',
          populate: {
            path: 'budgetId'
          }
        }
      })
      .populate('createdBy', 'name')
      .sort('-date');

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
exports.getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate({
        path: 'projectId',
        populate: {
          path: 'departmentId',
          populate: {
            path: 'budgetId'
          }
        }
      })
      .populate('vendorId')
      .populate('createdBy', 'name');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: `Transaction not found with id of ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private/Admin
exports.updateTransaction = async (req, res) => {
  try {
    // Get transaction before update for audit log
    const oldTransaction = await Transaction.findById(req.params.id);

    if (!oldTransaction) {
      return res.status(404).json({
        success: false,
        message: `Transaction not found with id of ${req.params.id}`
      });
    }

    // If file was uploaded, add file info to req.body
    if (req.fileInfo) {
      req.body.invoiceUrl = `/uploads/${req.fileInfo.filename}`;
      req.body.documentHash = req.fileInfo.documentHash;
    }

    // Update transaction
    const transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Create audit log with diff
    const diff = {};
    for (const key in req.body) {
      if (oldTransaction[key] !== req.body[key]) {
        diff[key] = {
          old: oldTransaction[key],
          new: req.body[key]
        };
      }
    }

    await createAuditLog(
      'Transaction',
      transaction._id,
      'update',
      req.user.id,
      diff
    );

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private/Admin
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: `Transaction not found with id of ${req.params.id}`
      });
    }

    await transaction.deleteOne();

    // Create audit log
    await createAuditLog(
      'Transaction',
      req.params.id,
      'delete',
      req.user.id,
      { id: req.params.id, amount: transaction.amount }
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

// @desc    Verify transaction document
// @route   GET /api/transactions/:id/verify
// @access  Private
exports.verifyTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: `Transaction not found with id of ${req.params.id}`
      });
    }

    // Check if document exists
    if (!transaction.invoiceUrl || !transaction.documentHash) {
      return res.status(400).json({
        success: false,
        message: 'No document or hash found for this transaction'
      });
    }

    // Get file path
    const filePath = path.join(
      __dirname,
      '..',
      '..',
      transaction.invoiceUrl.replace(/^\/uploads/, 'src/uploads')
    );

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Document file not found'
      });
    }

    // Read file and verify hash
    const fileBuffer = fs.readFileSync(filePath);
    const isValid = verifyDocumentHash(fileBuffer, transaction.documentHash);

    res.status(200).json({
      success: true,
      data: {
        isValid,
        storedHash: transaction.documentHash,
        computedHash: generateDocumentHash(fileBuffer)
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Sign transaction document with digital signature
// @route   POST /api/transactions/:id/sign
// @access  Private/Admin
exports.signTransactionDocument = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: `Transaction not found with id of ${req.params.id}`
      });
    }

    // Check if document exists
    if (!transaction.invoiceUrl) {
      return res.status(400).json({
        success: false,
        message: 'No document found for this transaction'
      });
    }

    // Get file path
    const filePath = path.join(
      __dirname,
      '..',
      '..',
      transaction.invoiceUrl.replace(/^\/uploads/, 'src/uploads')
    );

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Document file not found'
      });
    }

    // Read file and create digital signature
     const fileBuffer = await readFile(filePath);
     
     // Get or create key pair for the user
     const keys = getOrCreateKeyPair(req.user.id.toString());
     
     // Create transaction data object for signing
     const transactionData = {
       id: transaction._id.toString(),
       amount: transaction.amount,
       projectId: transaction.projectId.toString(),
       vendorId: transaction.vendorId.toString(),
       documentHash: transaction.documentHash
     };
     
     // Sign the transaction data
     const signature = signTransaction(transactionData, keys.privateKey);
    
    // Update transaction with signature
    transaction.digitalSignature = signature;
    transaction.signedBy = req.user.id;
    transaction.signedAt = Date.now();
    await transaction.save();
    
    // Create audit log
    await createAuditLog(
      'Transaction',
      transaction._id,
      'sign',
      req.user.id,
      { id: transaction._id }
    );

    res.status(200).json({
      success: true,
      data: {
        signature,
        signedBy: req.user.id,
        signedAt: transaction.signedAt
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Verify transaction document signature
// @route   GET /api/transactions/:id/verify-signature
// @access  Private
exports.verifyTransactionSignature = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('signedBy', 'name');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: `Transaction not found with id of ${req.params.id}`
      });
    }

    // Check if signature exists
    if (!transaction.digitalSignature) {
      return res.status(400).json({
        success: false,
        message: 'No digital signature found for this transaction'
      });
    }

    // Get file path
    const filePath = path.join(
      __dirname,
      '..',
      '..',
      transaction.invoiceUrl.replace(/^\/uploads/, 'src/uploads')
    );

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Document file not found'
      });
    }

    // Read file
     const fileBuffer = await readFile(filePath);
     
     // Get key pair for the signing user
     const keys = getOrCreateKeyPair(transaction.signedBy.toString());
     
     // Create transaction data object for verification
     const transactionData = {
       id: transaction._id.toString(),
       amount: transaction.amount,
       projectId: transaction.projectId.toString(),
       vendorId: transaction.vendorId.toString(),
       documentHash: transaction.documentHash
     };
     
     // Verify the signature
     const isValid = verifySignature(transactionData, transaction.digitalSignature, keys.publicKey);

    res.status(200).json({
      success: true,
      data: {
        isValid,
        signedBy: transaction.signedBy,
        signedAt: transaction.signedAt
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};