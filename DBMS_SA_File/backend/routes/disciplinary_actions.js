const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Mock data for disciplinary actions
const mockDisciplinary = [
  { 
    action_id: 1, 
    student_id: 2, 
    incident_date: '2024-01-10', 
    description: 'Late night disturbance in hostel - playing loud music after 11 PM', 
    action_taken: 'Written warning issued and counseling session conducted', 
    fine_amount: 500.00, 
    severity: 'Minor', 
    recorded_by: 1, 
    status: 'Closed', 
    student_name: 'Priya Sharma', 
    recorded_by_name: 'Dr. Rajesh Kumar' 
  },
  { 
    action_id: 2, 
    student_id: 3, 
    incident_date: '2024-02-05', 
    description: 'Unauthorized absence from hostel for 3 consecutive nights without permission', 
    action_taken: 'Fine imposed and hostel supervisor informed', 
    fine_amount: 1000.00, 
    severity: 'Medium', 
    recorded_by: 1, 
    status: 'Active', 
    student_name: 'Amit Singh', 
    recorded_by_name: 'Dr. Rajesh Kumar' 
  },
  { 
    action_id: 3, 
    student_id: 1, 
    incident_date: '2024-03-12', 
    description: 'Damage to hostel property - broken window in common room', 
    action_taken: 'Fine imposed for repair costs and community service assigned', 
    fine_amount: 2500.00, 
    severity: 'Medium', 
    recorded_by: 2, 
    status: 'Active', 
    student_name: 'Raj Kumar', 
    recorded_by_name: 'Prof. Anita Mehta' 
  },
  { 
    action_id: 4, 
    student_id: 4, 
    incident_date: '2024-04-08', 
    description: 'Academic misconduct - caught cheating during mid-term examination', 
    action_taken: 'Zero marks in examination and academic probation for one semester', 
    fine_amount: 0.00, 
    severity: 'High', 
    recorded_by: 3, 
    status: 'Active', 
    student_name: 'Sneha Patel', 
    recorded_by_name: 'Dr. Suresh Gupta' 
  },
  { 
    action_id: 5, 
    student_id: 5, 
    incident_date: '2024-05-15', 
    description: 'Violation of mess rules - bringing outside food and creating mess', 
    action_taken: 'Mess privileges suspended for 1 week and cleaning duty assigned', 
    fine_amount: 300.00, 
    severity: 'Minor', 
    recorded_by: 1, 
    status: 'Closed', 
    student_name: 'Vikram Reddy', 
    recorded_by_name: 'Dr. Rajesh Kumar' 
  },
  { 
    action_id: 6, 
    student_id: 2, 
    incident_date: '2024-06-20', 
    description: 'Ragging incident reported by junior student', 
    action_taken: 'Suspended from hostel for 15 days and mandatory anti-ragging counseling', 
    fine_amount: 5000.00, 
    severity: 'High', 
    recorded_by: 4, 
    status: 'Active', 
    student_name: 'Priya Sharma', 
    recorded_by_name: 'Dr. Kavita Singh' 
  },
  { 
    action_id: 7, 
    student_id: 3, 
    incident_date: '2024-07-03', 
    description: 'Late submission of assignments repeatedly without valid reason', 
    action_taken: 'Academic warning and mandatory time management workshop', 
    fine_amount: 0.00, 
    severity: 'Minor', 
    recorded_by: 2, 
    status: 'Closed', 
    student_name: 'Amit Singh', 
    recorded_by_name: 'Prof. Anita Mehta' 
  },
  { 
    action_id: 8, 
    student_id: 1, 
    incident_date: '2024-08-18', 
    description: 'Fighting with another student in campus premises', 
    action_taken: 'Suspension from classes for 3 days and conflict resolution session', 
    fine_amount: 1500.00, 
    severity: 'Medium', 
    recorded_by: 3, 
    status: 'Closed', 
    student_name: 'Raj Kumar', 
    recorded_by_name: 'Dr. Suresh Gupta' 
  },
  { 
    action_id: 9, 
    student_id: 4, 
    incident_date: '2024-09-25', 
    description: 'Alcohol consumption in hostel premises - found during routine check', 
    action_taken: 'Fine imposed, hostel privileges suspended for 1 month', 
    fine_amount: 3000.00, 
    severity: 'High', 
    recorded_by: 1, 
    status: 'Active', 
    student_name: 'Sneha Patel', 
    recorded_by_name: 'Dr. Rajesh Kumar' 
  },
  { 
    action_id: 10, 
    student_id: 5, 
    incident_date: '2024-10-12', 
    description: 'Unauthorized entry into restricted laboratory areas after hours', 
    action_taken: 'Laboratory access suspended and security awareness session', 
    fine_amount: 800.00, 
    severity: 'Medium', 
    recorded_by: 2, 
    status: 'Active', 
    student_name: 'Vikram Reddy', 
    recorded_by_name: 'Prof. Anita Mehta' 
  }
];

