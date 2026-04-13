// Global Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
};

// 404 Handler
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
};

module.exports = { errorHandler, notFoundHandler };
