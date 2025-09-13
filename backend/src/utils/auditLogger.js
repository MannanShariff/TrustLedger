const AuditLog = require('../models/AuditLog');
const { generateAuditHash } = require('./hashUtils');

/**
 * Create an audit log entry
 * @param {string} entityType - The type of entity (Budget, Department, etc.)
 * @param {string} entityId - The ID of the entity
 * @param {string} action - The action performed (create, update, delete)
 * @param {string} actorId - The ID of the user who performed the action
 * @param {Object} diff - The differences between old and new values
 * @returns {Promise<Object>} - The created audit log
 */
const createAuditLog = async (entityType, entityId, action, actorId, diff = {}) => {
  try {
    // Prepare data for hash
    const dataToHash = {
      entityType,
      entityId: entityId.toString(),
      action,
      actor: actorId.toString(),
      diff,
      timestamp: new Date().toISOString()
    };

    // Generate hash
    const recordHash = generateAuditHash(dataToHash);

    // Create audit log
    const auditLog = await AuditLog.create({
      entityType,
      entityId,
      action,
      actor: actorId,
      diff,
      recordHash
    });

    return auditLog;
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't throw error to prevent disrupting main operations
    return null;
  }
};

/**
 * Get audit logs for an entity
 * @param {string} entityId - The ID of the entity
 * @param {Object} options - Query options (limit, sort, etc.)
 * @returns {Promise<Array>} - The audit logs
 */
const getAuditLogs = async (entityId, options = {}) => {
  try {
    const query = { entityId };
    
    // Apply options
    const limit = options.limit || 100;
    const sort = options.sort || { createdAt: -1 };
    
    const auditLogs = await AuditLog.find(query)
      .limit(limit)
      .sort(sort)
      .populate('actor', 'name email');
      
    return auditLogs;
  } catch (error) {
    console.error('Error getting audit logs:', error);
    throw error;
  }
};

/**
 * Verify the integrity of an audit log
 * @param {string} auditLogId - The ID of the audit log to verify
 * @returns {Promise<boolean>} - Whether the audit log is valid
 */
const verifyAuditLog = async (auditLogId) => {
  try {
    const auditLog = await AuditLog.findById(auditLogId);
    
    if (!auditLog) {
      return false;
    }
    
    // Prepare data for hash verification
    const dataToHash = {
      entityType: auditLog.entityType,
      entityId: auditLog.entityId.toString(),
      action: auditLog.action,
      actor: auditLog.actor.toString(),
      diff: auditLog.diff,
      timestamp: auditLog.createdAt.toISOString()
    };
    
    // Generate hash and compare
    const computedHash = generateAuditHash(dataToHash);
    return computedHash === auditLog.recordHash;
  } catch (error) {
    console.error('Error verifying audit log:', error);
    return false;
  }
};

module.exports = {
  createAuditLog,
  getAuditLogs,
  verifyAuditLog
};