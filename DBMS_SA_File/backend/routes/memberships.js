const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all memberships
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*, s.student_name, o.org_name
      FROM Memberships m
      LEFT JOIN Students s ON m.student_id = s.student_id
      LEFT JOIN Organizations o ON m.org_id = o.org_id
      ORDER BY m.join_date DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get membership by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*, s.student_name, o.org_name
      FROM Memberships m
      LEFT JOIN Students s ON m.student_id = s.student_id
      LEFT JOIN Organizations o ON m.org_id = o.org_id
      WHERE m.membership_id = ?
    `, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Membership not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get memberships by student
router.get('/student/:studentId', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*, s.student_name, o.org_name
      FROM Memberships m
      LEFT JOIN Students s ON m.student_id = s.student_id
      LEFT JOIN Organizations o ON m.org_id = o.org_id
      WHERE m.student_id = ?
      ORDER BY m.join_date DESC
    `, [req.params.studentId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get memberships by organization
router.get('/organization/:orgId', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*, s.student_name, o.org_name
      FROM Memberships m
      LEFT JOIN Students s ON m.student_id = s.student_id
      LEFT JOIN Organizations o ON m.org_id = o.org_id
      WHERE m.org_id = ?
      ORDER BY m.join_date DESC
    `, [req.params.orgId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get active memberships
router.get('/status/active', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*, s.student_name, o.org_name
      FROM Memberships m
      LEFT JOIN Students s ON m.student_id = s.student_id
      LEFT JOIN Organizations o ON m.org_id = o.org_id
      WHERE m.end_date IS NULL OR m.end_date >= CURDATE()
      ORDER BY o.org_name, s.student_name
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get memberships by role
router.get('/role/:role', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*, s.student_name, o.org_name
      FROM Memberships m
      LEFT JOIN Students s ON m.student_id = s.student_id
      LEFT JOIN Organizations o ON m.org_id = o.org_id
      WHERE m.role = ?
      ORDER BY m.join_date DESC
    `, [req.params.role]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new membership
router.post('/', async (req, res) => {
  try {
    const { student_id, org_id, role, join_date, end_date } = req.body;
    
    // Generate membership_id by finding the next available ID
    const [maxId] = await db.query('SELECT COALESCE(MAX(membership_id), 0) + 1 as next_id FROM Memberships');
    const membership_id = maxId[0].next_id;
    
    const [result] = await db.query(
      'INSERT INTO Memberships (membership_id, student_id, org_id, role, join_date, end_date) VALUES (?, ?, ?, ?, ?, ?)',
      [membership_id, student_id, org_id, role, join_date, end_date]
    );
    res.status(201).json({ message: 'Membership created successfully', membership_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update membership
router.put('/:id', async (req, res) => {
  try {
    const { student_id, org_id, role, join_date, end_date } = req.body;
    const [result] = await db.query(
      'UPDATE Memberships SET student_id = ?, org_id = ?, role = ?, join_date = ?, end_date = ? WHERE membership_id = ?',
      [student_id, org_id, role, join_date, end_date, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Membership not found' });
    }
    res.json({ message: 'Membership updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// End membership (set end date)
router.patch('/:id/end', async (req, res) => {
  try {
    const { end_date } = req.body;
    const endDate = end_date || new Date().toISOString().split('T')[0];
    const [result] = await db.query(
      'UPDATE Memberships SET end_date = ? WHERE membership_id = ?',
      [endDate, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Membership not found' });
    }
    res.json({ message: 'Membership ended successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete membership
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM Memberships WHERE membership_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Membership not found' });
    }
    res.json({ message: 'Membership deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;