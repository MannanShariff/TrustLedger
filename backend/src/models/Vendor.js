const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a vendor name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  gstin: {
    type: String,
    trim: true
  },
  contactInfo: {
    email: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ]
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    }
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

// Virtual for transactions
VendorSchema.virtual('transactions', {
  ref: 'Transaction',
  localField: '_id',
  foreignField: 'vendorId',
  justOne: false
});

// Virtual for total transactions amount
VendorSchema.virtual('totalTransactionsAmount', {
  ref: 'Transaction',
  localField: '_id',
  foreignField: 'vendorId',
  justOne: false,
  count: false,
  get: function(transactions) {
    if (!transactions) return 0;
    return transactions.reduce((sum, trans) => sum + trans.amount, 0);
  }
});

module.exports = mongoose.model('Vendor', VendorSchema);