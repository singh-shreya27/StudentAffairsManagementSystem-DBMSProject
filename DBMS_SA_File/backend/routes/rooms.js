const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Mock data for rooms
const mockRooms = [
  { room_id: 1, hostel_id: 1, room_number: '101', capacity: 2, hostel_name: 'Brahmaputra Hostel' },
  { room_id: 2, hostel_id: 1, room_number: '102', capacity: 2, hostel_name: 'Brahmaputra Hostel' },
  { room_id: 3, hostel_id: 2, room_number: '201', capacity: 2, hostel_name: 'Ganga Hostel' },
  { room_id: 4, hostel_id: 2, room_number: '202', capacity: 3, hostel_name: 'Ganga Hostel' },
  { room_id: 5, hostel_id: 3, room_number: '301', capacity: 2, hostel_name: 'Yamuna Hostel' }
];

// Get all rooms
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT r.*, h.hostel_name 
      FROM Rooms r 
      LEFT JOIN Hostels h ON r.hostel_id = h.hostel_id
      ORDER BY r.hostel_id, r.room_number
    `);
    res.json(rows);
  } catch (error) {
    console.log('Database not available, using mock data');
    res.json(mockRooms);
  }
});

// Get room by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT r.*, h.hostel_name 
      FROM Rooms r 
      LEFT JOIN Hostels h ON r.hostel_id = h.hostel_id
      WHERE r.room_id = ?
    `, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get rooms by hostel
router.get('/hostel/:hostelId', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT r.*, h.hostel_name 
      FROM Rooms r 
      LEFT JOIN Hostels h ON r.hostel_id = h.hostel_id
      WHERE r.hostel_id = ?
      ORDER BY r.room_number
    `, [req.params.hostelId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new room
router.post('/', async (req, res) => {
  try {
    const { room_id, hostel_id, room_number, capacity } = req.body;
    const [result] = await db.query(
      'INSERT INTO Rooms (room_id, hostel_id, room_number, capacity) VALUES (?, ?, ?, ?)',
      [room_id, hostel_id, room_number, capacity]
    );
    res.status(201).json({ message: 'Room created successfully', room_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update room
router.put('/:id', async (req, res) => {
  try {
    const { hostel_id, room_number, capacity } = req.body;
    const [result] = await db.query(
      'UPDATE Rooms SET hostel_id = ?, room_number = ?, capacity = ? WHERE room_id = ?',
      [hostel_id, room_number, capacity, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json({ message: 'Room updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete room
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM Rooms WHERE room_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;