const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import middleware
const { errorHandler, notFoundHandler, requestLogger, rateLimitHandler } = require('./middleware/errorHandler');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false // Disable for development, configure for production
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler
});

// Apply rate limiting to API routes only
app.use('/api', limiter);

// Logging middleware
app.use(requestLogger);

// Basic middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Swagger documentation
const swagger = require('./config/swagger');
app.use('/api-docs', swagger.serve, swagger.setup);

// Import routes
const authRouter = require('./routes/auth');
const dashboardRouter = require('./routes/dashboard');
const studentsRouter = require('./routes/students');
const departmentsRouter = require('./routes/departments');
const staffRouter = require('./routes/staff');
const hostelsRouter = require('./routes/hostels');
const messRouter = require('./routes/mess');
const eventsRouter = require('./routes/events');
const organizationsRouter = require('./routes/organizations');
const placementsRouter = require('./routes/placements');
const roomsRouter = require('./routes/rooms');
const roomAllocationsRouter = require('./routes/room_allocations');
const messSubscriptionsRouter = require('./routes/mess_subscriptions');
const disciplinaryActionsRouter = require('./routes/disciplinary_actions');
const membershipsRouter = require('./routes/memberships');
const eventParticipationRouter = require('./routes/event_participation');
const recruitersRouter = require('./routes/recruiters');
const paymentsRouter = require('./routes/payments');
const feedbackRouter = require('./routes/feedback');
const alumniRouter = require('./routes/alumni');
const networkingRouter = require('./routes/networking');

// Public API routes (no authentication required)
app.use('/api/auth', authRouter);

// Protected API routes (authentication required)
app.use('/api/dashboard', authenticateToken, dashboardRouter);
app.use('/api/students', authenticateToken, studentsRouter);
app.use('/api/departments', authenticateToken, departmentsRouter);
app.use('/api/staff', authenticateToken, staffRouter);
app.use('/api/hostels', authenticateToken, hostelsRouter);
app.use('/api/mess', authenticateToken, messRouter);
app.use('/api/events', authenticateToken, eventsRouter);
app.use('/api/organizations', authenticateToken, organizationsRouter);
app.use('/api/placements', authenticateToken, placementsRouter);
app.use('/api/rooms', authenticateToken, roomsRouter);
app.use('/api/room-allocations', authenticateToken, roomAllocationsRouter);
app.use('/api/mess-subscriptions', authenticateToken, messSubscriptionsRouter);
app.use('/api/disciplinary-actions', authenticateToken, disciplinaryActionsRouter);
app.use('/api/memberships', authenticateToken, membershipsRouter);
app.use('/api/event-participation', authenticateToken, eventParticipationRouter);
app.use('/api/recruiters', authenticateToken, recruitersRouter);
app.use('/api/payments', authenticateToken, paymentsRouter);
app.use('/api/feedback', authenticateToken, feedbackRouter);
app.use('/api/alumni', authenticateToken, alumniRouter);
app.use('/api/networking', networkingRouter);

// Root route
app.get('/api', (req, res) => {
  res.json({ 
    message: 'IIT Jammu Student Affairs API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    documentation: '/api-docs',
    endpoints: {
      auth: '/api/auth',
      dashboard: '/api/dashboard (protected)',
      students: '/api/students (protected)',
      departments: '/api/departments (protected)',
      staff: '/api/staff (protected)',
      hostels: '/api/hostels (protected)',
      mess: '/api/mess (protected)',
      events: '/api/events (protected)',
      organizations: '/api/organizations (protected)',
      placements: '/api/placements (protected)',
      rooms: '/api/rooms (protected)',
      roomAllocations: '/api/room-allocations (protected)',
      messSubscriptions: '/api/mess-subscriptions (protected)',
      disciplinaryActions: '/api/disciplinary-actions (protected)',
      memberships: '/api/memberships (protected)',
      eventParticipation: '/api/event-participation (protected)',
      recruiters: '/api/recruiters (protected)',
      payments: '/api/payments (protected)',
      feedback: '/api/feedback (protected)',
      alumni: '/api/alumni (protected)',
      networking: '/api/networking (protected)'
    },
    authentication: {
      login: 'POST /api/auth/login',
      logout: 'POST /api/auth/logout',
      verify: 'GET /api/auth/verify',
      refresh: 'POST /api/auth/refresh'
    }
  });
});

// Catch-all route to serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handling middleware (should be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
