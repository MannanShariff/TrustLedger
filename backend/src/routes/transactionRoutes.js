const express = require('express');
const {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getProjectTransactions,
  getVendorTransactions,
  verifyTransaction,
  signTransactionDocument,
  verifyTransactionSignature
} = require('../controllers/transactionController');

const { protect, authorize } = require('../middleware/auth');
const { uploadTransactionFiles } = require('../utils/fileUpload');

const router = express.Router();

router
  .route('/')
  .get(protect, getTransactions)
  .post(
    protect, 
    authorize('admin'), 
    uploadTransactionFiles,
    createTransaction
  );

router
  .route('/:id')
  .get(protect, getTransaction)
  .put(
    protect, 
    authorize('admin'), 
    uploadTransactionFiles,
    updateTransaction
  )
  .delete(protect, authorize('admin'), deleteTransaction);

router.route('/project/:projectId').get(protect, getProjectTransactions);
router.route('/vendor/:vendorId').get(protect, getVendorTransactions);
router.route('/:id/verify').get(protect, verifyTransaction);
router.route('/:id/sign').post(protect, authorize('admin'), signTransactionDocument);
router.route('/:id/verify-signature').get(protect, verifyTransactionSignature);

module.exports = router;