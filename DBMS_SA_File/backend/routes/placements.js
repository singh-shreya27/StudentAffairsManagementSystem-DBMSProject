const express = require('express');
const router = express.Router();
const db = require('../config/database');
const mockData = require('../services/mockData');

// Get all placements
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Placements');
    res.json(rows);
  } catch (error) {
    console.log('Database not available, using mock data');
    res.json(mockData.placements);
  }
});

// Get placement by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Placements WHERE placement_id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Placement not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new placement
router.post('/', async (req, res) => {
  try {
    const { placement_id, student_id, company_name, role_offered, package_offered, placement_type, placement_date, status } = req.body;
    const [result] = await db.query(
      'INSERT INTO Placements (placement_id, student_id, company_name, role_offered, package_offered, placement_type, placement_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [placement_id, student_id, company_name, role_offered, package_offered, placement_type, placement_date, status]
    );
    res.status(201).json({ message: 'Placement created successfully', placement_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update placement
router.put('/:id', async (req, res) => {
  try {
    const { student_id, company_name, role_offered, package_offered, placement_type, placement_date, status } = req.body;
    const [result] = await db.query(
      'UPDATE Placements SET student_id = ?, company_name = ?, role_offered = ?, package_offered = ?, placement_type = ?, placement_date = ?, status = ? WHERE placement_id = ?',
      [student_id, company_name, role_offered, package_offered, placement_type, placement_date, status, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Placement not found' });
    }
    res.json({ message: 'Placement updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete placement
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM Placements WHERE placement_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Placement not found' });
    }
    res.json({ message: 'Placement deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
