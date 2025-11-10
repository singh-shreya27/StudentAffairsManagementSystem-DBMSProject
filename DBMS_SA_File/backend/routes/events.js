const express = require('express');
const router = express.Router();
const db = require('../config/database');
const mockData = require('../services/mockData');

// Get all events
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT e.*, o.org_name as organizing_org_name, o.org_type, o.category as org_category
      FROM Events e
      LEFT JOIN Organizations o ON e.organizing_org_id = o.org_id
      ORDER BY e.event_date DESC
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.log('Database not available, using mock data');
    res.json(mockData.events);
  }
});

// Get event by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Events WHERE event_id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new event
router.post('/', async (req, res) => {
  try {
    const { event_id, event_name, event_type, organizing_org_id, event_date, venue, event_level, description, budget } = req.body;
    const [result] = await db.query(
      'INSERT INTO Events (event_id, event_name, event_type, organizing_org_id, event_date, venue, event_level, description, budget) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [event_id, event_name, event_type, organizing_org_id, event_date, venue, event_level, description, budget]
    );
    res.status(201).json({ message: 'Event created successfully', event_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update event
router.put('/:id', async (req, res) => {
  try {
    const { event_name, event_type, organizing_org_id, event_date, venue, event_level, description, budget } = req.body;
    const [result] = await db.query(
      'UPDATE Events SET event_name = ?, event_type = ?, organizing_org_id = ?, event_date = ?, venue = ?, event_level = ?, description = ?, budget = ? WHERE event_id = ?',
      [event_name, event_type, organizing_org_id, event_date, venue, event_level, description, budget, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({ message: 'Event updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete event
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM Events WHERE event_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
