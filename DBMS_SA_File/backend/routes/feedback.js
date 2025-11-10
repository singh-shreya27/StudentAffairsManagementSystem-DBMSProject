const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Mock data for feedback
const mockFeedback = [
  { feedback_id: 1, student_id: 1, category: 'Mess', reference_id: 1, feedback_text: 'Food quality is good but variety can be improved', rating: 4, feedback_date: '2024-01-20', student_name: 'Raj Kumar' },
  { feedback_id: 2, student_id: 2, category: 'Hostel', reference_id: 1, feedback_text: 'Excellent facilities and maintenance', rating: 5, feedback_date: '2024-01-25', student_name: 'Priya Sharma' },
  { feedback_id: 3, student_id: 3, category: 'Event', reference_id: 2, feedback_text: 'Well organized event', rating: 5, feedback_date: '2024-02-21', student_name: 'Amit Singh' }
];

// Get all feedback
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT f.*, s.student_name
      FROM Feedback_System f
      LEFT JOIN Students s ON f.student_id = s.student_id
      ORDER BY f.feedback_date DESC
    `);
    res.json(rows);
  } catch (error) {
    console.log('Database not available, using mock data');
    res.json(mockFeedback);
  }
});

// Get feedback by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT f.*, s.student_name
      FROM Feedback_System f
      LEFT JOIN Students s ON f.student_id = s.student_id
      WHERE f.feedback_id = ?
    `, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get feedback by student
router.get('/student/:studentId', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT f.*, s.student_name
      FROM Feedback_System f
      LEFT JOIN Students s ON f.student_id = s.student_id
      WHERE f.student_id = ?
      ORDER BY f.feedback_date DESC
    `, [req.params.studentId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get feedback by category
router.get('/category/:category', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT f.*, s.student_name
      FROM Feedback_System f
      LEFT JOIN Students s ON f.student_id = s.student_id
      WHERE f.category = ?
      ORDER BY f.feedback_date DESC
    `, [req.params.category]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get feedback by rating
router.get('/rating/:rating', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT f.*, s.student_name
      FROM Feedback_System f
      LEFT JOIN Students s ON f.student_id = s.student_id
      WHERE f.rating = ?
      ORDER BY f.feedback_date DESC
    `, [req.params.rating]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get feedback statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        category,
        AVG(rating) as average_rating,
        COUNT(*) as total_feedback,
        SUM(CASE WHEN rating >= 4 THEN 1 ELSE 0 END) as positive_feedback,
        SUM(CASE WHEN rating <= 2 THEN 1 ELSE 0 END) as negative_feedback
      FROM Feedback_System
      WHERE rating IS NOT NULL
      GROUP BY category
      ORDER BY average_rating DESC
    `);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recent feedback
router.get('/recent/:days', async (req, res) => {
  try {
    const days = parseInt(req.params.days) || 7;
    const [rows] = await db.query(`
      SELECT f.*, s.student_name
      FROM Feedback_System f
      LEFT JOIN Students s ON f.student_id = s.student_id
      WHERE f.feedback_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      ORDER BY f.feedback_date DESC
    `, [days]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new feedback
router.post('/', async (req, res) => {
  try {
    const { feedback_id, student_id, category, reference_id, feedback_text, rating, feedback_date } = req.body;
    const [result] = await db.query(
      'INSERT INTO Feedback_System (feedback_id, student_id, category, reference_id, feedback_text, rating, feedback_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [feedback_id, student_id, category, reference_id, feedback_text, rating, feedback_date]
    );
    res.status(201).json({ message: 'Feedback created successfully', feedback_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update feedback
router.put('/:id', async (req, res) => {
  try {
    const { student_id, category, reference_id, feedback_text, rating, feedback_date } = req.body;
    const [result] = await db.query(
      'UPDATE Feedback_System SET student_id = ?, category = ?, reference_id = ?, feedback_text = ?, rating = ?, feedback_date = ? WHERE feedback_id = ?',
      [student_id, category, reference_id, feedback_text, rating, feedback_date, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    res.json({ message: 'Feedback updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete feedback
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM Feedback_System WHERE feedback_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;