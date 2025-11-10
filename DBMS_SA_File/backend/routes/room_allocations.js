const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all room allocations
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT ra.*, s.student_name, r.room_number, h.hostel_name
      FROM Room_Allocations ra
      LEFT JOIN Students s ON ra.student_id = s.student_id
      LEFT JOIN Rooms r ON ra.room_id = r.room_id
      LEFT JOIN Hostels h ON r.hostel_id = h.hostel_id
      ORDER BY ra.start_date DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get allocation by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT ra.*, s.student_name, r.room_number, h.hostel_name
      FROM Room_Allocations ra
      LEFT JOIN Students s ON ra.student_id = s.student_id
      LEFT JOIN Rooms r ON ra.room_id = r.room_id
      LEFT JOIN Hostels h ON r.hostel_id = h.hostel_id
      WHERE ra.allocation_id = ?
    `, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Room allocation not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get allocations by student
router.get('/student/:studentId', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT ra.*, s.student_name, r.room_number, h.hostel_name
      FROM Room_Allocations ra
      LEFT JOIN Students s ON ra.student_id = s.student_id
      LEFT JOIN Rooms r ON ra.room_id = r.room_id
      LEFT JOIN Hostels h ON r.hostel_id = h.hostel_id
      WHERE ra.student_id = ?
      ORDER BY ra.start_date DESC
    `, [req.params.studentId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current allocations for a room
router.get('/room/:roomId/current', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT ra.*, s.student_name
      FROM Room_Allocations ra
      LEFT JOIN Students s ON ra.student_id = s.student_id
      WHERE ra.room_id = ? AND ra.start_date <= CURDATE() 
      AND (ra.end_date IS NULL OR ra.end_date >= CURDATE())
      ORDER BY ra.start_date
    `, [req.params.roomId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new room allocation
router.post('/', async (req, res) => {
  try {
    const { allocation_id, student_id, room_id, start_date, end_date } = req.body;
    
    // Check if room has capacity
    const [roomCheck] = await db.query(`
      SELECT r.capacity, COUNT(ra.allocation_id) as current_occupants
      FROM Rooms r
      LEFT JOIN Room_Allocations ra ON r.room_id = ra.room_id 
        AND ra.start_date <= CURDATE() 
        AND (ra.end_date IS NULL OR ra.end_date >= CURDATE())
      WHERE r.room_id = ?
      GROUP BY r.room_id, r.capacity
    `, [room_id]);
    
    if (roomCheck.length > 0 && roomCheck[0].current_occupants >= roomCheck[0].capacity) {
      return res.status(400).json({ error: 'Room is at full capacity' });
    }
    
    const [result] = await db.query(
      'INSERT INTO Room_Allocations (allocation_id, student_id, room_id, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
      [allocation_id, student_id, room_id, start_date, end_date]
    );
    res.status(201).json({ message: 'Room allocation created successfully', allocation_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update room allocation
router.put('/:id', async (req, res) => {
  try {
    const { student_id, room_id, start_date, end_date } = req.body;
    const [result] = await db.query(
      'UPDATE Room_Allocations SET student_id = ?, room_id = ?, start_date = ?, end_date = ? WHERE allocation_id = ?',
      [student_id, room_id, start_date, end_date, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Room allocation not found' });
    }
    res.json({ message: 'Room allocation updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete room allocation
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM Room_Allocations WHERE allocation_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Room allocation not found' });
    }
    res.json({ message: 'Room allocation deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;