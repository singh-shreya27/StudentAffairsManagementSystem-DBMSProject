const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Mock data for alumni
const mockAlumni = [
  { alumni_id: 1, student_id: 5, graduation_year: 2023, current_position: 'Software Engineer', company_name: 'Google India', location: 'Bangalore, India', linkedin_url: 'https://linkedin.com/in/vikramreddy', email: 'vikram.reddy.alumni@iitjammu.ac.in', student_name: 'Vikram Reddy', student_email: 'vikram.reddy@iitjammu.ac.in' }
];

// Get all alumni
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT a.*, s.student_name, s.email as student_email
      FROM Alumni a
      LEFT JOIN Students s ON a.student_id = s.student_id
      ORDER BY a.graduation_year DESC, s.student_name
    `);
    res.json(rows);
  } catch (error) {
    console.log('Database not available, using mock data');
    res.json(mockAlumni);
  }
});

// Get alumni by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT a.*, s.student_name, s.email as student_email
      FROM Alumni a
      LEFT JOIN Students s ON a.student_id = s.student_id
      WHERE a.alumni_id = ?
    `, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Alumni not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get alumni by graduation year
router.get('/year/:year', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT a.*, s.student_name, s.email as student_email
      FROM Alumni a
      LEFT JOIN Students s ON a.student_id = s.student_id
      WHERE a.graduation_year = ?
      ORDER BY s.student_name
    `, [req.params.year]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get alumni by company
router.get('/company/:company', async (req, res) => {
  try {
    const company = `%${req.params.company}%`;
    const [rows] = await db.query(`
      SELECT a.*, s.student_name, s.email as student_email
      FROM Alumni a
      LEFT JOIN Students s ON a.student_id = s.student_id
      WHERE a.company_name LIKE ?
      ORDER BY a.graduation_year DESC, s.student_name
    `, [company]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get alumni by location
router.get('/location/:location', async (req, res) => {
  try {
    const location = `%${req.params.location}%`;
    const [rows] = await db.query(`
      SELECT a.*, s.student_name, s.email as student_email
      FROM Alumni a
      LEFT JOIN Students s ON a.student_id = s.student_id
      WHERE a.location LIKE ?
      ORDER BY a.graduation_year DESC, s.student_name
    `, [location]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search alumni
router.get('/search/:term', async (req, res) => {
  try {
    const searchTerm = `%${req.params.term}%`;
    const [rows] = await db.query(`
      SELECT a.*, s.student_name, s.email as student_email
      FROM Alumni a
      LEFT JOIN Students s ON a.student_id = s.student_id
      WHERE s.student_name LIKE ? 
         OR a.current_position LIKE ? 
         OR a.company_name LIKE ?
         OR a.location LIKE ?
      ORDER BY a.graduation_year DESC, s.student_name
    `, [searchTerm, searchTerm, searchTerm, searchTerm]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get alumni statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        graduation_year,
        COUNT(*) as alumni_count,
        COUNT(DISTINCT company_name) as companies_count,
        COUNT(DISTINCT location) as locations_count
      FROM Alumni
      WHERE graduation_year IS NOT NULL
      GROUP BY graduation_year
      ORDER BY graduation_year DESC
    `);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get top companies
router.get('/companies/top', async (req, res) => {
  try {
    const [companies] = await db.query(`
      SELECT 
        company_name,
        COUNT(*) as alumni_count
      FROM Alumni
      WHERE company_name IS NOT NULL AND company_name != ''
      GROUP BY company_name
      ORDER BY alumni_count DESC, company_name
      LIMIT 20
    `);
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new alumni record
router.post('/', async (req, res) => {
  try {
    const { alumni_id, student_id, graduation_year, current_position, company_name, location, linkedin_url, email } = req.body;
    const [result] = await db.query(
      'INSERT INTO Alumni (alumni_id, student_id, graduation_year, current_position, company_name, location, linkedin_url, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [alumni_id, student_id, graduation_year, current_position, company_name, location, linkedin_url, email]
    );
    res.status(201).json({ message: 'Alumni record created successfully', alumni_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update alumni record
router.put('/:id', async (req, res) => {
  try {
    const { student_id, graduation_year, current_position, company_name, location, linkedin_url, email } = req.body;
    const [result] = await db.query(
      'UPDATE Alumni SET student_id = ?, graduation_year = ?, current_position = ?, company_name = ?, location = ?, linkedin_url = ?, email = ? WHERE alumni_id = ?',
      [student_id, graduation_year, current_position, company_name, location, linkedin_url, email, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Alumni record not found' });
    }
    res.json({ message: 'Alumni record updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete alumni record
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM Alumni WHERE alumni_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Alumni record not found' });
    }
    res.json({ message: 'Alumni record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;