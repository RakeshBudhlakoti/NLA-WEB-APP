const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { globalLimiter, loginLimiter, otpLimiter, registerLimiter, postLimiter, connectionLimiter } = require('./src/middlewares/rate-limit.middleware');
const { sanitizeInput } = require('./src/middlewares/sanitize.middleware');

const app = express();

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// 🛡️ Global rate limit (200 req / 15 min per IP)
app.use(globalLimiter);

// 🧹 Global input sanitization (XSS + SQL injection detection)
app.use(sanitizeInput);

// Static folder for local uploads
app.use('/uploads', express.static('uploads'));

// Basic route
app.get('/', (req, res) => {
  res.json({ success: true, message: 'NLA API is running' });
});

// Routes (with targeted rate limiting)
app.use('/api/v1/auth/send-otp', otpLimiter);
app.use('/api/v1/auth/login', loginLimiter);
app.use('/api/v1/auth/register', registerLimiter);
app.use('/api/v1/auth', require('./src/routes/auth.routes'));
app.use('/api/v1/upload', require('./src/routes/upload.routes'));
app.use('/api/v1/users', require('./src/routes/user.routes'));
app.use('/api/v1/posts', require('./src/routes/post.routes'));
app.use('/api/v1', require('./src/routes/engagement.routes'));
app.use('/api/v1/search', require('./src/routes/search.routes'));
app.use('/api/v1', require('./src/routes/category.routes'));
app.use('/api/v1/admin', require('./src/routes/admin.routes'));
app.use('/api/v1/notifications', require('./src/routes/notification.routes'));
app.use('/api/v1/settings', require('./src/routes/setting.routes'));
app.use('/api/v1/connections', require('./src/routes/connection.routes'));
app.use('/api/v1/bookmarks', require('./src/routes/bookmark.routes'));

// 404 Handler for API routes
app.use('/api/v1', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.originalUrl}`,
    data: null
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    data: null,
    error: process.env.NODE_ENV === 'development' ? err : null
  });
});

module.exports = app;
