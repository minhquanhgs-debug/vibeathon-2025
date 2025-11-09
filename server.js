require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const referralRoutes = require('./routes/referrals');
// const messageRoutes = require('./routes/messages'); // Chat disabled
// const aiRoutes = require('./routes/ai'); // AI routes disabled - can be enabled later

// Initialize express app
const app = express();
const server = http.createServer(app);

// Socket.io configuration for real-time features
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Connect to database
connectDB();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ReferHarmony API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/referrals', referralRoutes);
// app.use('/api/messages', messageRoutes); // Chat disabled
// app.use('/api/ai', aiRoutes); // AI routes disabled - can be enabled later

// Socket.io connection handling for real-time chat
io.on('connection', (socket) => {
  console.log('✅ New client connected:', socket.id);

  // Join a referral room
  socket.on('join_referral', (referralId) => {
    socket.join(`referral_${referralId}`);
    console.log(`Socket ${socket.id} joined referral room: ${referralId}`);
  });

  // Leave a referral room
  socket.on('leave_referral', (referralId) => {
    socket.leave(`referral_${referralId}`);
    console.log(`Socket ${socket.id} left referral room: ${referralId}`);
  });

  // Handle new message
  socket.on('new_message', (data) => {
    io.to(`referral_${data.referralId}`).emit('message_received', data);
  });

  // Handle referral status update
  socket.on('referral_status_update', (data) => {
    io.to(`referral_${data.referralId}`).emit('status_updated', data);
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    socket.to(`referral_${data.referralId}`).emit('user_typing', data);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════');
  console.log('  🏥 ReferHarmony API Server');
  console.log('  Bridging Care with Clarity and Precision');
  console.log('═══════════════════════════════════════════════');
  console.log(`  🚀 Server running on port ${PORT}`);
  console.log(`  📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  🌐 API URL: http://localhost:${PORT}`);
  console.log(`  💻 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
  console.log('═══════════════════════════════════════════════');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

module.exports = app;
