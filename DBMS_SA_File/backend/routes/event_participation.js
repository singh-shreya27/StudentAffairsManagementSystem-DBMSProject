const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all event participations
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT ep.*, s.student_name, e.event_name
      FROM Event_Participation ep
      LEFT JOIN Students s ON ep.student_id = s.student_id
      LEFT JOIN Events e ON ep.event_id = e.event_id
      ORDER BY e.event_date DESC, ep.role
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get participation by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT ep.*, s.student_name, e.event_name
      FROM Event_Participation ep
      LEFT JOIN Students s ON ep.student_id = s.student_id
      LEFT JOIN Events e ON ep.event_id = e.event_id
      WHERE ep.participation_id = ?
    `, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Event participation not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get participations by student
router.get('/student/:studentId', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT ep.*, s.student_name, e.event_name, e.event_date
      FROM Event_Participation ep
      LEFT JOIN Students s ON ep.student_id = s.student_id
      LEFT JOIN Events e ON ep.event_id = e.event_id
      WHERE ep.student_id = ?
      ORDER BY e.event_date DESC
    `, [req.params.studentId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get participations by event
router.get('/event/:eventId', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT ep.*, s.student_name, e.event_name
      FROM Event_Participation ep
      LEFT JOIN Students s ON ep.student_id = s.student_id
      LEFT JOIN Events e ON ep.event_id = e.event_id
      WHERE ep.event_id = ?
      ORDER BY ep.role, s.student_name
    `, [req.params.eventId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get participations by role
router.get('/role/:role', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT ep.*, s.student_name, e.event_name, e.event_date
      FROM Event_Participation ep
      LEFT JOIN Students s ON ep.student_id = s.student_id
      LEFT JOIN Events e ON ep.event_id = e.event_id
      WHERE ep.role = ?
      ORDER BY e.event_date DESC
    `, [req.params.role]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get winners/medal recipients
router.get('/winners', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT ep.*, s.student_name, e.event_name, e.event_date
      FROM Event_Participation ep
      LEFT JOIN Students s ON ep.student_id = s.student_id
      LEFT JOIN Events e ON ep.event_id = e.event_id
      WHERE ep.medal IS NOT NULL AND ep.medal != ''
      ORDER BY e.event_date DESC, ep.medal
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new event participation
router.post('/', async (req, res) => {
  try {
    const { participation_id, event_id, student_id, role, position_secured, medal, certificate_issued } = req.body;
    const [result] = await db.query(
      'INSERT INTO Event_Participation (participation_id, event_id, student_id, role, position_secured, medal, certificate_issued) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [participation_id, event_id, student_id, role, position_secured, medal, certificate_issued]
    );
    res.status(201).json({ message: 'Event participation created successfully', participation_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update event participation
router.put('/:id', async (req, res) => {
  try {
    const { event_id, student_id, role, position_secured, medal, certificate_issued } = req.body;
    const [result] = await db.query(
      'UPDATE Event_Participation SET event_id = ?, student_id = ?, role = ?, position_secured = ?, medal = ?, certificate_issued = ? WHERE participation_id = ?',
      [event_id, student_id, role, position_secured, medal, certificate_issued, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Event participation not found' });
    }
    res.json({ message: 'Event participation updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update results (position, medal, certificate)
router.patch('/:id/results', async (req, res) => {
  try {
    const { position_secured, medal, certificate_issued } = req.body;
    const [result] = await db.query(
      'UPDATE Event_Participation SET position_secured = ?, medal = ?, certificate_issued = ? WHERE participation_id = ?',
      [position_secured, medal, certificate_issued, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Event participation not found' });
    }
    res.json({ message: 'Event participation results updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete event participation
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM Event_Participation WHERE participation_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Event participation not found' });
    }
    res.json({ message: 'Event participation deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;