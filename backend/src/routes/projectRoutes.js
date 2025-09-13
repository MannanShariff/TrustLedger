const express = require('express');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectsByDepartment
} = require('../controllers/projectController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(protect, getProjects)
  .post(protect, authorize('admin'), createProject);

router
  .route('/:id')
  .get(protect, getProject)
  .put(protect, authorize('admin'), updateProject)
  .delete(protect, authorize('admin'), deleteProject);

router.route('/department/:departmentId').get(protect, getProjectsByDepartment);

module.exports = router;