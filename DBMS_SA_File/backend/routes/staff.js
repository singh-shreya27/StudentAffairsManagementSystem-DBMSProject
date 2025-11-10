const express = require('express');
const router = express.Router();
const db = require('../config/database');
const mockData = require('../services/mockData');

// Get all staff
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Staff');
    res.json(rows);
  } catch (error) {
    console.log('Database not available, using mock data');
    res.json(mockData.staff);
  }
});

// Get staff by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Staff WHERE staff_id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Staff not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.log('Database not available, using mock data');
    const staff = mockData.staff.find(s => s.staff_id == req.params.id);
    if (!staff) {
      return res.status(404).json({ error: 'Staff not found' });
    }
    res.json(staff);
  }
});

// Create new staff
router.post('/', async (req, res) => {
  try {
    const { staff_id, staff_name, designation, department_id, email, contact_number } = req.body;
    const [result] = await db.query(
      'INSERT INTO Staff (staff_id, staff_name, designation, department_id, email, contact_number) VALUES (?, ?, ?, ?, ?, ?)',
      [staff_id, staff_name, designation, department_id, email, contact_number]
    );
    res.status(201).json({ message: 'Staff created successfully', staff_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update staff
router.put('/:id', async (req, res) => {
  try {
    const { staff_name, designation, department_id, email, contact_number } = req.body;
    const [result] = await db.query(
      'UPDATE Staff SET staff_name = ?, designation = ?, department_id = ?, email = ?, contact_number = ? WHERE staff_id = ?',
      [staff_name, designation, department_id, email, contact_number, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Staff not found' });
    }
    res.json({ message: 'Staff updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete staff
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM Staff WHERE staff_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Staff not found' });
    }
    res.json({ message: 'Staff deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
