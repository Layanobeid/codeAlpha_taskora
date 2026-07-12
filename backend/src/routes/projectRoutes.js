// src/routes/projectRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  getProjectMembers,
  getProjectTasks
} = require('../controllers/projectController');

const { protect } = require('../middleware/auth');

// Validation rules
const createProjectValidation = [
  body('title').notEmpty().withMessage('Project title is required'),
  body('description').optional(),
  body('startDate').optional().isISO8601().withMessage('Invalid date format'),
  body('endDate').optional().isISO8601().withMessage('Invalid date format')
];

const updateProjectValidation = [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional(),
  body('status').optional().isIn(['Active', 'Completed', 'Archived']).withMessage('Invalid status'),
  body('startDate').optional().isISO8601().withMessage('Invalid date format'),
  body('endDate').optional().isISO8601().withMessage('Invalid date format')
];

const addMemberValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('role').optional().isIn(['Manager', 'Member']).withMessage('Invalid role')
];

// Routes
router.route('/')
  .get(protect, getProjects)
  .post(protect, createProjectValidation, createProject);

router.route('/:id')
  .get(protect, getProjectById)
  .put(protect, updateProjectValidation, updateProject)
  .delete(protect, deleteProject);

router.route('/:id/members')
  .get(protect, getProjectMembers)
  .post(protect, addMemberValidation, addMember);

router.route('/:id/members/:userId')
  .delete(protect, removeMember);

router.route('/:id/tasks')
  .get(protect, getProjectTasks);

module.exports = router;