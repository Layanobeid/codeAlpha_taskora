// src/models/Activity.js
const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    enum: [
      'created_task',
      'updated_task',
      'changed_status',
      'assigned_user',
      'added_comment',
      'deleted_task',
      'created_project',
      'added_member',
      'removed_member'
    ],
    required: true
  },
  details: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Activity', ActivitySchema);