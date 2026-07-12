const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');
const Activity = require('../models/Activity');
const { validationResult } = require('express-validator');

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
exports.createProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { title, description, startDate, endDate } = req.body;

    const project = await Project.create({
      title,
      description,
      owner: req.user.id,
      members: [
        {
          user: req.user.id,
          role: 'Manager',
          joinedAt: Date.now()
        }
      ],
      startDate,
      endDate,
      status: 'Active'
    });

    // Create activity
    await Activity.create({
      projectId: project._id,
      userId: req.user.id,
      action: 'created_project',
      details: `Project "${title}" was created`
    });

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all projects for a user
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res, next) => {
  try {
    // Get projects where user is owner or member
    const projects = await Project.find({
      $or: [
        { owner: req.user.id },
        { 'members.user': req.user.id }
      ]
    })
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar')
    .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private
exports.getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user has access
    const isOwner = project.owner._id.toString() === req.user.id;
    const isMember = project.members.some(
      member => member.user._id.toString() === req.user.id
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this project'
      });
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is owner or manager
    const isOwner = project.owner.toString() === req.user.id;
    const isManager = project.members.some(
      member => member.user.toString() === req.user.id && member.role === 'Manager'
    );

    if (!isOwner && !isManager) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this project'
      });
    }

    const { title, description, status, startDate, endDate } = req.body;

    // Update fields
    if (title) project.title = title;
    if (description !== undefined) project.description = description;
    if (status) project.status = status;
    if (startDate) project.startDate = startDate;
    if (endDate) project.endDate = endDate;

    await project.save();

    // Create activity
    await Activity.create({
      projectId: project._id,
      userId: req.user.id,
      action: 'updated_project',
      details: `Project "${project.title}" was updated`
    });

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Only owner can delete
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the project owner can delete this project'
      });
    }

    // Delete all tasks in project
    await Task.deleteMany({ projectId: project._id });

    // Delete all activities
    await Activity.deleteMany({ projectId: project._id });

    // Delete project
    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Private
exports.addMember = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check permission
    const isOwner = project.owner.toString() === req.user.id;
    const isManager = project.members.some(
      member => member.user.toString() === req.user.id && member.role === 'Manager'
    );

    if (!isOwner && !isManager) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to add members'
      });
    }

    const { email, role = 'Member' } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    // Check if already a member
    const isAlreadyMember = project.members.some(
      member => member.user.toString() === user._id.toString()
    );

    if (isAlreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this project'
      });
    }

    // Add member
    project.members.push({
      user: user._id,
      role,
      joinedAt: Date.now()
    });

    await project.save();

    // Create activity
    await Activity.create({
      projectId: project._id,
      userId: req.user.id,
      action: 'added_member',
      details: `${user.name} was added as ${role} to "${project.title}"`
    });

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private
exports.removeMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check permission
    const isOwner = project.owner.toString() === req.user.id;
    const isManager = project.members.some(
      member => member.user.toString() === req.user.id && member.role === 'Manager'
    );

    if (!isOwner && !isManager) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to remove members'
      });
    }

    // Cannot remove owner
    if (req.params.userId === project.owner.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove the project owner'
      });
    }

    // Remove member
    project.members = project.members.filter(
      member => member.user.toString() !== req.params.userId
    );

    await project.save();

    // Create activity
    const removedUser = await User.findById(req.params.userId);
    await Activity.create({
      projectId: project._id,
      userId: req.user.id,
      action: 'removed_member',
      details: `${removedUser ? removedUser.name : 'User'} was removed from "${project.title}"`
    });

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get project members
// @route   GET /api/projects/:id/members
// @access  Private
exports.getProjectMembers = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('members.user', 'name email avatar');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.status(200).json({
      success: true,
      data: project.members
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks in a project
// @route   GET /api/projects/:id/tasks
// @access  Private
exports.getProjectTasks = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const tasks = await Task.find({ projectId: req.params.id })
      .populate('createdBy', 'name email avatar')
      .populate('assignedTo', 'name email avatar')
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