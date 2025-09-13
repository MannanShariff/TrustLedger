const express = require('express');
const {
  getVendors,
  getVendor,
  createVendor,
  updateVendor,
  deleteVendor
} = require('../controllers/vendorController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(protect, getVendors)
  .post(protect, authorize('admin'), createVendor);

router
  .route('/:id')
  .get(protect, getVendor)
  .put(protect, authorize('admin'), updateVendor)
  .delete(protect, authorize('admin'), deleteVendor);

module.exports = router;