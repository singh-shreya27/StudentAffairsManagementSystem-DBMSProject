const { body, validationResult, param, query } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Common validation rules
const commonValidations = {
  id: param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
  email: body('email').isEmail().normalizeEmail().withMessage('Must be a valid email address'),
  phone: body('contact_number').optional().isMobilePhone().withMessage('Must be a valid phone number'),
  date: (field) => body(field).optional().isISO8601().toDate().withMessage('Must be a valid date'),
  positiveInteger: (field) => body(field).optional().isInt({ min: 1 }).withMessage(`${field} must be a positive integer`),
  nonEmptyString: (field) => body(field).trim().notEmpty().withMessage(`${field} is required and cannot be empty`),
  optionalString: (field) => body(field).optional().trim(),
  enumValue: (field, values) => body(field).optional().isIn(values).withMessage(`${field} must be one of: ${values.join(', ')}`)
};

// Student validation rules
const studentValidation = [
  commonValidations.nonEmptyString('student_name'),
  body('student_id').isInt({ min: 1 }).withMessage('Student ID must be a positive integer'),
  commonValidations.email,
  commonValidations.positiveInteger('department_id'),
  commonValidations.positiveInteger('hostel_id'),
  commonValidations.positiveInteger('mess_id'),
  commonValidations.phone,
  commonValidations.date('date_of_birth'),
  commonValidations.enumValue('gender', ['Male', 'Female', 'Other']),
  commonValidations.optionalString('address'),
  body('admission_year').optional().isInt({ min: 2000, max: new Date().getFullYear() }).withMessage('Admission year must be valid'),
  commonValidations.enumValue('status', ['Active', 'Graduated', 'On Leave', 'Withdrawn']),
  handleValidationErrors
];

// Department validation rules
const departmentValidation = [
  body('department_id').isInt({ min: 1 }).withMessage('Department ID must be a positive integer'),
  commonValidations.nonEmptyString('department_name'),
  body('department_code').trim().notEmpty().isLength({ min: 2, max: 10 }).withMessage('Department code must be 2-10 characters'),
  handleValidationErrors
];

// Staff validation rules
const staffValidation = [
  body('staff_id').isInt({ min: 1 }).withMessage('Staff ID must be a positive integer'),
  commonValidations.nonEmptyString('staff_name'),
  commonValidations.nonEmptyString('designation'),
  commonValidations.positiveInteger('department_id'),
  commonValidations.email,
  commonValidations.phone,
  handleValidationErrors
];

// Hostel validation rules
const hostelValidation = [
  body('hostel_id').isInt({ min: 1 }).withMessage('Hostel ID must be a positive integer'),
  commonValidations.nonEmptyString('hostel_name'),
  commonValidations.positiveInteger('warden_id'),
  handleValidationErrors
];

// Room validation rules
const roomValidation = [
  body('room_id').isInt({ min: 1 }).withMessage('Room ID must be a positive integer'),
  commonValidations.positiveInteger('hostel_id'),
  commonValidations.nonEmptyString('room_number'),
  body('capacity').isInt({ min: 1, max: 20 }).withMessage('Capacity must be between 1 and 20'),
  handleValidationErrors
];

// Room allocation validation rules
const roomAllocationValidation = [
  body('allocation_id').isInt({ min: 1 }).withMessage('Allocation ID must be a positive integer'),
  commonValidations.positiveInteger('student_id'),
  commonValidations.positiveInteger('room_id'),
  commonValidations.date('start_date'),
  commonValidations.date('end_date'),
  body('end_date').optional().custom((endDate, { req }) => {
    if (endDate && req.body.start_date && new Date(endDate) <= new Date(req.body.start_date)) {
      throw new Error('End date must be after start date');
    }
    return true;
  }),
  handleValidationErrors
];

// Mess validation rules
const messValidation = [
  body('mess_id').isInt({ min: 1 }).withMessage('Mess ID must be a positive integer'),
  commonValidations.nonEmptyString('mess_name'),
  commonValidations.positiveInteger('mess_incharge_id'),
  handleValidationErrors
];

// Mess subscription validation rules
const messSubscriptionValidation = [
  body('subscription_id').isInt({ min: 1 }).withMessage('Subscription ID must be a positive integer'),
  commonValidations.positiveInteger('student_id'),
  commonValidations.positiveInteger('mess_id'),
  commonValidations.date('start_date'),
  commonValidations.date('end_date'),
  handleValidationErrors
];

// Disciplinary action validation rules
const disciplinaryActionValidation = [
  body('action_id').isInt({ min: 1 }).withMessage('Action ID must be a positive integer'),
  commonValidations.positiveInteger('student_id'),
  commonValidations.date('incident_date'),
  commonValidations.nonEmptyString('description'),
  commonValidations.nonEmptyString('action_taken'),
  body('fine_amount').optional().isFloat({ min: 0 }).withMessage('Fine amount must be a positive number'),
  commonValidations.enumValue('severity', ['Minor', 'Major', 'Severe']),
  commonValidations.positiveInteger('recorded_by'),
  commonValidations.enumValue('status', ['Active', 'Closed']),
  handleValidationErrors
];

// Organization validation rules
const organizationValidation = [
  body('org_id').isInt({ min: 1 }).withMessage('Organization ID must be a positive integer'),
  commonValidations.nonEmptyString('org_name'),
  commonValidations.enumValue('org_type', ['Club', 'Sports', 'Society']),
  commonValidations.enumValue('category', ['Technical', 'Cultural', 'Social', 'Sports']),
  commonValidations.positiveInteger('faculty_coordinator_id'),
  commonValidations.positiveInteger('coordinator_id'),
  commonValidations.positiveInteger('secretary_id'),
  commonValidations.positiveInteger('head_id'),
  commonValidations.positiveInteger('parent_org_id'),
  body('budget').optional().isFloat({ min: 0 }).withMessage('Budget must be a positive number'),
  commonValidations.optionalString('coach_name'),
  commonValidations.optionalString('coach_contact'),
  commonValidations.optionalString('description'),
  handleValidationErrors
];