// Get all disciplinary actions
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT da.*, s.student_name, st.staff_name as recorded_by_name
      FROM Disciplinary_Actions da
      LEFT JOIN Students s ON da.student_id = s.student_id
      LEFT JOIN Staff st ON da.recorded_by = st.staff_id
      ORDER BY da.incident_date DESC
    `);
    res.json(rows);
  } catch (error) {
    console.log('Database not available, using mock data');
    res.json(mockDisciplinary);
  }
});

// Get disciplinary action by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT da.*, s.student_name, st.staff_name as recorded_by_name
      FROM Disciplinary_Actions da
      LEFT JOIN Students s ON da.student_id = s.student_id
      LEFT JOIN Staff st ON da.recorded_by = st.staff_id
      WHERE da.action_id = ?
    `, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Disciplinary action not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get disciplinary actions by student
router.get('/student/:studentId', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT da.*, s.student_name, st.staff_name as recorded_by_name
      FROM Disciplinary_Actions da
      LEFT JOIN Students s ON da.student_id = s.student_id
      LEFT JOIN Staff st ON da.recorded_by = st.staff_id
      WHERE da.student_id = ?
      ORDER BY da.incident_date DESC
    `, [req.params.studentId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get active disciplinary actions
router.get('/status/active', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT da.*, s.student_name, st.staff_name as recorded_by_name
      FROM Disciplinary_Actions da
      LEFT JOIN Students s ON da.student_id = s.student_id
      LEFT JOIN Staff st ON da.recorded_by = st.staff_id
      WHERE da.status = 'Active'
      ORDER BY da.incident_date DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get disciplinary actions by severity
router.get('/severity/:severity', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT da.*, s.student_name, st.staff_name as recorded_by_name
      FROM Disciplinary_Actions da
      LEFT JOIN Students s ON da.student_id = s.student_id
      LEFT JOIN Staff st ON da.recorded_by = st.staff_id
      WHERE da.severity = ?
      ORDER BY da.incident_date DESC
    `, [req.params.severity]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new disciplinary action
router.post('/', async (req, res) => {
  try {
    const { action_id, student_id, incident_date, description, action_taken, fine_amount, severity, recorded_by, status } = req.body;
    const [result] = await db.query(
      'INSERT INTO Disciplinary_Actions (action_id, student_id, incident_date, description, action_taken, fine_amount, severity, recorded_by, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [action_id, student_id, incident_date, description, action_taken, fine_amount, severity, recorded_by, status]
    );
    res.status(201).json({ message: 'Disciplinary action created successfully', action_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update disciplinary action
router.put('/:id', async (req, res) => {
  try {
    const { student_id, incident_date, description, action_taken, fine_amount, severity, recorded_by, status } = req.body;
    const [result] = await db.query(
      'UPDATE Disciplinary_Actions SET student_id = ?, incident_date = ?, description = ?, action_taken = ?, fine_amount = ?, severity = ?, recorded_by = ?, status = ? WHERE action_id = ?',
      [student_id, incident_date, description, action_taken, fine_amount, severity, recorded_by, status, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Disciplinary action not found' });
    }
    res.json({ message: 'Disciplinary action updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update status only
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const [result] = await db.query(
      'UPDATE Disciplinary_Actions SET status = ? WHERE action_id = ?',
      [status, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Disciplinary action not found' });
    }
    res.json({ message: 'Disciplinary action status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete disciplinary action
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM Disciplinary_Actions WHERE action_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Disciplinary action not found' });
    }
    res.json({ message: 'Disciplinary action deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;