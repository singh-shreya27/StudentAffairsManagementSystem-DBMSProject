const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all recruiters
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Recruiters ORDER BY company_name');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recruiter by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Recruiters WHERE recruiter_id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Recruiter not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recruiters by industry type
router.get('/industry/:industryType', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Recruiters WHERE industry_type = ? ORDER BY company_name', [req.params.industryType]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search recruiters by company name
router.get('/search/:searchTerm', async (req, res) => {
  try {
    const searchTerm = `%${req.params.searchTerm}%`;
    const [rows] = await db.query('SELECT * FROM Recruiters WHERE company_name LIKE ? ORDER BY company_name', [searchTerm]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get unique industry types
router.get('/industries/list', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT DISTINCT industry_type FROM Recruiters WHERE industry_type IS NOT NULL ORDER BY industry_type');
    res.json(rows.map(row => row.industry_type));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new recruiter
router.post('/', async (req, res) => {
  try {
    const { recruiter_id, company_name, industry_type, contact_person, contact_email, contact_number } = req.body;
    const [result] = await db.query(
      'INSERT INTO Recruiters (recruiter_id, company_name, industry_type, contact_person, contact_email, contact_number) VALUES (?, ?, ?, ?, ?, ?)',
      [recruiter_id, company_name, industry_type, contact_person, contact_email, contact_number]
    );
    res.status(201).json({ message: 'Recruiter created successfully', recruiter_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update recruiter
router.put('/:id', async (req, res) => {
  try {
    const { company_name, industry_type, contact_person, contact_email, contact_number } = req.body;
    const [result] = await db.query(
      'UPDATE Recruiters SET company_name = ?, industry_type = ?, contact_person = ?, contact_email = ?, contact_number = ? WHERE recruiter_id = ?',
      [company_name, industry_type, contact_person, contact_email, contact_number, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Recruiter not found' });
    }
    res.json({ message: 'Recruiter updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete recruiter
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM Recruiters WHERE recruiter_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Recruiter not found' });
    }
    res.json({ message: 'Recruiter deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;