// Event validation rules
const eventValidation = [
  body('event_id').isInt({ min: 1 }).withMessage('Event ID must be a positive integer'),
  commonValidations.nonEmptyString('event_name'),
  commonValidations.enumValue('event_type', ['Cultural', 'Technical', 'Workshop', 'Sports']),
  commonValidations.positiveInteger('organizing_org_id'),
  commonValidations.date('event_date'),
  commonValidations.optionalString('venue'),
  commonValidations.enumValue('event_level', ['Intra-College', 'Inter-College', 'National']),
  commonValidations.optionalString('description'),
  body('budget').optional().isFloat({ min: 0 }).withMessage('Budget must be a positive number'),
  handleValidationErrors
];

// Placement validation rules
const placementValidation = [
  body('placement_id').isInt({ min: 1 }).withMessage('Placement ID must be a positive integer'),
  commonValidations.positiveInteger('student_id'),
  commonValidations.nonEmptyString('company_name'),
  commonValidations.nonEmptyString('role_offered'),
  body('package_offered').isFloat({ min: 0 }).withMessage('Package must be a positive number'),
  commonValidations.enumValue('placement_type', ['Internship', 'Full-Time']),
  commonValidations.date('placement_date'),
  commonValidations.enumValue('status', ['Placed', 'Not Placed', 'Offer Declined']),
  handleValidationErrors
];

// Membership validation rules
const membershipValidation = [
  body('membership_id').isInt({ min: 1 }).withMessage('Membership ID must be a positive integer'),
  commonValidations.positiveInteger('student_id'),
  commonValidations.positiveInteger('org_id'),
  commonValidations.optionalString('role'),
  commonValidations.date('join_date'),
  commonValidations.date('end_date'),
  handleValidationErrors
];

// Event participation validation rules
const eventParticipationValidation = [
  body('participation_id').isInt({ min: 1 }).withMessage('Participation ID must be a positive integer'),
  commonValidations.positiveInteger('event_id'),
  commonValidations.positiveInteger('student_id'),
  commonValidations.enumValue('role', ['Participant', 'Organizer', 'Volunteer']),
  commonValidations.optionalString('position_secured'),
  commonValidations.optionalString('medal'),
  body('certificate_issued').optional().isBoolean().withMessage('Certificate issued must be true or false'),
  handleValidationErrors
];

// Payment validation rules
const paymentValidation = [
  body('payment_id').isInt({ min: 1 }).withMessage('Payment ID must be a positive integer'),
  commonValidations.positiveInteger('student_id'),
  commonValidations.enumValue('payment_type', ['Hostel Fee', 'Mess Fee', 'Fine', 'Event Fee', 'Other']),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  commonValidations.date('payment_date'),
  commonValidations.enumValue('payment_status', ['Pending', 'Completed', 'Failed']),
  commonValidations.optionalString('transaction_id'),
  handleValidationErrors
];

// Feedback validation rules
const feedbackValidation = [
  body('feedback_id').isInt({ min: 1 }).withMessage('Feedback ID must be a positive integer'),
  commonValidations.positiveInteger('student_id'),
  commonValidations.enumValue('category', ['Hostel', 'Mess', 'Event', 'Course', 'General']),
  commonValidations.positiveInteger('reference_id'),
  commonValidations.nonEmptyString('feedback_text'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  commonValidations.date('feedback_date'),
  handleValidationErrors
];

// Alumni validation rules
const alumniValidation = [
  body('alumni_id').isInt({ min: 1 }).withMessage('Alumni ID must be a positive integer'),
  commonValidations.positiveInteger('student_id'),
  body('graduation_year').isInt({ min: 2000, max: new Date().getFullYear() }).withMessage('Graduation year must be valid'),
  commonValidations.optionalString('current_position'),
  commonValidations.optionalString('company_name'),
  commonValidations.optionalString('location'),
  body('linkedin_url').optional().isURL().withMessage('LinkedIn URL must be valid'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Email must be valid'),
  handleValidationErrors
];

// Networking validation rules
const networkingValidation = [
  body('connection_id').isInt({ min: 1 }).withMessage('Connection ID must be a positive integer'),
  commonValidations.positiveInteger('alumni_id'),
  commonValidations.positiveInteger('student_id'),
  commonValidations.enumValue('connection_type', ['Mentorship', 'Referral', 'Collaboration']),
  commonValidations.date('initiated_date'),
  commonValidations.enumValue('status', ['Active', 'Closed']),
  handleValidationErrors
];

// Recruiter validation rules
const recruiterValidation = [
  body('recruiter_id').isInt({ min: 1 }).withMessage('Recruiter ID must be a positive integer'),
  commonValidations.nonEmptyString('company_name'),
  commonValidations.optionalString('industry_type'),
  commonValidations.optionalString('contact_person'),
  body('contact_email').optional().isEmail().normalizeEmail().withMessage('Contact email must be valid'),
  commonValidations.phone,
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  studentValidation,
  departmentValidation,
  staffValidation,
  hostelValidation,
  roomValidation,
  roomAllocationValidation,
  messValidation,
  messSubscriptionValidation,
  disciplinaryActionValidation,
  organizationValidation,
  eventValidation,
  placementValidation,
  membershipValidation,
  eventParticipationValidation,
  paymentValidation,
  feedbackValidation,
  alumniValidation,
  networkingValidation,
  recruiterValidation,
  commonValidations
};