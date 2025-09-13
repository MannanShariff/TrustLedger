const express = require('express');
const {
  getBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget
} = require('../controllers/budgetController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(protect, getBudgets)
  .post(protect, authorize('admin'), createBudget);

router
  .route('/:id')
  .get(protect, getBudget)
  .put(protect, authorize('admin'), updateBudget)
  .delete(protect, authorize('admin'), deleteBudget);

module.exports = router;