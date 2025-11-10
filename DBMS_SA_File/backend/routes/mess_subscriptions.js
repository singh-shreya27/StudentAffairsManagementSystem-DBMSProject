const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all mess subscriptions
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT ms.*, s.student_name, m.mess_name
      FROM Mess_Subscriptions ms
      LEFT JOIN Students s ON ms.student_id = s.student_id
      LEFT JOIN Mess m ON ms.mess_id = m.mess_id
      ORDER BY ms.start_date DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get subscription by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT ms.*, s.student_name, m.mess_name
      FROM Mess_Subscriptions ms
      LEFT JOIN Students s ON ms.student_id = s.student_id
      LEFT JOIN Mess m ON ms.mess_id = m.mess_id
      WHERE ms.subscription_id = ?
    `, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Mess subscription not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get subscriptions by student
router.get('/student/:studentId', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT ms.*, s.student_name, m.mess_name
      FROM Mess_Subscriptions ms
      LEFT JOIN Students s ON ms.student_id = s.student_id
      LEFT JOIN Mess m ON ms.mess_id = m.mess_id
      WHERE ms.student_id = ?
      ORDER BY ms.start_date DESC
    `, [req.params.studentId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get active subscriptions
router.get('/active', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT ms.*, s.student_name, m.mess_name
      FROM Mess_Subscriptions ms
      LEFT JOIN Students s ON ms.student_id = s.student_id
      LEFT JOIN Mess m ON ms.mess_id = m.mess_id
      WHERE ms.start_date <= CURDATE() 
      AND (ms.end_date IS NULL OR ms.end_date >= CURDATE())
      ORDER BY m.mess_name, s.student_name
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new mess subscription
router.post('/', async (req, res) => {
  try {
    const { subscription_id, student_id, mess_id, start_date, end_date } = req.body;
    const [result] = await db.query(
      'INSERT INTO Mess_Subscriptions (subscription_id, student_id, mess_id, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
      [subscription_id, student_id, mess_id, start_date, end_date]
    );
    res.status(201).json({ message: 'Mess subscription created successfully', subscription_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update mess subscription
router.put('/:id', async (req, res) => {
  try {
    const { student_id, mess_id, start_date, end_date } = req.body;
    const [result] = await db.query(
      'UPDATE Mess_Subscriptions SET student_id = ?, mess_id = ?, start_date = ?, end_date = ? WHERE subscription_id = ?',
      [student_id, mess_id, start_date, end_date, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Mess subscription not found' });
    }
    res.json({ message: 'Mess subscription updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete mess subscription
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM Mess_Subscriptions WHERE subscription_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Mess subscription not found' });
    }
    res.json({ message: 'Mess subscription deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;