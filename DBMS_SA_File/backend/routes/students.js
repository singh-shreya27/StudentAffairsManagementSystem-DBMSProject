const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Mock students data
const mockStudents = [
  { 
    student_id: 1, 
    student_name: 'Raj Kumar', 
    department_id: 1, 
    hostel_id: 1, 
    mess_id: 1,
    contact_number: '9876543210',
    email: 'raj.kumar@iitjammu.ac.in',
    date_of_birth: '2000-05-15',
    gender: 'Male',
    admission_year: 2020,
    status: 'Active',
    address: 'Mumbai, Maharashtra'
  },
  { 
    student_id: 2, 
    student_name: 'Priya Sharma', 
    department_id: 2, 
    hostel_id: 2, 
    mess_id: 1,
    contact_number: '9876543211',
    email: 'priya.sharma@iitjammu.ac.in',
    date_of_birth: '2001-03-20',
    gender: 'Female',
    admission_year: 2021,
    status: 'Active',
    address: 'Delhi, India'
  },
  { 
    student_id: 3, 
    student_name: 'Amit Singh', 
    department_id: 3, 
    hostel_id: 3, 
    mess_id: 2,
    contact_number: '9876543212',
    email: 'amit.singh@iitjammu.ac.in',
    date_of_birth: '1999-12-10',
    gender: 'Male',
    admission_year: 2019,
    status: 'Active',
    address: 'Pune, Maharashtra'
  },
  { 
    student_id: 4, 
    student_name: 'Sneha Patel', 
    department_id: 1, 
    hostel_id: 2, 
    mess_id: 1,
    contact_number: '9876543213',
    email: 'sneha.patel@iitjammu.ac.in',
    date_of_birth: '2000-08-25',
    gender: 'Female',
    admission_year: 2020,
    status: 'Active',
    address: 'Ahmedabad, Gujarat'
  },
  { 
    student_id: 5, 
    student_name: 'Vikram Reddy', 
    department_id: 4, 
    hostel_id: 1, 
    mess_id: 2,
    contact_number: '9876543214',
    email: 'vikram.reddy@iitjammu.ac.in',
    date_of_birth: '1999-11-30',
    gender: 'Male',
    admission_year: 2019,
    status: 'Graduated',
    address: 'Hyderabad, Telangana'
  }
];

/**
 * @swagger
 * /students:
 *   get:
 *     summary: Get all students
 *     description: Retrieve a list of all students in the system
 *     tags: [Students]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Maximum number of students to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Number of students to skip
 *     responses:
 *       200:
 *         description: List of students retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Student'
 *       401:
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', async (req, res) => {
  try {
    const { limit } = req.query;
    const query = `
      SELECT s.*, 
             d.department_name, 
             d.department_code, 
             h.hostel_name, 
             m.mess_name,
             r.room_number,
             r.room_id
      FROM Students s
      LEFT JOIN Departments d ON s.department_id = d.department_id
      LEFT JOIN Hostels h ON s.hostel_id = h.hostel_id
      LEFT JOIN Mess m ON s.mess_id = m.mess_id
      LEFT JOIN Room_Allocations ra ON s.student_id = ra.student_id AND (ra.end_date IS NULL OR ra.end_date > CURDATE())
      LEFT JOIN Rooms r ON ra.room_id = r.room_id
      ORDER BY s.student_id
    ` + (limit ? ` LIMIT ${parseInt(limit)}` : '');
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.log('Database not available, using mock data');
    const { limit } = req.query;
    // Add room numbers to mock data
    const studentsWithRooms = mockStudents.map(student => ({
      ...student,
      room_number: `${100 + student.student_id}`,
      room_id: student.student_id,
      department_name: ['Computer Science and Engineering', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Chemical Engineering'][student.department_id - 1] || 'Unknown Department',
      department_code: ['CSE', 'EE', 'ME', 'CE', 'CHE'][student.department_id - 1] || 'UNK',
      hostel_name: ['Hostel A', 'Hostel B', 'Hostel C'][student.hostel_id - 1] || 'No Hostel',
      mess_name: ['Central Mess', 'North Campus Mess'][student.mess_id - 1] || 'No Mess'
    }));
    const students = limit ? studentsWithRooms.slice(0, parseInt(limit)) : studentsWithRooms;
    res.json(students);
  }
});

/**
 * @swagger
 * /students/{id}:
 *   get:
 *     summary: Get student by ID
 *     description: Retrieve a specific student by their ID
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 *       404:
 *         description: Student not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Students WHERE student_id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new student
router.post('/', async (req, res) => {
  try {
    const { student_id, student_name, department_id, hostel_id, mess_id, contact_number, email, date_of_birth, gender, address, admission_year, status } = req.body;
    const [result] = await db.query(
      'INSERT INTO Students (student_id, student_name, department_id, hostel_id, mess_id, contact_number, email, date_of_birth, gender, address, admission_year, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [student_id, student_name, department_id, hostel_id, mess_id, contact_number, email, date_of_birth, gender, address, admission_year, status]
    );
    res.status(201).json({ message: 'Student created successfully', student_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update student
router.put('/:id', async (req, res) => {
  try {
    const { student_name, department_id, hostel_id, mess_id, contact_number, email, date_of_birth, gender, address, admission_year, status } = req.body;
    const [result] = await db.query(
      'UPDATE Students SET student_name = ?, department_id = ?, hostel_id = ?, mess_id = ?, contact_number = ?, email = ?, date_of_birth = ?, gender = ?, address = ?, admission_year = ?, status = ? WHERE student_id = ?',
      [student_name, department_id, hostel_id, mess_id, contact_number, email, date_of_birth, gender, address, admission_year, status, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ message: 'Student updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete student
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM Students WHERE student_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
