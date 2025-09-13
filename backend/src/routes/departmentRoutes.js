const express = require('express');
const {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentsByBudget
} = require('../controllers/departmentController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(protect, getDepartments)
  .post(protect, authorize('admin'), createDepartment);

router
  .route('/:id')
  .get(protect, getDepartment)
  .put(protect, authorize('admin'), updateDepartment)
  .delete(protect, authorize('admin'), deleteDepartment);

router.route('/budget/:budgetId').get(protect, getDepartmentsByBudget);

module.exports = router;