const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  entityType: {
    type: String,
    required: [true, 'Please add an entity type'],
    enum: ['budget', 'department', 'project', 'vendor', 'transaction', 'user']
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Please add an entity ID']
  },
  action: {
    type: String,
    required: [true, 'Please add an action'],
    enum: ['create', 'update', 'delete', 'login', 'logout', 'file_upload']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please add a user ID']
  },
  details: {
    type: Object,
    default: {}
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  documentHash: {
    type: String,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);