const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a department name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  budgetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Budget',
    required: [true, 'Please add a budget ID']
  },
  allocatedAmount: {
    type: Number,
    required: [true, 'Please add an allocated amount']
  },
  description: {
    type: String,
    trim: true
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

// Virtual for allocated amount (sum of project allocations)
DepartmentSchema.virtual('projectsAllocatedAmount', {
  ref: 'Project',
  localField: '_id',
  foreignField: 'departmentId',
  justOne: false,
  count: false,
  match: { isActive: true },
  options: { sort: { name: 1 } },
  get: function(projects) {
    if (!projects) return 0;
    return projects.reduce((sum, proj) => sum + proj.allocatedAmount, 0);
  }
});

// Virtual for remaining amount
DepartmentSchema.virtual('remainingAmount').get(function() {
  if (!this.projectsAllocatedAmount) return this.allocatedAmount;
  return this.allocatedAmount - this.projectsAllocatedAmount;
});

// Virtual for projects
DepartmentSchema.virtual('projects', {
  ref: 'Project',
  localField: '_id',
  foreignField: 'departmentId',
  justOne: false
});

module.exports = mongoose.model('Department', DepartmentSchema);