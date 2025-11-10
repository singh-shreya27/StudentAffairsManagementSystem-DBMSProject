const express = require('express');
const router = express.Router();
const db = require('../config/database');
const mockData = require('../services/mockData');

// Get all mess
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Mess');
    res.json(rows);
  } catch (error) {
    console.log('Database not available, using mock data');
    res.json(mockData.mess);
  }
});

// Get mess by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Mess WHERE mess_id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Mess not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new mess
router.post('/', async (req, res) => {
  try {
    const { mess_id, mess_name, mess_incharge_id } = req.body;
    const [result] = await db.query(
      'INSERT INTO Mess (mess_id, mess_name, mess_incharge_id) VALUES (?, ?, ?)',
      [mess_id, mess_name, mess_incharge_id]
    );
    res.status(201).json({ message: 'Mess created successfully', mess_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update mess
router.put('/:id', async (req, res) => {
  try {
    const { mess_name, mess_incharge_id } = req.body;
    const [result] = await db.query(
      'UPDATE Mess SET mess_name = ?, mess_incharge_id = ? WHERE mess_id = ?',
      [mess_name, mess_incharge_id, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Mess not found' });
    }
    res.json({ message: 'Mess updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete mess
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM Mess WHERE mess_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Mess not found' });
    }
    res.json({ message: 'Mess deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
