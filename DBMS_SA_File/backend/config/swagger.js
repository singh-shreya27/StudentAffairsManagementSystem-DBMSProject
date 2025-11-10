const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'IIT Jammu Student Affairs Management System API',
      version: '1.0.0',
      description: 'Comprehensive API for managing student affairs at IIT Jammu',
      contact: {
        name: 'Student Affairs Department',
        email: 'studentaffairs@iitjammu.ac.in'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            }
          }
        },
        Student: {
          type: 'object',
          properties: {
            student_id: {
              type: 'integer',
              description: 'Unique student identifier'
            },
            student_name: {
              type: 'string',
              description: 'Full name of the student'
            },
            department_id: {
              type: 'integer',
              description: 'ID of the department'
            },
            hostel_id: {
              type: 'integer',
              description: 'ID of the hostel'
            },
            mess_id: {
              type: 'integer',
              description: 'ID of the mess'
            },
            contact_number: {
              type: 'string',
              description: 'Contact phone number'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address'
            },
            date_of_birth: {
              type: 'string',
              format: 'date',
              description: 'Date of birth'
            },
            gender: {
              type: 'string',
              enum: ['Male', 'Female', 'Other'],
              description: 'Gender'
            },
            admission_year: {
              type: 'integer',
              description: 'Year of admission'
            },
            status: {
              type: 'string',
              enum: ['Active', 'Graduated', 'On Leave', 'Withdrawn'],
              description: 'Current status'
            },
            address: {
              type: 'string',
              description: 'Residential address'
            }
          },
          required: ['student_id', 'student_name', 'email']
        },
        Department: {
          type: 'object',
          properties: {
            department_id: {
              type: 'integer',
              description: 'Unique department identifier'
            },
            department_name: {
              type: 'string',
              description: 'Name of the department'
            },
            department_code: {
              type: 'string',
              description: 'Department code'
            }
          },
          required: ['department_id', 'department_name', 'department_code']
        },
        Staff: {
          type: 'object',
          properties: {
            staff_id: {
              type: 'integer',
              description: 'Unique staff identifier'
            },
            staff_name: {
              type: 'string',
              description: 'Full name of the staff member'
            },
            designation: {
              type: 'string',
              description: 'Job designation'
            },
            department_id: {
              type: 'integer',
              description: 'ID of the department'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address'
            },
            contact_number: {
              type: 'string',
              description: 'Contact phone number'
            }
          },
          required: ['staff_id', 'staff_name', 'designation', 'email']
        },
        Hostel: {
          type: 'object',
          properties: {
            hostel_id: {
              type: 'integer',
              description: 'Unique hostel identifier'
            },
            hostel_name: {
              type: 'string',
              description: 'Name of the hostel'
            },
            total_rooms: {
              type: 'integer',
              description: 'Total number of rooms'
            },
            warden_id: {
              type: 'integer',
              description: 'ID of the warden (staff member)'
            }
          },
          required: ['hostel_id', 'hostel_name']
        },
        Room: {
          type: 'object',
          properties: {
            room_id: {
              type: 'integer',
              description: 'Unique room identifier'
            },
            hostel_id: {
              type: 'integer',
              description: 'ID of the hostel'
            },
            room_number: {
              type: 'string',
              description: 'Room number'
            },
            capacity: {
              type: 'integer',
              description: 'Room capacity'
            },
            current_occupancy: {
              type: 'integer',
              description: 'Current number of occupants'
            }
          },
          required: ['room_id', 'hostel_id', 'room_number', 'capacity']
        },
        Event: {
          type: 'object',
          properties: {
            event_id: {
              type: 'integer',
              description: 'Unique event identifier'
            },
            event_name: {
              type: 'string',
              description: 'Name of the event'
            },
            event_date: {
              type: 'string',
              format: 'date',
              description: 'Event date'
            },
            event_type: {
              type: 'string',
              description: 'Type of event'
            },
            organizing_org_id: {
              type: 'integer',
              description: 'ID of organizing organization'
            },
            description: {
              type: 'string',
              description: 'Event description'
            },
            venue: {
              type: 'string',
              description: 'Event venue'
            }
          },
          required: ['event_id', 'event_name', 'event_date', 'event_type']
        },
        Organization: {
          type: 'object',
          properties: {
            org_id: {
              type: 'integer',
              description: 'Unique organization identifier'
            },
            org_name: {
              type: 'string',
              description: 'Name of the organization'
            },
            org_type: {
              type: 'string',
              description: 'Type of organization'
            },
            description: {
              type: 'string',
              description: 'Organization description'
            },
            faculty_advisor_id: {
              type: 'integer',
              description: 'ID of faculty advisor'
            }
          },
          required: ['org_id', 'org_name', 'org_type']
        },
        Placement: {
          type: 'object',
          properties: {
            placement_id: {
              type: 'integer',
              description: 'Unique placement identifier'
            },
            student_id: {
              type: 'integer',
              description: 'ID of the student'
            },
            company_name: {
              type: 'string',
              description: 'Name of the company'
            },
            placement_type: {
              type: 'string',
              description: 'Type of placement'
            },
            package_offered: {
              type: 'number',
              format: 'decimal',
              description: 'Package offered'
            },
            placement_date: {
              type: 'string',
              format: 'date',
              description: 'Placement date'
            },
            status: {
              type: 'string',
              enum: ['Applied', 'Shortlisted', 'Placed', 'Rejected'],
              description: 'Placement status'
            }
          },
          required: ['placement_id', 'student_id', 'company_name', 'placement_type']
        },
        DashboardOverview: {
          type: 'object',
          properties: {
            overview: {
              type: 'object',
              properties: {
                students: { type: 'integer' },
                departments: { type: 'integer' },
                staff: { type: 'integer' },
                hostels: { type: 'integer' },
                rooms: { type: 'integer' },
                organizations: { type: 'integer' },
                events: { type: 'integer' },
                placements: { type: 'integer' },
                alumni: { type: 'integer' }
              }
            }
          }
        },
        LoginRequest: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              description: 'Admin username'
            },
            password: {
              type: 'string',
              description: 'Admin password'
            }
          },
          required: ['username', 'password']
        },
        LoginResponse: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              description: 'JWT authentication token'
            },
            message: {
              type: 'string',
              description: 'Success message'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js', './server.js'], // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);

module.exports = {
  specs,
  swaggerUi,
  serve: swaggerUi.serve,
  setup: swaggerUi.setup(specs, {
    explorer: true,
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #1f4e79; }
    `,
    customSiteTitle: "IIT Jammu Student Affairs API Documentation"
  })
};