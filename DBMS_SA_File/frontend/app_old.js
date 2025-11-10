const API_BASE_URL = 'http://localhost:3000/api';

// Helper function for authenticated API requests
async function authenticatedFetch(url, options = {}) {
    const token = localStorage.getItem('token');
    if (!token) {
        showLoginModal();
        throw new Error('No authentication token found');
    }
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
    
    // Merge options
    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(url, mergedOptions);
        
        // If unauthorized, show login modal
        if (response.status === 401) {
            localStorage.removeItem('token');
            showLoginModal();
            throw new Error('Authentication failed');
        }
        
        return response;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

// Authentication functions
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
        hideLoginModal();
        loadTabData('dashboard');
    } else {
        showLoginModal();
    }
    
    // Setup login form
    setupLogin();
});

function setupLogin() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('loginError');
            
            try {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    hideLoginModal();
                    loadTabData('dashboard');
                } else {
                    errorDiv.textContent = data.error || 'Login failed';
                    errorDiv.style.display = 'block';
                }
            } catch (error) {
                console.error('Login error:', error);
                errorDiv.textContent = 'Network error. Please try again.';
                errorDiv.style.display = 'block';
            }
        });
    }
}

function showLoginModal() {
    const modal = document.getElementById('loginModal');
    const mainApp = document.getElementById('mainApp');
    if (modal && mainApp) {
        modal.style.display = 'block';
        mainApp.style.display = 'none';
    }
}

function hideLoginModal() {
    const modal = document.getElementById('loginModal');
    const mainApp = document.getElementById('mainApp');
    if (modal && mainApp) {
        modal.style.display = 'none';
        mainApp.style.display = 'block';
    }
}

function logout() {
    localStorage.removeItem('token');
    showLoginModal();
}

// Tab switching functionality
document.querySelectorAll('.nav-link[data-tab]').forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const tabName = button.dataset.tab;
        
        // Remove active class from all tabs and contents
        document.querySelectorAll('.nav-link[data-tab]').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding content
        button.classList.add('active');
        document.getElementById(tabName).classList.add('active');
        
        // Load data for the active tab
        loadTabData(tabName);
    });
});

// Load data based on active tab
function loadTabData(tabName) {
    switch(tabName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'students':
            loadStudents();
            break;
        case 'departments':
            loadDepartments();
            break;
        case 'staff':
            loadStaff();
            break;
        case 'hostels':
            loadHostels();
            break;
        case 'mess':
            loadMess();
            break;
        case 'events':
            loadEvents();
            break;
        case 'organizations':
            loadOrganizations();
            break;
        case 'placements':
            loadPlacements();
            break;
    }
}

// Students CRUD Operations
async function loadStudents() {
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/students`);
        const students = await response.json();
        
        const tbody = document.getElementById('studentsTableBody');
        if (students.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7">No students found</td></tr>';
            return;
        }
        
        tbody.innerHTML = students.map(student => `
            <tr>
                <td>${student.student_id}</td>
                <td>${student.student_name}</td>
                <td>${student.email}</td>
                <td>${student.department_id || 'N/A'}</td>
                <td>${student.hostel_id || 'N/A'}</td>
                <td><span class="badge">${student.status}</span></td>
                <td class="actions">
                    <button class="btn btn-danger" onclick="deleteStudent(${student.student_id})">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading students:', error);
        document.getElementById('studentsTableBody').innerHTML = 
            '<tr><td colspan="7">Error loading students</td></tr>';
    }
}

function showAddStudentForm() {
    document.getElementById('addStudentForm').style.display = 'block';
}

function hideAddStudentForm() {
    document.getElementById('addStudentForm').style.display = 'none';
    document.getElementById('studentForm').reset();
}

