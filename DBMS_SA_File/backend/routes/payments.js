const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Mock data for payments
const mockPayments = [
  { payment_id: 1, student_id: 1, payment_type: 'Hostel Fee', amount: 25000.00, payment_date: '2024-01-15', payment_status: 'Completed', transaction_id: 'TXN001', student_name: 'Raj Kumar' },
  { payment_id: 2, student_id: 2, payment_type: 'Mess Fee', amount: 15000.00, payment_date: '2024-01-16', payment_status: 'Completed', transaction_id: 'TXN002', student_name: 'Priya Sharma' },
  { payment_id: 3, student_id: 3, payment_type: 'Event Fee', amount: 500.00, payment_date: '2024-02-10', payment_status: 'Pending', transaction_id: 'TXN003', student_name: 'Amit Singh' }
];

// Get all payments
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, s.student_name
      FROM Payments p
      LEFT JOIN Students s ON p.student_id = s.student_id
      ORDER BY p.payment_date DESC
    `);
    res.json(rows);
  } catch (error) {
    console.log('Database not available, using mock data');
    res.json(mockPayments);
  }
});

// Get payment by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, s.student_name
      FROM Payments p
      LEFT JOIN Students s ON p.student_id = s.student_id
      WHERE p.payment_id = ?
    `, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payments by student
router.get('/student/:studentId', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, s.student_name
      FROM Payments p
      LEFT JOIN Students s ON p.student_id = s.student_id
      WHERE p.student_id = ?
      ORDER BY p.payment_date DESC
    `, [req.params.studentId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payments by type
router.get('/type/:paymentType', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, s.student_name
      FROM Payments p
      LEFT JOIN Students s ON p.student_id = s.student_id
      WHERE p.payment_type = ?
      ORDER BY p.payment_date DESC
    `, [req.params.paymentType]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payments by status
router.get('/status/:status', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, s.student_name
      FROM Payments p
      LEFT JOIN Students s ON p.student_id = s.student_id
      WHERE p.payment_status = ?
      ORDER BY p.payment_date DESC
    `, [req.params.status]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pending payments
router.get('/status/pending', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, s.student_name
      FROM Payments p
      LEFT JOIN Students s ON p.student_id = s.student_id
      WHERE p.payment_status = 'Pending'
      ORDER BY p.payment_date ASC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payment statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        payment_type,
        payment_status,
        COUNT(*) as count,
        SUM(amount) as total_amount,
        AVG(amount) as avg_amount
      FROM Payments
      GROUP BY payment_type, payment_status
      ORDER BY payment_type, payment_status
    `);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new payment
router.post('/', async (req, res) => {
  try {
    const { payment_id, student_id, payment_type, amount, payment_date, payment_status, transaction_id } = req.body;
    const [result] = await db.query(
      'INSERT INTO Payments (payment_id, student_id, payment_type, amount, payment_date, payment_status, transaction_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [payment_id, student_id, payment_type, amount, payment_date, payment_status, transaction_id]
    );
    res.status(201).json({ message: 'Payment created successfully', payment_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update payment
router.put('/:id', async (req, res) => {
  try {
    const { student_id, payment_type, amount, payment_date, payment_status, transaction_id } = req.body;
    const [result] = await db.query(
      'UPDATE Payments SET student_id = ?, payment_type = ?, amount = ?, payment_date = ?, payment_status = ?, transaction_id = ? WHERE payment_id = ?',
      [student_id, payment_type, amount, payment_date, payment_status, transaction_id, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json({ message: 'Payment updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update payment status
router.patch('/:id/status', async (req, res) => {
  try {
    const { payment_status, transaction_id } = req.body;
    const [result] = await db.query(
      'UPDATE Payments SET payment_status = ?, transaction_id = ? WHERE payment_id = ?',
      [payment_status, transaction_id, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json({ message: 'Payment status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete payment
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM Payments WHERE payment_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;