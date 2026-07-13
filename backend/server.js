const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const colors = require('colors');
const path = require('path');
const http = require('http'); // ← جديد
const socketIo = require('socket.io'); // ← جديد

// Load env vars - USE ABSOLUTE PATH
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('📁 Current directory:', __dirname);
console.log('📁 JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');

// Import config
const connectDB = require('./src/config/db');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const projectRoutes = require('./src/routes/projectRoutes');
const taskRoutes = require('./src/routes/taskRoutes');
const aiRoutes = require('./src/routes/aiRoutes');

// Import middleware
const { errorHandler } = require('./src/middleware/errorHandler');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/ai', aiRoutes);

// Home route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Taskora API is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      projects: '/api/projects',
      tasks: '/api/tasks',
      ai: '/api/ai'
    }
  });
});

// ===== SOCKET.IO =====
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  // Join project room
  socket.on('join-project', (projectId) => {
    socket.join(`project-${projectId}`);
    console.log(`📋 Client ${socket.id} joined project: ${projectId}`);
  });

  // Leave project room
  socket.on('leave-project', (projectId) => {
    socket.leave(`project-${projectId}`);
    console.log(`📋 Client ${socket.id} left project: ${projectId}`);
  });

  // Task created
  socket.on('task-created', (data) => {
    console.log('📝 Task created:', data);
    io.to(`project-${data.projectId}`).emit('task-created', data);
  });

  // Task updated
  socket.on('task-updated', (data) => {
    console.log('📝 Task updated:', data);
    io.to(`project-${data.projectId}`).emit('task-updated', data);
  });

  // Task status changed
  socket.on('task-status-changed', (data) => {
    console.log('📝 Task status changed:', data);
    io.to(`project-${data.projectId}`).emit('task-status-changed', data);
  });

  // Comment added
  socket.on('comment-added', (data) => {
    console.log('💬 Comment added:', data);
    io.to(`project-${data.projectId}`).emit('comment-added', data);
  });

  // Member added
  socket.on('member-added', (data) => {
    console.log('👥 Member added:', data);
    io.to(`project-${data.projectId}`).emit('member-added', data);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Error handler (should be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

// Use server.listen instead of app.listen
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`.yellow.bold);
  console.log(`📡 http://localhost:${PORT}`.blue);
  console.log(`🔌 WebSocket server ready`.green.bold);
});
