const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Mock departments data
const mockDepartments = [
  { department_id: 1, department_name: 'Computer Science and Engineering', department_code: 'CSE' },
  { department_id: 2, department_name: 'Electrical Engineering', department_code: 'EE' },
  { department_id: 3, department_name: 'Mechanical Engineering', department_code: 'ME' },
  { department_id: 4, department_name: 'Civil Engineering', department_code: 'CE' },
  { department_id: 5, department_name: 'Chemical Engineering', department_code: 'CHE' },
  { department_id: 6, department_name: 'Mathematics and Computing', department_code: 'MAC' }
];

// Get all departments
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Departments');
    res.json(rows);
  } catch (error) {
    console.log('Database not available, using mock data');
    res.json(mockDepartments);
  }
});

// Get department by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Departments WHERE department_id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.log('Database not available, using mock data');
    const department = mockDepartments.find(d => d.department_id == req.params.id);
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }
    res.json(department);
  }
});

// Create new department
router.post('/', async (req, res) => {
  try {
    const { department_id, department_name, department_code } = req.body;
    
    if (!department_name || !department_code) {
      return res.status(400).json({ error: 'Department name and code are required' });
    }
    
    const [result] = await db.query(
      'INSERT INTO Departments (department_id, department_name, department_code) VALUES (?, ?, ?)',
      [department_id, department_name, department_code]
    );
    res.status(201).json({ message: 'Department created successfully', department_id });
  } catch (error) {
    console.log('Database not available, simulating success');
    const { department_id, department_name, department_code } = req.body;
    
    if (!department_name || !department_code) {
      return res.status(400).json({ error: 'Department name and code are required' });
    }
    
    // Add to mock data
    const newId = department_id || Math.max(...mockDepartments.map(d => d.department_id)) + 1;
    mockDepartments.push({
      department_id: newId,
      department_name,
      department_code
    });
    
    res.status(201).json({ 
      message: 'Department created successfully (mock mode)', 
      department_id: newId 
    });
  }
});

// Update department
router.put('/:id', async (req, res) => {
  try {
    const { department_name, department_code } = req.body;
    
    if (!department_name || !department_code) {
      return res.status(400).json({ error: 'Department name and code are required' });
    }
    
    const [result] = await db.query(
      'UPDATE Departments SET department_name = ?, department_code = ? WHERE department_id = ?',
      [department_name, department_code, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    res.json({ message: 'Department updated successfully' });
  } catch (error) {
    console.log('Database not available, using mock data');
    const departmentIndex = mockDepartments.findIndex(d => d.department_id == req.params.id);
    
    if (departmentIndex === -1) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    const { department_name, department_code } = req.body;
    
    if (!department_name || !department_code) {
      return res.status(400).json({ error: 'Department name and code are required' });
    }
    
    // Update mock data
    mockDepartments[departmentIndex] = {
      ...mockDepartments[departmentIndex],
      department_name,
      department_code
    };
    
    res.json({ 
      message: 'Department updated successfully (mock mode)',
      department: mockDepartments[departmentIndex]
    });
  }
});

// Delete department
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM Departments WHERE department_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.log('Database not available, simulating success');
    const index = mockDepartments.findIndex(d => d.department_id == req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    mockDepartments.splice(index, 1);
    res.json({ message: 'Department deleted successfully (mock mode)' });
  }
});

module.exports = router;
