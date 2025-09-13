const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a budget name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  fiscalYear: {
    type: String,
    required: [true, 'Please add a fiscal year'],
    trim: true
  },
  totalAmount: {
    type: Number,
    required: [true, 'Please add a total budget amount']
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

// Virtual for allocated amount (sum of department allocations)
BudgetSchema.virtual('allocatedAmount', {
  ref: 'Department',
  localField: '_id',
  foreignField: 'budgetId',
  justOne: false,
  count: false,
  match: { isActive: true },
  options: { sort: { name: 1 } },
  get: function(departments) {
    if (!departments) return 0;
    return departments.reduce((sum, dept) => sum + dept.allocatedAmount, 0);
  }
});

// Virtual for remaining amount
BudgetSchema.virtual('remainingAmount').get(function() {
  if (!this.allocatedAmount) return this.totalAmount;
  return this.totalAmount - this.allocatedAmount;
});

// Virtual for departments
BudgetSchema.virtual('departments', {
  ref: 'Department',
  localField: '_id',
  foreignField: 'budgetId',
  justOne: false
});

module.exports = mongoose.model('Budget', BudgetSchema);