document.getElementById('studentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const studentData = {
        student_id: parseInt(document.getElementById('student_id').value),
        student_name: document.getElementById('student_name').value,
        department_id: parseInt(document.getElementById('department_id').value) || null,
        hostel_id: parseInt(document.getElementById('hostel_id').value) || null,
        mess_id: parseInt(document.getElementById('mess_id').value) || null,
        contact_number: document.getElementById('contact_number').value,
        email: document.getElementById('email').value,
        date_of_birth: document.getElementById('date_of_birth').value || null,
        gender: document.getElementById('gender').value || null,
        address: document.getElementById('address').value || null,
        admission_year: parseInt(document.getElementById('admission_year').value) || null,
        status: document.getElementById('status').value
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/students`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(studentData)
        });
        
        if (response.ok) {
            alert('Student added successfully!');
            hideAddStudentForm();
            loadStudents();
        } else {
            const error = await response.json();
            alert('Error: ' + error.error);
        }
    } catch (error) {
        console.error('Error adding student:', error);
        alert('Error adding student');
    }
});

async function deleteStudent(id) {
    if (!confirm('Are you sure you want to delete this student?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/students/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Student deleted successfully!');
            loadStudents();
        } else {
            alert('Error deleting student');
        }
    } catch (error) {
        console.error('Error deleting student:', error);
        alert('Error deleting student');
    }
}

// Departments CRUD Operations
async function loadDepartments() {
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/departments`);
        const departments = await response.json();
        
        const tbody = document.getElementById('departmentsTableBody');
        if (departments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">No departments found</td></tr>';
            return;
        }
        
        tbody.innerHTML = departments.map(dept => `
            <tr>
                <td>${dept.department_id}</td>
                <td>${dept.department_name}</td>
                <td>${dept.department_code}</td>
                <td class="actions">
                    <button class="btn btn-danger" onclick="deleteDepartment(${dept.department_id})">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading departments:', error);
        document.getElementById('departmentsTableBody').innerHTML = 
            '<tr><td colspan="4">Error loading departments</td></tr>';
    }
}

function showAddDepartmentForm() {
    document.getElementById('addDepartmentForm').style.display = 'block';
}

function hideAddDepartmentForm() {
    document.getElementById('addDepartmentForm').style.display = 'none';
    document.getElementById('departmentForm').reset();
}

document.getElementById('departmentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const deptData = {
        department_id: parseInt(document.getElementById('dept_id').value),
        department_name: document.getElementById('dept_name').value,
        department_code: document.getElementById('dept_code').value
    };
    
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/departments`, {
            method: 'POST',
            body: JSON.stringify(deptData)
        });
        
        if (response.ok) {
            alert('Department added successfully!');
            hideAddDepartmentForm();
            loadDepartments();
        } else {
            const error = await response.json();
            alert('Error: ' + error.error);
        }
    } catch (error) {
        console.error('Error adding department:', error);
        alert('Error adding department: ' + error.message);
    }
});

async function deleteDepartment(id) {
    if (!confirm('Are you sure you want to delete this department?')) {
        return;
    }
    
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/departments/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Department deleted successfully!');
            loadDepartments();
        } else {
            alert('Error deleting department');
        }
    } catch (error) {
        console.error('Error deleting department:', error);
        alert('Error deleting department: ' + error.message);
    }
}

// Staff CRUD Operations
async function loadStaff() {
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/staff`);
        const staff = await response.json();
        
        const tbody = document.getElementById('staffTableBody');
        if (staff.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6">No staff found</td></tr>';
            return;
        }
        
        tbody.innerHTML = staff.map(s => `
            <tr>
                <td>${s.staff_id}</td>
                <td>${s.staff_name}</td>
                <td>${s.designation}</td>
                <td>${s.email}</td>
                <td>${s.contact_number || 'N/A'}</td>
                <td class="actions">
                    <button class="btn btn-danger" onclick="deleteStaff(${s.staff_id})">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading staff:', error);
        document.getElementById('staffTableBody').innerHTML = 
            '<tr><td colspan="6">Error loading staff</td></tr>';
    }
}

function showAddStaffForm() {
    document.getElementById('addStaffForm').style.display = 'block';
}

function hideAddStaffForm() {
    document.getElementById('addStaffForm').style.display = 'none';
    document.getElementById('staffForm').reset();
}

