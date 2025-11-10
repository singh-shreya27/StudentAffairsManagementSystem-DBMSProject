# 🎓 IIT Jammu Student Affairs System

A comprehensive web-based student affairs management system for IIT Jammu, featuring a RESTful API backend built with Node.js/Express and a modern frontend interface.

## 📋 Features

- **Student Management**: Complete CRUD operations for student records
- **Department Management**: Manage academic departments
- **Staff Management**: Track faculty and staff information
- **Hostel Management**: Manage hostel allocations and room assignments
- **Mess Management**: Handle mess subscriptions and operations
- **Events Management**: Organize and track campus events
- **Organizations Management**: Manage clubs, societies, and sports teams
- **Placements Management**: Track student placements and recruiters
- **Alumni Network**: Maintain alumni database and networking
- **Disciplinary Actions**: Record and manage disciplinary cases
- **Payments System**: Track various fee payments
- **Feedback System**: Collect and manage feedback

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **mysql2** - MySQL client for Node.js
- **CORS** - Cross-Origin Resource Sharing
- **dotenv** - Environment variable management

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling with modern gradients and animations
- **Vanilla JavaScript** - Client-side logic
- **Fetch API** - HTTP requests

## 📁 Project Structure

```
DBMS_PROJECT/
├── backend/
│   ├── config/
│   │   └── database.js          # Database connection configuration
│   ├── db/
│   │   └── schema.sql            # Complete database schema
│   ├── routes/
│   │   ├── students.js           # Student CRUD endpoints
│   │   ├── departments.js        # Department CRUD endpoints
│   │   ├── staff.js              # Staff CRUD endpoints
│   │   ├── hostels.js            # Hostel CRUD endpoints
│   │   ├── mess.js               # Mess CRUD endpoints
│   │   ├── events.js             # Events CRUD endpoints
│   │   ├── organizations.js      # Organizations CRUD endpoints
│   │   └── placements.js         # Placements CRUD endpoints
│   ├── .env.example              # Environment variables template
│   ├── package.json              # Backend dependencies
│   └── server.js                 # Express server entry point
├── frontend/
│   ├── index.html                # Main HTML file
│   ├── styles.css                # Styling
│   └── app.js                    # Frontend JavaScript
└── README.md                     # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MySQL** (v8.0 or higher) - [Download](https://dev.mysql.com/downloads/)
- **Git** (optional) - [Download](https://git-scm.com/)

### Installation Steps

#### 1. Clone or Download the Project

If using Git:
```powershell
git clone <repository-url>
cd DBMS_PROJECT
```

Or simply extract the downloaded project folder.

#### 2. Set Up MySQL Database

Open MySQL Command Line or MySQL Workbench and run:

```sql
-- Import the schema
source C:/Users/harsh/Desktop/DBMS_PROJECT/backend/db/schema.sql
```

Or manually copy and execute the SQL from `backend/db/schema.sql`

This will create:
- Database: `iit_jammu_student_affairs`
- All required tables with proper relationships

#### 3. Configure Environment Variables

Navigate to the backend folder:
```powershell
cd backend
```

Copy the example environment file:
```powershell
copy .env.example .env
```

Edit `.env` file with your MySQL credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=iit_jammu_student_affairs
DB_PORT=3306
PORT=3000
```

#### 4. Install Backend Dependencies

Still in the `backend` folder:
```powershell
npm install
```

This will install:
- express
- mysql2
- cors
- dotenv
- nodemon (dev dependency)

#### 5. Start the Backend Server

```powershell
npm start
```

Or for development with auto-reload:
```powershell
npm run dev
```

You should see:
```
Server is running on http://localhost:3000
API available at http://localhost:3000/api
```

#### 6. Access the Application

Open your web browser and navigate to:
```
http://localhost:3000
```

The frontend will automatically be served by the Express server.

## 📡 API Endpoints

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Departments
- `GET /api/departments` - Get all departments
- `GET /api/departments/:id` - Get department by ID
- `POST /api/departments` - Create new department
- `PUT /api/departments/:id` - Update department
- `DELETE /api/departments/:id` - Delete department

### Staff
- `GET /api/staff` - Get all staff
- `GET /api/staff/:id` - Get staff by ID
- `POST /api/staff` - Create new staff
- `PUT /api/staff/:id` - Update staff
- `DELETE /api/staff/:id` - Delete staff

### Hostels
- `GET /api/hostels` - Get all hostels
- `GET /api/hostels/:id` - Get hostel by ID
- `POST /api/hostels` - Create new hostel
- `PUT /api/hostels/:id` - Update hostel
- `DELETE /api/hostels/:id` - Delete hostel

### Mess
- `GET /api/mess` - Get all mess
- `GET /api/mess/:id` - Get mess by ID
- `POST /api/mess` - Create new mess
- `PUT /api/mess/:id` - Update mess
- `DELETE /api/mess/:id` - Delete mess

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Organizations
- `GET /api/organizations` - Get all organizations
- `GET /api/organizations/:id` - Get organization by ID
- `POST /api/organizations` - Create new organization
- `PUT /api/organizations/:id` - Update organization
- `DELETE /api/organizations/:id` - Delete organization

### Placements
- `GET /api/placements` - Get all placements
- `GET /api/placements/:id` - Get placement by ID
- `POST /api/placements` - Create new placement
- `PUT /api/placements/:id` - Update placement
- `DELETE /api/placements/:id` - Delete placement

## 💡 Usage Guide

### Adding a New Student

