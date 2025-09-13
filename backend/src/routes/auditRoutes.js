const express = require('express');
const {
  getAuditLogs,
  getEntityAuditLogs,
  verifyAuditLogIntegrity
} = require('../controllers/auditController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/').get(protect, authorize('admin', 'auditor'), getAuditLogs);
router.route('/:entityId').get(protect, authorize('admin', 'auditor'), getEntityAuditLogs);
router.route('/:id/verify').get(protect, authorize('admin', 'auditor'), verifyAuditLogIntegrity);

module.exports = router;