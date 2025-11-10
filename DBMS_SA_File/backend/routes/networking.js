const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all networking connections
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT n.*, 
             a.graduation_year, a.current_position, a.company_name,
             s_alumni.student_name as alumni_name,
             s_student.student_name as student_name
      FROM Networking n
      LEFT JOIN Alumni a ON n.alumni_id = a.alumni_id
      LEFT JOIN Students s_alumni ON a.student_id = s_alumni.student_id
      LEFT JOIN Students s_student ON n.student_id = s_student.student_id
      ORDER BY n.initiated_date DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get networking connection by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT n.*, 
             a.graduation_year, a.current_position, a.company_name,
             s_alumni.student_name as alumni_name,
             s_student.student_name as student_name
      FROM Networking n
      LEFT JOIN Alumni a ON n.alumni_id = a.alumni_id
      LEFT JOIN Students s_alumni ON a.student_id = s_alumni.student_id
      LEFT JOIN Students s_student ON n.student_id = s_student.student_id
      WHERE n.connection_id = ?
    `, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Networking connection not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get connections by alumni
router.get('/alumni/:alumniId', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT n.*, 
             a.graduation_year, a.current_position, a.company_name,
             s_alumni.student_name as alumni_name,
             s_student.student_name as student_name
      FROM Networking n
      LEFT JOIN Alumni a ON n.alumni_id = a.alumni_id
      LEFT JOIN Students s_alumni ON a.student_id = s_alumni.student_id
      LEFT JOIN Students s_student ON n.student_id = s_student.student_id
      WHERE n.alumni_id = ?
      ORDER BY n.initiated_date DESC
    `, [req.params.alumniId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get connections by student
router.get('/student/:studentId', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT n.*, 
             a.graduation_year, a.current_position, a.company_name,
             s_alumni.student_name as alumni_name,
             s_student.student_name as student_name
      FROM Networking n
      LEFT JOIN Alumni a ON n.alumni_id = a.alumni_id
      LEFT JOIN Students s_alumni ON a.student_id = s_alumni.student_id
      LEFT JOIN Students s_student ON n.student_id = s_student.student_id
      WHERE n.student_id = ?
      ORDER BY n.initiated_date DESC
    `, [req.params.studentId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get connections by type
router.get('/type/:type', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT n.*, 
             a.graduation_year, a.current_position, a.company_name,
             s_alumni.student_name as alumni_name,
             s_student.student_name as student_name
      FROM Networking n
      LEFT JOIN Alumni a ON n.alumni_id = a.alumni_id
      LEFT JOIN Students s_alumni ON a.student_id = s_alumni.student_id
      LEFT JOIN Students s_student ON n.student_id = s_student.student_id
      WHERE n.connection_type = ?
      ORDER BY n.initiated_date DESC
    `, [req.params.type]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get active connections
router.get('/status/active', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT n.*, 
             a.graduation_year, a.current_position, a.company_name,
             s_alumni.student_name as alumni_name,
             s_student.student_name as student_name
      FROM Networking n
      LEFT JOIN Alumni a ON n.alumni_id = a.alumni_id
      LEFT JOIN Students s_alumni ON a.student_id = s_alumni.student_id
      LEFT JOIN Students s_student ON n.student_id = s_student.student_id
      WHERE n.status = 'Active'
      ORDER BY n.initiated_date DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get networking statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        connection_type,
        status,
        COUNT(*) as connection_count
      FROM Networking
      GROUP BY connection_type, status
      ORDER BY connection_type, status
    `);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get mentorship connections
router.get('/mentorship/active', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT n.*, 
             a.graduation_year, a.current_position, a.company_name,
             s_alumni.student_name as alumni_name,
             s_student.student_name as student_name
      FROM Networking n
      LEFT JOIN Alumni a ON n.alumni_id = a.alumni_id
      LEFT JOIN Students s_alumni ON a.student_id = s_alumni.student_id
      LEFT JOIN Students s_student ON n.student_id = s_student.student_id
      WHERE n.connection_type = 'Mentorship' AND n.status = 'Active'
      ORDER BY n.initiated_date DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new networking connection
router.post('/', async (req, res) => {
  try {
    const { connection_id, alumni_id, student_id, connection_type, initiated_date, status } = req.body;
    const [result] = await db.query(
      'INSERT INTO Networking (connection_id, alumni_id, student_id, connection_type, initiated_date, status) VALUES (?, ?, ?, ?, ?, ?)',
      [connection_id, alumni_id, student_id, connection_type, initiated_date, status]
    );
    res.status(201).json({ message: 'Networking connection created successfully', connection_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update networking connection
router.put('/:id', async (req, res) => {
  try {
    const { alumni_id, student_id, connection_type, initiated_date, status } = req.body;
    const [result] = await db.query(
      'UPDATE Networking SET alumni_id = ?, student_id = ?, connection_type = ?, initiated_date = ?, status = ? WHERE connection_id = ?',
      [alumni_id, student_id, connection_type, initiated_date, status, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Networking connection not found' });
    }
    res.json({ message: 'Networking connection updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update connection status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const [result] = await db.query(
      'UPDATE Networking SET status = ? WHERE connection_id = ?',
      [status, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Networking connection not found' });
    }
    res.json({ message: 'Connection status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete networking connection
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM Networking WHERE connection_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Networking connection not found' });
    }
    res.json({ message: 'Networking connection deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;