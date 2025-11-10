const express = require('express');
const router = express.Router();
const db = require('../config/database');
const mockData = require('../services/mockData');

// Get all hostels
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Hostels');
    res.json(rows);
  } catch (error) {
    console.log('Database not available, using mock data');
    res.json(mockData.hostels);
  }
});

// Get hostel by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Hostels WHERE hostel_id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Hostel not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new hostel
router.post('/', async (req, res) => {
  try {
    const { hostel_id, hostel_name, warden_id } = req.body;
    const [result] = await db.query(
      'INSERT INTO Hostels (hostel_id, hostel_name, warden_id) VALUES (?, ?, ?)',
      [hostel_id, hostel_name, warden_id]
    );
    res.status(201).json({ message: 'Hostel created successfully', hostel_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update hostel
router.put('/:id', async (req, res) => {
  try {
    const { hostel_name, warden_id } = req.body;
    const [result] = await db.query(
      'UPDATE Hostels SET hostel_name = ?, warden_id = ? WHERE hostel_id = ?',
      [hostel_name, warden_id, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Hostel not found' });
    }
    res.json({ message: 'Hostel updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete hostel
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM Hostels WHERE hostel_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Hostel not found' });
    }
    res.json({ message: 'Hostel deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
