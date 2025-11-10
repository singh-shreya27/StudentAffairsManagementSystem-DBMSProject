const express = require('express');
const router = express.Router();
const db = require('../config/database');
const mockData = require('../services/mockData');

// Get all organizations
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT o.*,
             COUNT(DISTINCT m.membership_id) as member_count,
             COUNT(DISTINCT e.event_id) as event_count,
             s.staff_name as coordinator_name
      FROM Organizations o
      LEFT JOIN Memberships m ON o.org_id = m.org_id
      LEFT JOIN Events e ON o.org_id = e.organizing_org_id
      LEFT JOIN Staff s ON o.faculty_coordinator_id = s.staff_id
      GROUP BY o.org_id
      ORDER BY o.org_name
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.log('Database not available, using mock data');
    res.json(mockData.organizations);
  }
});

// Get organization by ID
router.get('/:id', async (req, res) => {
  try {
    const [orgRows] = await db.query('SELECT * FROM Organizations WHERE org_id = ?', [req.params.id]);
    if (orgRows.length === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    
    // Get members
    const [memberRows] = await db.query(`
      SELECT m.*, s.student_name, s.email
      FROM Memberships m
      LEFT JOIN Students s ON m.student_id = s.student_id
      WHERE m.org_id = ?
    `, [req.params.id]);
    
    // Get events
    const [eventRows] = await db.query(`
      SELECT * FROM Events WHERE organizing_org_id = ?
      ORDER BY event_date DESC
    `, [req.params.id]);
    
    const organization = {
      ...orgRows[0],
      members: memberRows,
      events: eventRows
    };
    
    res.json(organization);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new organization
router.post('/', async (req, res) => {
  try {
    const { org_id, org_name, org_type, category, faculty_coordinator_id, coordinator_id, secretary_id, head_id, parent_org_id, budget, coach_name, coach_contact, description } = req.body;
    const [result] = await db.query(
      'INSERT INTO Organizations (org_id, org_name, org_type, category, faculty_coordinator_id, coordinator_id, secretary_id, head_id, parent_org_id, budget, coach_name, coach_contact, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [org_id, org_name, org_type, category, faculty_coordinator_id, coordinator_id, secretary_id, head_id, parent_org_id, budget, coach_name, coach_contact, description]
    );
    res.status(201).json({ message: 'Organization created successfully', org_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update organization
router.put('/:id', async (req, res) => {
  try {
    const { org_name, org_type, category, faculty_coordinator_id, coordinator_id, secretary_id, head_id, parent_org_id, budget, coach_name, coach_contact, description } = req.body;
    const [result] = await db.query(
      'UPDATE Organizations SET org_name = ?, org_type = ?, category = ?, faculty_coordinator_id = ?, coordinator_id = ?, secretary_id = ?, head_id = ?, parent_org_id = ?, budget = ?, coach_name = ?, coach_contact = ?, description = ? WHERE org_id = ?',
      [org_name, org_type, category, faculty_coordinator_id, coordinator_id, secretary_id, head_id, parent_org_id, budget, coach_name, coach_contact, description, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    res.json({ message: 'Organization updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete organization
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM Organizations WHERE org_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    res.json({ message: 'Organization deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