document.getElementById('staffForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const staffData = {
        staff_id: parseInt(document.getElementById('staff_id').value),
        staff_name: document.getElementById('staff_name').value,
        designation: document.getElementById('designation').value,
        department_id: parseInt(document.getElementById('staff_dept_id').value) || null,
        email: document.getElementById('staff_email').value,
        contact_number: document.getElementById('staff_contact').value
    };
    
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/staff`, {
            method: 'POST',
            body: JSON.stringify(staffData)
        });
        
        if (response.ok) {
            alert('Staff added successfully!');
            hideAddStaffForm();
            loadStaff();
        } else {
            const error = await response.json();
            alert('Error: ' + error.error);
        }
    } catch (error) {
        console.error('Error adding staff:', error);
        alert('Error adding staff');
    }
});

async function deleteStaff(id) {
    if (!confirm('Are you sure you want to delete this staff member?')) {
        return;
    }
    
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/staff/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Staff deleted successfully!');
            loadStaff();
        } else {
            alert('Error deleting staff');
        }
    } catch (error) {
        console.error('Error deleting staff:', error);
        alert('Error deleting staff');
    }
}

// Hostels Operations
async function loadHostels() {
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/hostels`);
        const hostels = await response.json();
        
        const tbody = document.getElementById('hostelsTableBody');
        if (hostels.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">No hostels found</td></tr>';
            return;
        }
        
        tbody.innerHTML = hostels.map(h => `
            <tr>
                <td>${h.hostel_id}</td>
                <td>${h.hostel_name}</td>
                <td>${h.warden_id || 'N/A'}</td>
                <td class="actions">
                    <button class="btn btn-danger" onclick="deleteHostel(${h.hostel_id})">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading hostels:', error);
        document.getElementById('hostelsTableBody').innerHTML = 
            '<tr><td colspan="4">Error loading hostels</td></tr>';
    }
}

async function deleteHostel(id) {
    if (!confirm('Are you sure you want to delete this hostel?')) {
        return;
    }
    
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/hostels/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Hostel deleted successfully!');
            loadHostels();
        } else {
            alert('Error deleting hostel');
        }
    } catch (error) {
        console.error('Error deleting hostel:', error);
    }
}

// Mess Operations
async function loadMess() {
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/mess`);
        const mess = await response.json();
        
        const tbody = document.getElementById('messTableBody');
        if (mess.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">No mess found</td></tr>';
            return;
        }
        
        tbody.innerHTML = mess.map(m => `
            <tr>
                <td>${m.mess_id}</td>
                <td>${m.mess_name}</td>
                <td>${m.mess_incharge_id || 'N/A'}</td>
                <td class="actions">
                    <button class="btn btn-danger" onclick="deleteMess(${m.mess_id})">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading mess:', error);
        document.getElementById('messTableBody').innerHTML = 
            '<tr><td colspan="4">Error loading mess</td></tr>';
    }
}

async function deleteMess(id) {
    if (!confirm('Are you sure you want to delete this mess?')) {
        return;
    }
    
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/mess/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Mess deleted successfully!');
            loadMess();
        } else {
            alert('Error deleting mess');
        }
    } catch (error) {
        console.error('Error deleting mess:', error);
    }
}

// Events Operations
async function loadEvents() {
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/events`);
        const events = await response.json();
        
        const tbody = document.getElementById('eventsTableBody');
        if (events.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6">No events found</td></tr>';
            return;
        }
        
        tbody.innerHTML = events.map(e => `
            <tr>
                <td>${e.event_id}</td>
                <td>${e.event_name}</td>
                <td>${e.event_type}</td>
                <td>${e.event_date || 'N/A'}</td>
                <td>${e.venue || 'N/A'}</td>
                <td class="actions">
                    <button class="btn btn-danger" onclick="deleteEvent(${e.event_id})">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading events:', error);
        document.getElementById('eventsTableBody').innerHTML = 
            '<tr><td colspan="6">Error loading events</td></tr>';
    }
}

async function deleteEvent(id) {
    if (!confirm('Are you sure you want to delete this event?')) {
        return;
    }
    
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/events/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Event deleted successfully!');
            loadEvents();
        } else {
            alert('Error deleting event');
        }
    } catch (error) {
        console.error('Error deleting event:', error);
    }
}

// Organizations Operations
async function loadOrganizations() {
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/organizations`);
        const orgs = await response.json();
        
        const tbody = document.getElementById('organizationsTableBody');
        if (orgs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6">No organizations found</td></tr>';
            return;
        }
        
        tbody.innerHTML = orgs.map(o => `
            <tr>
                <td>${o.org_id}</td>
                <td>${o.org_name}</td>
                <td>${o.org_type}</td>
                <td>${o.category}</td>
                <td>${o.budget || 'N/A'}</td>
                <td class="actions">
                    <button class="btn btn-danger" onclick="deleteOrganization(${o.org_id})">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading organizations:', error);
        document.getElementById('organizationsTableBody').innerHTML = 
            '<tr><td colspan="6">Error loading organizations</td></tr>';
    }
}

async function deleteOrganization(id) {
    if (!confirm('Are you sure you want to delete this organization?')) {
        return;
    }
    
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/organizations/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Organization deleted successfully!');
            loadOrganizations();
        } else {
            alert('Error deleting organization');
        }
    } catch (error) {
        console.error('Error deleting organization:', error);
    }
}

// Placements Operations
async function loadPlacements() {
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/placements`);
        const placements = await response.json();
        
        const tbody = document.getElementById('placementsTableBody');
        if (placements.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8">No placements found</td></tr>';
            return;
        }
        
        tbody.innerHTML = placements.map(p => `
            <tr>
                <td>${p.placement_id}</td>
                <td>${p.student_id}</td>
                <td>${p.company_name}</td>
                <td>${p.role_offered}</td>
                <td>${p.package_offered || 'N/A'}</td>
                <td>${p.placement_type}</td>
                <td>${p.status}</td>
                <td class="actions">
                    <button class="btn btn-danger" onclick="deletePlacement(${p.placement_id})">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading placements:', error);
        document.getElementById('placementsTableBody').innerHTML = 
            '<tr><td colspan="8">Error loading placements</td></tr>';
    }
}

async function deletePlacement(id) {
    if (!confirm('Are you sure you want to delete this placement?')) {
        return;
    }
    
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/placements/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Placement deleted successfully!');
            loadPlacements();
        } else {
            alert('Error deleting placement');
        }
    } catch (error) {
        console.error('Error deleting placement:', error);
    }
}

// Dashboard Functions
async function loadDashboard() {
    try {
        // Get JWT token
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No authentication token found');
            return;
        }

        // Load overview statistics
        await loadOverviewStats(token);
        
        // Load charts and recent data
        await loadDashboardCharts(token);
        
        // Load recent activities
        await loadRecentActivities(token);
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

async function loadOverviewStats(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/overview`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch overview stats');
        }
        
        const data = await response.json();
        const overview = data.overview;
        
        // Update stats cards
        document.getElementById('totalStudents').textContent = overview.students || 0;
        document.getElementById('totalEvents').textContent = overview.events || 0;
        
        // Calculate and display hostel occupancy percentage
        const hostelResponse = await fetch(`${API_BASE_URL}/dashboard/accommodation`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (hostelResponse.ok) {
            const hostelData = await hostelResponse.json();
            let totalCapacity = 0;
            let totalOccupied = 0;
            
            hostelData.hostelOccupancy.forEach(hostel => {
                totalCapacity += hostel.total_capacity || 0;
                totalOccupied += hostel.occupied_beds || 0;
            });
            
            const occupancyPercent = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;
            document.getElementById('hostelOccupancy').textContent = `${occupancyPercent}%`;
        }
        
        // Get pending payments count
        const financeResponse = await fetch(`${API_BASE_URL}/dashboard/finance`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (financeResponse.ok) {
            const financeData = await financeResponse.json();
            const pendingPayments = financeData.byStatus.find(status => 
                status.payment_status === 'Pending'
            )?.count || 0;
            document.getElementById('pendingPayments').textContent = pendingPayments;
        }
        
    } catch (error) {
        console.error('Error loading overview stats:', error);
    }
}

