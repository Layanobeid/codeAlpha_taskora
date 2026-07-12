// backend/seed.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Force load .env from the same directory
dotenv.config({ path: './.env' });

// Import models
const User = require('./src/models/User');
const Project = require('./src/models/Project');
const Task = require('./src/models/Task');
const Comment = require('./src/models/Comment');
const Activity = require('./src/models/Activity');

// Use the same URI from .env or hardcode it
const MONGO_URI = 'mongodb+srv://layanobeid30_db_user:rPHOeybWvlFQZLSG@cluster0.ibzl2tk.mongodb.net/taskora';

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Sample Users
const users = [
  {
    name: 'Ahmed Mohamed',
    email: 'ahmed@test.com',
    password: '123456',
    role: 'admin',
    isActive: true
  },
  {
    name: 'Sara Ali',
    email: 'sara@test.com',
    password: '123456',
    role: 'user',
    isActive: true
  },
  {
    name: 'Layan Obeid',
    email: 'layan@test.com',
    password: '123456',
    role: 'user',
    isActive: true
  },
  {
    name: 'Khalid Hassan',
    email: 'khalid@test.com',
    password: '123456',
    role: 'user',
    isActive: true
  }
];

// Sample Projects
const getProjects = (userIds) => [
  {
    title: 'Taskora - Project Management App',
    description: 'Full-stack project management platform with Kanban board, real-time notifications, and team collaboration features.',
    owner: userIds[0],
    members: [
      { user: userIds[0], role: 'Manager' },
      { user: userIds[1], role: 'Member' },
      { user: userIds[2], role: 'Member' }
    ],
    status: 'Active',
    startDate: new Date('2026-07-01'),
    endDate: new Date('2026-08-30')
  },
  {
    title: 'E-Commerce Website',
    description: 'Online store with payment integration, product management, and order tracking system.',
    owner: userIds[1],
    members: [
      { user: userIds[1], role: 'Manager' },
      { user: userIds[2], role: 'Member' },
      { user: userIds[3], role: 'Member' }
    ],
    status: 'Active',
    startDate: new Date('2026-06-15'),
    endDate: new Date('2026-09-15')
  },
  {
    title: 'Mobile App Development',
    description: 'Cross-platform mobile application using React Native with backend API integration.',
    owner: userIds[2],
    members: [
      { user: userIds[2], role: 'Manager' },
      { user: userIds[0], role: 'Member' },
      { user: userIds[3], role: 'Member' }
    ],
    status: 'Completed',
    startDate: new Date('2026-05-01'),
    endDate: new Date('2026-06-30')
  }
];

// Sample Tasks
const getTasks = (projectIds, userIds) => [
  // Tasks for Project 1 (Taskora)
  {
    title: 'Design Database Schema',
    description: 'Create MongoDB models for users, projects, tasks, comments, activities, and notifications.',
    projectId: projectIds[0],
    createdBy: userIds[0],
    assignedTo: [userIds[1], userIds[2]],
    status: 'Done',
    priority: 'High',
    deadline: new Date('2026-07-10')
  },
  {
    title: 'Implement Authentication',
    description: 'Build JWT authentication with register, login, and protected routes.',
    projectId: projectIds[0],
    createdBy: userIds[0],
    assignedTo: [userIds[1]],
    status: 'In Progress',
    priority: 'Urgent',
    deadline: new Date('2026-07-15')
  },
  {
    title: 'Create Kanban Board UI',
    description: 'Build drag-and-drop Kanban board with React DnD.',
    projectId: projectIds[0],
    createdBy: userIds[1],
    assignedTo: [userIds[2]],
    status: 'To Do',
    priority: 'High',
    deadline: new Date('2026-07-25')
  },
  {
    title: 'Setup Real-time Notifications',
    description: 'Implement Socket.io for real-time notifications when tasks are assigned or updated.',
    projectId: projectIds[0],
    createdBy: userIds[2],
    assignedTo: [userIds[0], userIds[3]],
    status: 'To Do',
    priority: 'Medium',
    deadline: new Date('2026-08-05')
  },
  
  // Tasks for Project 2 (E-Commerce)
  {
    title: 'Design UI/UX Mockups',
    description: 'Create Figma designs for all pages: home, product, cart, checkout, profile.',
    projectId: projectIds[1],
    createdBy: userIds[1],
    assignedTo: [userIds[2]],
    status: 'Done',
    priority: 'High',
    deadline: new Date('2026-06-20')
  },
  {
    title: 'Build Product API',
    description: 'Create CRUD endpoints for products with categories, filters, and search.',
    projectId: projectIds[1],
    createdBy: userIds[1],
    assignedTo: [userIds[0]],
    status: 'In Progress',
    priority: 'Urgent',
    deadline: new Date('2026-07-20')
  },
  {
    title: 'Implement Payment Gateway',
    description: 'Integrate Stripe/PayPal for payment processing.',
    projectId: projectIds[1],
    createdBy: userIds[3],
    assignedTo: [userIds[1], userIds[2]],
    status: 'To Do',
    priority: 'High',
    deadline: new Date('2026-08-10')
  },
  
  // Tasks for Project 3 (Mobile App)
  {
    title: 'Setup React Native Project',
    description: 'Initialize React Native project with navigation and state management.',
    projectId: projectIds[2],
    createdBy: userIds[2],
    assignedTo: [userIds[0]],
    status: 'Done',
    priority: 'High',
    deadline: new Date('2026-05-10')
  },
  {
    title: 'Build API Integration Layer',
    description: 'Create service layer for API calls with error handling and caching.',
    projectId: projectIds[2],
    createdBy: userIds[2],
    assignedTo: [userIds[3]],
    status: 'Done',
    priority: 'High',
    deadline: new Date('2026-05-25')
  }
];

