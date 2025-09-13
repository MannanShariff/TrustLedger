const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Please add a project ID']
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: [true, 'Please add a vendor ID']
  },
  amount: {
    type: Number,
    required: [true, 'Please add a transaction amount']
  },
  date: {
    type: Date,
    required: [true, 'Please add a transaction date'],
    default: Date.now
  },
  description: {
    type: String,
    trim: true
  },
  invoiceNumber: {
    type: String,
    trim: true
  },
  invoiceUrl: {
    type: String,
    trim: true
  },
  documentHash: {
    type: String,
    trim: true
  },
  digitalSignature: {
    type: String,
    trim: true
  },
  signedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  signedAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to update the updatedAt field
TransactionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Transaction', TransactionSchema);