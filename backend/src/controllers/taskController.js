const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const { validationResult } = require('express-validator');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { title, description, projectId, priority, deadline, assignedTo } = req.body;

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user has access to project
    const isOwner = project.owner.toString() === req.user.id;
    const isMember = project.members.some(
      member => member.user.toString() === req.user.id
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this project'
      });
    }

    const task = await Task.create({
      title,
      description,
      projectId,
      createdBy: req.user.id,
      assignedTo: assignedTo || [],
      priority: priority || 'Medium',
      deadline,
      status: 'To Do'
    });

    // Populate task data
    await task.populate('createdBy', 'name email avatar');
    await task.populate('assignedTo', 'name email avatar');

    // Create activity
    await Activity.create({
      projectId,
      taskId: task._id,
      userId: req.user.id,
      action: 'created_task',
      details: `Task "${title}" was created`
    });

    // Create notifications for assigned users
    if (assignedTo && assignedTo.length > 0) {
      const notifications = assignedTo.map(userId => ({
        userId,
        type: 'task_assigned',
        message: `You have been assigned to task "${title}" in project "${project.title}"`,
        relatedTask: task._id,
        relatedProject: projectId
      }));
      await Notification.insertMany(notifications);
    }

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks (with filters)
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res, next) => {
  try {
    const { projectId, status, priority, assignedTo } = req.query;

    const filter = {};

    // Filter by project
    if (projectId) {
      filter.projectId = projectId;
    }

    // Filter by status
    if (status) {
      filter.status = status;
    }

    // Filter by priority
    if (priority) {
      filter.priority = priority;
    }

    // Filter by assigned user
    if (assignedTo) {
      filter.assignedTo = assignedTo;
    }

    // Only show tasks from projects user has access to
    const userProjects = await Project.find({
      $or: [
        { owner: req.user.id },
        { 'members.user': req.user.id }
      ]
    }).select('_id');

    const projectIds = userProjects.map(p => p._id);
    filter.projectId = { $in: projectIds };

    // If specific projectId is provided, check access
    if (projectId) {
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      const hasAccess = project.owner.toString() === req.user.id ||
        project.members.some(m => m.user.toString() === req.user.id);

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this project'
        });
      }
      filter.projectId = projectId;
    }

    const tasks = await Task.find(filter)
      .populate('createdBy', 'name email avatar')
      .populate('assignedTo', 'name email avatar')
      .populate('projectId', 'title')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private
exports.getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('createdBy', 'name email avatar')
      .populate('assignedTo', 'name email avatar')
      .populate('projectId', 'title description');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check access to project
    const project = await Project.findById(task.projectId);
    const hasAccess = project.owner.toString() === req.user.id ||
      project.members.some(m => m.user.toString() === req.user.id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this task'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check access
    const project = await Project.findById(task.projectId);
    const hasAccess = project.owner.toString() === req.user.id ||
      project.members.some(m => m.user.toString() === req.user.id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this task'
      });
    }

    const { title, description, priority, deadline } = req.body;

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority) task.priority = priority;
    if (deadline) task.deadline = deadline;

    await task.save();

    await task.populate('createdBy', 'name email avatar');
    await task.populate('assignedTo', 'name email avatar');

    // Create activity
    await Activity.create({
      projectId: task.projectId,
      taskId: task._id,
      userId: req.user.id,
      action: 'updated_task',
      details: `Task "${task.title}" was updated`
    });

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check access
    const project = await Project.findById(task.projectId);
    const hasAccess = project.owner.toString() === req.user.id ||
      project.members.some(m => m.user.toString() === req.user.id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this task'
      });
    }

    // Delete comments
    await Comment.deleteMany({ taskId: task._id });

    // Delete activity
    await Activity.deleteMany({ taskId: task._id });

    // Delete task
    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign users to task
// @route   PUT /api/tasks/:id/assign
// @access  Private
exports.assignTask = async (req, res, next) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of user IDs'
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check access
    const project = await Project.findById(task.projectId);
    const hasAccess = project.owner.toString() === req.user.id ||
      project.members.some(m => m.user.toString() === req.user.id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to assign users to this task'
      });
    }

    // Verify all users exist and are project members
    const users = await User.find({ _id: { $in: userIds } });
    const projectMemberIds = project.members.map(m => m.user.toString());
    projectMemberIds.push(project.owner.toString());

    const validUsers = users.filter(u => 
      projectMemberIds.includes(u._id.toString())
    );

    if (validUsers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid users found. Users must be project members.'
      });
    }

    task.assignedTo = validUsers.map(u => u._id);
    await task.save();

    await task.populate('assignedTo', 'name email avatar');

    // Create activity
    await Activity.create({
      projectId: task.projectId,
      taskId: task._id,
      userId: req.user.id,
      action: 'assigned_user',
      details: `Task "${task.title}" was assigned to ${validUsers.length} users`
    });

    // Create notifications
    const notifications = validUsers.map(user => ({
      userId: user._id,
      type: 'task_assigned',
      message: `You have been assigned to task "${task.title}" in project "${project.title}"`,
      relatedTask: task._id,
      relatedProject: project._id
    }));
    await Notification.insertMany(notifications);

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task status (for Kanban)
// @route   PUT /api/tasks/:id/status
// @access  Private
exports.updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatus = ['To Do', 'In Progress', 'Review', 'Done'];
    if (!validStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Valid statuses: To Do, In Progress, Review, Done'
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check access
    const project = await Project.findById(task.projectId);
    const hasAccess = project.owner.toString() === req.user.id ||
      project.members.some(m => m.user.toString() === req.user.id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this task'
      });
    }

    const oldStatus = task.status;
    task.status = status;
    await task.save();

    // Create activity
    await Activity.create({
      projectId: task.projectId,
      taskId: task._id,
      userId: req.user.id,
      action: 'changed_status',
      details: `Task "${task.title}" moved from ${oldStatus} to ${status}`
    });

    // Create notification for assigned users
    if (task.assignedTo.length > 0) {
      const notifications = task.assignedTo.map(userId => ({
        userId,
        type: 'status_changed',
        message: `Task "${task.title}" status changed to ${status}`,
        relatedTask: task._id,
        relatedProject: project._id
      }));
      await Notification.insertMany(notifications);
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get task comments
// @route   GET /api/tasks/:id/comments
// @access  Private
exports.getTaskComments = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const comments = await Comment.find({ taskId: req.params.id })
      .populate('userId', 'name email avatar')
      .sort('createdAt');

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
exports.addComment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check access
    const project = await Project.findById(task.projectId);
    const hasAccess = project.owner.toString() === req.user.id ||
      project.members.some(m => m.user.toString() === req.user.id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this task'
      });
    }

    const comment = await Comment.create({
      taskId: req.params.id,
      userId: req.user.id,
      content: req.body.content
    });

    await comment.populate('userId', 'name email avatar');

    // Create activity
    await Activity.create({
      projectId: task.projectId,
      taskId: task._id,
      userId: req.user.id,
      action: 'added_comment',
      details: `Comment added to task "${task.title}"`
    });

    // Create notification for assigned users
    if (task.assignedTo.length > 0) {
      const notifications = task.assignedTo
        .filter(userId => userId.toString() !== req.user.id)
        .map(userId => ({
          userId,
          type: 'comment_added',
          message: `New comment on task "${task.title}" by ${req.user.name}`,
          relatedTask: task._id,
          relatedProject: project._id
        }));
      await Notification.insertMany(notifications);
    }

    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    next(error);
  }
};