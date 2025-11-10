const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// JWT secret key - In production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here';

// Admin credentials - In production, store in database with hashed passwords
const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD || 'admin123' // Should be hashed in production
};

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Access denied. No token provided.',
      message: 'Please login to access this resource.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        message: 'Your session has expired. Please login again.'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        error: 'Invalid token',
        message: 'Invalid authentication token provided.'
      });
    }
    return res.status(403).json({ 
      error: 'Token verification failed',
      message: 'Unable to verify authentication token.'
    });
  }
};

// Admin login function
const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Username and password are required' 
      });
    }

    // Verify credentials
    if (username !== ADMIN_CREDENTIALS.username) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Invalid username or password'
      });
    }

    // In production, compare with hashed password using bcrypt
    // const isValidPassword = await bcrypt.compare(password, ADMIN_CREDENTIALS.password);
    const isValidPassword = password === ADMIN_CREDENTIALS.password;

    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Invalid username or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        username: username,
        role: 'admin',
        loginTime: new Date().toISOString()
      },
      JWT_SECRET,
      { 
        expiresIn: process.env.JWT_EXPIRES_IN || '24h' 
      }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        username,
        role: 'admin'
      },
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Internal server error during login',
      message: 'Please try again later'
    });
  }
};

// Refresh token function
const refreshToken = (req, res) => {
  try {
    const { user } = req; // From authenticateToken middleware

    // Generate new token
    const newToken = jwt.sign(
      { 
        username: user.username,
        role: user.role,
        loginTime: user.loginTime
      },
      JWT_SECRET,
      { 
        expiresIn: process.env.JWT_EXPIRES_IN || '24h' 
      }
    );

    res.json({
      message: 'Token refreshed successfully',
      token: newToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ 
      error: 'Failed to refresh token',
      message: 'Please login again'
    });
  }
};

// Logout function (client-side token removal mainly)
const adminLogout = (req, res) => {
  res.json({
    message: 'Logout successful',
    note: 'Please remove the token from client storage'
  });
};

// Verify token status
const verifyTokenStatus = (req, res) => {
  const { user } = req; // From authenticateToken middleware
  
  res.json({
    message: 'Token is valid',
    user: {
      username: user.username,
      role: user.role,
      loginTime: user.loginTime
    },
    tokenExp: new Date(user.exp * 1000)
  });
};

// Hash password utility (for production use)
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

module.exports = {
  authenticateToken,
  adminLogin,
  adminLogout,
  refreshToken,
  verifyTokenStatus,
  hashPassword
};