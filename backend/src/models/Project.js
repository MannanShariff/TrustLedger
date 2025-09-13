const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a project name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Please add a department ID']
  },
  allocatedAmount: {
    type: Number,
    required: [true, 'Please add an allocated amount']
  },
  description: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, 'Please add a start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please add an end date']
  },
  status: {
    type: String,
    enum: ['planned', 'in-progress', 'completed', 'on-hold', 'cancelled'],
    default: 'planned'
  },
  isActive: {
    type: Boolean,
    default: true
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
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for spent amount (sum of transaction amounts)
ProjectSchema.virtual('spentAmount', {
  ref: 'Transaction',
  localField: '_id',
  foreignField: 'projectId',
  justOne: false,
  count: false,
  options: { sort: { date: 1 } },
  get: function(transactions) {
    if (!transactions) return 0;
    return transactions.reduce((sum, trans) => sum + trans.amount, 0);
  }
});

// Virtual for remaining amount
ProjectSchema.virtual('remainingAmount').get(function() {
  if (!this.spentAmount) return this.allocatedAmount;
  return this.allocatedAmount - this.spentAmount;
});

// Virtual for transactions
ProjectSchema.virtual('transactions', {
  ref: 'Transaction',
  localField: '_id',
  foreignField: 'projectId',
  justOne: false
});

module.exports = mongoose.model('Project', ProjectSchema);