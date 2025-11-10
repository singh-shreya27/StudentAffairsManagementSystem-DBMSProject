const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Error logger function
const logError = (error, req, additionalInfo = {}) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    body: req.body,
    params: req.params,
    query: req.query,
    ...additionalInfo
  };

  const logString = JSON.stringify(logEntry, null, 2) + '\n\n';
  const logFile = path.join(logsDir, `error-${new Date().toISOString().split('T')[0]}.log`);
  
  fs.appendFile(logFile, logString, (err) => {
    if (err) {
      console.error('Failed to write to error log:', err);
    }
  });

  // Also log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error logged:', logEntry);
  }
};

// Database error handler
const handleDatabaseError = (error, req, res) => {
  logError(error, req, { type: 'DATABASE_ERROR' });

  // MySQL specific error handling
  if (error.code) {
    switch (error.code) {
      case 'ER_DUP_ENTRY':
        return res.status(409).json({
          error: 'Duplicate entry',
          message: 'A record with this information already exists',
          code: 'DUPLICATE_ENTRY'
        });
      
      case 'ER_NO_REFERENCED_ROW_2':
        return res.status(400).json({
          error: 'Foreign key constraint failed',
          message: 'Referenced record does not exist',
          code: 'FOREIGN_KEY_ERROR'
        });
      
      case 'ER_ROW_IS_REFERENCED_2':
        return res.status(400).json({
          error: 'Cannot delete record',
          message: 'This record is referenced by other data and cannot be deleted',
          code: 'REFERENCE_CONSTRAINT_ERROR'
        });
      
      case 'ER_DATA_TOO_LONG':
        return res.status(400).json({
          error: 'Data too long',
          message: 'One or more fields exceed maximum length',
          code: 'DATA_LENGTH_ERROR'
        });
      
      case 'ER_BAD_NULL_ERROR':
        return res.status(400).json({
          error: 'Required field missing',
          message: 'A required field cannot be null',
          code: 'NULL_CONSTRAINT_ERROR'
        });
      
      case 'ECONNREFUSED':
        return res.status(503).json({
          error: 'Database connection failed',
          message: 'Unable to connect to the database',
          code: 'DB_CONNECTION_ERROR'
        });
      
      default:
        return res.status(500).json({
          error: 'Database error',
          message: 'An unexpected database error occurred',
          code: 'DATABASE_ERROR'
        });
    }
  }

  // Generic database error
  return res.status(500).json({
    error: 'Database error',
    message: 'An unexpected database error occurred',
    code: 'DATABASE_ERROR'
  });
};

// Main error handling middleware
const errorHandler = (error, req, res, next) => {
  // If response was already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(error);
  }

  // Handle specific error types
  if (error.code && error.code.startsWith('ER_')) {
    return handleDatabaseError(error, req, res);
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    logError(error, req, { type: 'JWT_ERROR' });
    return res.status(401).json({
      error: 'Invalid token',
      message: 'Authentication token is invalid',
      code: 'INVALID_TOKEN'
    });
  }

  if (error.name === 'TokenExpiredError') {
    logError(error, req, { type: 'JWT_EXPIRED' });
    return res.status(401).json({
      error: 'Token expired',
      message: 'Authentication token has expired',
      code: 'TOKEN_EXPIRED'
    });
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    logError(error, req, { type: 'VALIDATION_ERROR' });
    return res.status(400).json({
      error: 'Validation failed',
      message: error.message,
      code: 'VALIDATION_ERROR'
    });
  }

  // Handle syntax errors (malformed JSON, etc.)
  if (error.type === 'entity.parse.failed') {
    logError(error, req, { type: 'PARSE_ERROR' });
    return res.status(400).json({
      error: 'Invalid request format',
      message: 'Request body contains invalid JSON',
      code: 'PARSE_ERROR'
    });
  }

  // Handle file system errors
  if (error.code === 'ENOENT') {
    logError(error, req, { type: 'FILE_NOT_FOUND' });
    return res.status(404).json({
      error: 'File not found',
      message: 'The requested file could not be found',
      code: 'FILE_NOT_FOUND'
    });
  }

  // Handle permission errors
  if (error.code === 'EACCES') {
    logError(error, req, { type: 'PERMISSION_ERROR' });
    return res.status(403).json({
      error: 'Permission denied',
      message: 'Insufficient permissions to perform this operation',
      code: 'PERMISSION_DENIED'
    });
  }

  // Log unknown errors
  logError(error, req, { type: 'UNKNOWN_ERROR' });

  // Generic server error
  return res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred',
    code: 'INTERNAL_ERROR',
    // Include stack trace in development
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  });
};

// 404 handler for undefined routes
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  
  logError(error, req, { type: 'ROUTE_NOT_FOUND' });
  
  res.status(404).json({
    error: 'Route not found',
    message: `The requested endpoint ${req.method} ${req.originalUrl} does not exist`,
    code: 'ROUTE_NOT_FOUND',
    availableEndpoints: [
      'GET /api',
      'POST /api/auth/login',
      'GET /api/students',
      'GET /api/departments',
      'GET /api/staff',
      'GET /api/hostels',
      'GET /api/mess',
      'GET /api/events',
      'GET /api/organizations',
      'GET /api/placements',
      // Add other endpoints...
    ]
  });
};

// Async error wrapper for route handlers
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Request logger middleware
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url} - IP: ${req.ip || req.connection.remoteAddress}`);
  next();
};

// Rate limiting error handler
const rateLimitHandler = (req, res) => {
  logError(new Error('Rate limit exceeded'), req, { type: 'RATE_LIMIT_ERROR' });
  
  res.status(429).json({
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: '15 minutes'
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  requestLogger,
  rateLimitHandler,
  logError,
  handleDatabaseError
};