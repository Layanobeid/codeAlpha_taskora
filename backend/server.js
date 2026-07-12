const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const colors = require('colors');
const path = require('path');

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
      tasks: '/api/tasks'
    }
  });
});

// Error handler (should be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`.yellow.bold);
  console.log(`📡 http://localhost:${PORT}`.blue);
});