async function loadDashboardCharts(token) {
    try {
        // Load student statistics for charts
        const studentResponse = await fetch(`${API_BASE_URL}/dashboard/students`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (studentResponse.ok) {
            const studentData = await studentResponse.json();
            
            // Create department distribution chart
            createDepartmentChart(studentData.byDepartment);
            
            // Create status distribution chart
            createStatusChart(studentData.byStatus);
            
            // Create gender distribution chart
            createGenderChart(studentData.byGender);
        }
        
        // Load placement statistics
        const placementResponse = await fetch(`${API_BASE_URL}/dashboard/placements`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (placementResponse.ok) {
            const placementData = await placementResponse.json();
            createPlacementChart(placementData.byType);
        }
        
    } catch (error) {
        console.error('Error loading dashboard charts:', error);
    }
}

async function loadRecentActivities(token) {
    try {
        // Load recent students
        const studentResponse = await fetch(`${API_BASE_URL}/students?limit=5`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (studentResponse.ok) {
            const students = await studentResponse.json();
            const recentStudentsDiv = document.getElementById('recentStudents');
            
            if (students.length > 0) {
                recentStudentsDiv.innerHTML = students.slice(0, 5).map(student => `
                    <div class="d-flex justify-content-between align-items-center border-bottom py-2">
                        <div>
                            <strong>${student.student_name}</strong><br>
                            <small class="text-muted">${student.email}</small>
                        </div>
                        <span class="badge bg-primary">${student.status}</span>
                    </div>
                `).join('');
            } else {
                recentStudentsDiv.innerHTML = '<p class="text-muted">No recent students</p>';
            }
        }
        
        // Load recent events
        const activitiesResponse = await fetch(`${API_BASE_URL}/dashboard/activities`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (activitiesResponse.ok) {
            const activitiesData = await activitiesResponse.json();
            const recentEventsDiv = document.getElementById('recentEvents');
            
            if (activitiesData.recentEvents.length > 0) {
                recentEventsDiv.innerHTML = activitiesData.recentEvents.slice(0, 5).map(event => `
                    <div class="d-flex justify-content-between align-items-center border-bottom py-2">
                        <div>
                            <strong>${event.event_name}</strong><br>
                            <small class="text-muted">${new Date(event.event_date).toLocaleDateString()}</small>
                        </div>
                        <span class="badge bg-success">${event.event_type}</span>
                    </div>
                `).join('');
            } else {
                recentEventsDiv.innerHTML = '<p class="text-muted">No recent events</p>';
            }
        }
        
    } catch (error) {
        console.error('Error loading recent activities:', error);
    }
}

// Chart creation functions
function createDepartmentChart(data) {
    const chartContainer = document.getElementById('dashboardStats');
    
    // Add chart container after stats cards if it doesn't exist
    let chartSection = document.getElementById('dashboardCharts');
    if (!chartSection) {
        chartSection = document.createElement('div');
        chartSection.id = 'dashboardCharts';
        chartSection.className = 'row mb-4';
        chartSection.innerHTML = `
            <div class="col-lg-6">
                <div class="card shadow">
                    <div class="card-header">
                        <h6 class="m-0 font-weight-bold text-primary">Students by Department</h6>
                    </div>
                    <div class="card-body">
                        <canvas id="departmentChart" width="400" height="200"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-lg-6">
                <div class="card shadow">
                    <div class="card-header">
                        <h6 class="m-0 font-weight-bold text-primary">Student Status Distribution</h6>
                    </div>
                    <div class="card-body">
                        <canvas id="statusChart" width="400" height="200"></canvas>
                    </div>
                </div>
            </div>
        `;
        chartContainer.parentNode.insertBefore(chartSection, chartContainer.nextSibling);
    }
    
    // Create department chart
    const ctx = document.getElementById('departmentChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.map(dept => dept.department_name),
            datasets: [{
                data: data.map(dept => dept.student_count),
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
                    '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function createStatusChart(data) {
    const ctx = document.getElementById('statusChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.map(status => status.status),
            datasets: [{
                data: data.map(status => status.count),
                backgroundColor: ['#28a745', '#17a2b8', '#ffc107', '#dc3545']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function createGenderChart(data) {
    // This could be added as another chart if needed
    console.log('Gender distribution:', data);
}

function createPlacementChart(data) {
    // This could be added as another chart if needed
    console.log('Placement data:', data);
}

// Profile functions
function showProfile() {
    // Simple profile modal or alert for now
    alert('Profile functionality - Admin User\nUsername: admin\nRole: Administrator');
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}