1. Click on the **Students** tab
2. Click the **+ Add Student** button
3. Fill in the student details:
   - Student ID (required)
   - Name (required)
   - Email (required)
   - Department ID, Hostel ID, Mess ID (optional)
   - Contact, DOB, Gender, Address, Admission Year
   - Status (Active/Graduated/On Leave/Withdrawn)
4. Click **Save Student**

### Adding a New Department

1. Click on the **Departments** tab
2. Click the **+ Add Department** button
3. Enter Department ID, Name, and Code
4. Click **Save Department**

### Adding Staff Members

1. Click on the **Staff** tab
2. Click the **+ Add Staff** button
3. Fill in staff details including designation and department
4. Click **Save Staff**

### Managing Other Entities

Similar process for Hostels, Mess, Events, Organizations, and Placements.

## 🔧 Troubleshooting

### Database Connection Issues

**Error: "Access denied for user"**
- Check your MySQL credentials in `.env`
- Ensure MySQL service is running

**Error: "Unknown database"**
- Make sure you've imported the schema.sql file
- Verify database name matches `.env` configuration

### Port Already in Use

**Error: "EADDRINUSE"**
- Change the PORT in `.env` file
- Or stop the process using port 3000:
  ```powershell
  netstat -ano | findstr :3000
  taskkill /PID <process_id> /F
  ```

### CORS Issues

If accessing from a different port, update CORS configuration in `server.js`:
```javascript
app.use(cors({
  origin: 'http://localhost:YOUR_PORT'
}));
```

### Frontend Not Loading Data

- Check browser console for errors (F12)
- Verify API_BASE_URL in `frontend/app.js`
- Ensure backend server is running
- Check network tab for failed requests

## 🎨 Customization

### Changing Colors/Theme

Edit `frontend/styles.css`:
```css
/* Change gradient colors */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Adding New Routes

1. Create route file in `backend/routes/`
2. Import and use in `server.js`:
   ```javascript
   const newRouter = require('./routes/new');
   app.use('/api/new', newRouter);
   ```

### Database Schema Modifications

1. Update `backend/db/schema.sql`
2. Drop and recreate database or use ALTER statements
3. Update corresponding route files

## 📊 Database Schema Overview

### Core Tables
- **Students** - Student information and status
- **Departments** - Academic departments
- **Staff** - Faculty and staff members
- **Hostels** - Hostel information
- **Rooms** - Room details and capacity
- **Mess** - Mess facilities

### Operational Tables
- **Room_Allocations** - Student room assignments
- **Mess_Subscriptions** - Mess subscriptions
- **Disciplinary_Actions** - Disciplinary records
- **Payments** - Fee payments tracking

### Activities Tables
- **Organizations** - Clubs, sports, societies
- **Memberships** - Student memberships
- **Events** - Campus events
- **Event_Participation** - Event participation records

### Career Tables
- **Placements** - Placement records
- **Recruiters** - Recruiting companies
- **Alumni** - Alumni database
- **Networking** - Alumni-student connections

### Feedback
- **Feedback_System** - Comprehensive feedback mechanism

## 🚀 Next Steps & Enhancements

### Immediate Improvements
1. **Authentication & Authorization**
   - Add JWT-based authentication
   - Role-based access control (Admin, Staff, Student)
   - Secure routes with middleware

2. **Input Validation**
   - Add express-validator
   - Client-side validation
   - Sanitize inputs

3. **Error Handling**
   - Centralized error handler
   - Better error messages
   - Logging system

4. **Additional CRUD Forms**
   - Complete forms for all entities
   - Edit functionality
   - Bulk operations

### Advanced Features
1. **Search & Filtering**
   - Advanced search functionality
   - Multi-field filters
   - Export to CSV/Excel

2. **Analytics Dashboard**
   - Statistics and charts
   - Reports generation
   - Data visualization

3. **Notifications**
   - Email notifications
   - Push notifications
   - SMS integration

4. **File Uploads**
   - Profile pictures
   - Document management
   - Certificate generation

5. **Real-time Features**
   - WebSocket integration
   - Live updates
   - Chat system

### Production Deployment
1. **Security**
   - HTTPS/SSL
   - Rate limiting
   - SQL injection prevention
   - XSS protection

2. **Performance**
   - Database indexing
   - Query optimization
   - Caching (Redis)
   - Load balancing

3. **Testing**
   - Unit tests (Jest)
   - Integration tests
   - E2E tests (Cypress)

4. **DevOps**
   - Docker containerization
   - CI/CD pipeline
   - Cloud deployment (AWS/Azure/GCP)
   - Monitoring & logging

## 📝 Sample Data

To populate the database with sample data, you can run:

```sql
-- Add sample department
INSERT INTO Departments VALUES (1, 'Computer Science', 'CSE');

-- Add sample staff
INSERT INTO Staff VALUES (1, 'Dr. John Doe', 'Professor', 1, 'john@iitjammu.ac.in', '1234567890');

-- Add sample hostel
INSERT INTO Hostels VALUES (1, 'Hostel A', 1);

-- Add sample student
INSERT INTO Students VALUES 
(101, 'Alice Smith', 1, 1, 1, '9876543210', 'alice@iitjammu.ac.in', 
'2003-05-15', 'Female', '123 Main St', 2021, 'Active');
```

## 🤝 Contributing

To contribute to this project:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is created for educational purposes as part of a DBMS course project.

## 👥 Contact

For issues or questions:
- Create an issue in the repository
- Contact the development team
- Email: support@iitjammu.ac.in

## 🙏 Acknowledgments

- IIT Jammu for project requirements
- Node.js and Express.js communities
- MySQL documentation

---

**Happy Coding! 🚀**

Made with ❤️ for IIT Jammu
