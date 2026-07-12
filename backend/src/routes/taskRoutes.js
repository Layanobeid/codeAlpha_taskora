// src/routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  assignTask,
  updateTaskStatus,
  getTaskComments,
  addComment
} = require('../controllers/taskController');

const { protect } = require('../middleware/auth');

// Validation rules
const createTaskValidation = [
  body('title').notEmpty().withMessage('Task title is required'),
  body('projectId').notEmpty().withMessage('Project ID is required'),
  body('description').optional(),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Urgent']).withMessage('Invalid priority'),
  body('deadline').optional().isISO8601().withMessage('Invalid date format'),
  body('assignedTo').optional().isArray().withMessage('AssignedTo must be an array')
];

const updateTaskValidation = [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional(),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Urgent']).withMessage('Invalid priority'),
  body('deadline').optional().isISO8601().withMessage('Invalid date format')
];

const addCommentValidation = [
  body('content').notEmpty().withMessage('Comment content is required')
];

// Routes
router.route('/')
  .get(protect, getTasks)
  .post(protect, createTaskValidation, createTask);

router.route('/:id')
  .get(protect, getTaskById)
  .put(protect, updateTaskValidation, updateTask)
  .delete(protect, deleteTask);

router.route('/:id/assign')
  .put(protect, assignTask);

router.route('/:id/status')
  .put(protect, updateTaskStatus);

router.route('/:id/comments')
  .get(protect, getTaskComments)
  .post(protect, addCommentValidation, addComment);

module.exports = router;