// Sample Comments
const getComments = (taskIds, userIds) => [
  {
    taskId: taskIds[0],
    userId: userIds[0],
    content: 'Great job on the database design! The schema looks solid.'
  },
  {
    taskId: taskIds[0],
    userId: userIds[2],
    content: 'Should we add indexing for better performance?'
  },
  {
    taskId: taskIds[1],
    userId: userIds[1],
    content: 'I have implemented JWT, working on refresh tokens now.'
  },
  {
    taskId: taskIds[1],
    userId: userIds[3],
    content: 'Don\'t forget to add rate limiting for security!'
  },
  {
    taskId: taskIds[2],
    userId: userIds[2],
    content: 'I\'ll start working on the Kanban board tomorrow.'
  },
  {
    taskId: taskIds[5],
    userId: userIds[0],
    content: 'The product API is ready for testing.'
  }
];

// Sample Activities
const getActivities = (projectIds, taskIds, userIds) => [
  {
    projectId: projectIds[0],
    taskId: taskIds[0],
    userId: userIds[0],
    action: 'created_task',
    details: 'Task "Design Database Schema" was created'
  },
  {
    projectId: projectIds[0],
    taskId: taskIds[0],
    userId: userIds[0],
    action: 'changed_status',
    details: 'Task "Design Database Schema" moved from To Do to Done'
  },
  {
    projectId: projectIds[0],
    taskId: taskIds[1],
    userId: userIds[0],
    action: 'assigned_user',
    details: 'Task "Implement Authentication" was assigned to Sara Ali'
  },
  {
    projectId: projectIds[1],
    taskId: taskIds[5],
    userId: userIds[1],
    action: 'created_task',
    details: 'Task "Build Product API" was created'
  },
  {
    projectId: projectIds[2],
    taskId: taskIds[7],
    userId: userIds[2],
    action: 'added_comment',
    details: 'Comment added to task "Setup React Native Project"'
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    console.log('🌱 Seeding database...');

    // Clear existing data
    await User.deleteMany();
    await Project.deleteMany();
    await Task.deleteMany();
    await Comment.deleteMany();
    await Activity.deleteMany();

    console.log('🗑️  Existing data cleared');

    // Hash passwords
    const salt = await bcrypt.genSalt(10);
    const hashedUsers = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, salt)
      }))
    );

    // Insert users
    const createdUsers = await User.insertMany(hashedUsers);
    const userIds = createdUsers.map(user => user._id);
    console.log(`✅ ${createdUsers.length} users created`);

    // Insert projects
    const projectData = getProjects(userIds);
    const createdProjects = await Project.insertMany(projectData);
    const projectIds = createdProjects.map(project => project._id);
    console.log(`✅ ${createdProjects.length} projects created`);

    // Insert tasks
    const taskData = getTasks(projectIds, userIds);
    const createdTasks = await Task.insertMany(taskData);
    const taskIds = createdTasks.map(task => task._id);
    console.log(`✅ ${createdTasks.length} tasks created`);

    // Insert comments
    const commentData = getComments(taskIds, userIds);
    const createdComments = await Comment.insertMany(commentData);
    console.log(`✅ ${createdComments.length} comments created`);

    // Insert activities
    const activityData = getActivities(projectIds, taskIds, userIds);
    const createdActivities = await Activity.insertMany(activityData);
    console.log(`✅ ${createdActivities.length} activities created`);

    console.log('🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed
seedDatabase();