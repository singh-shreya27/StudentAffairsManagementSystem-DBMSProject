// Mock data service for when database is not available
class MockDataService {
  constructor() {
    this.departments = [
      { department_id: 1, department_name: 'Computer Science and Engineering', department_code: 'CSE' },
      { department_id: 2, department_name: 'Electrical Engineering', department_code: 'EE' },
      { department_id: 3, department_name: 'Mechanical Engineering', department_code: 'ME' },
      { department_id: 4, department_name: 'Civil Engineering', department_code: 'CE' },
      { department_id: 5, department_name: 'Chemical Engineering', department_code: 'CHE' },
      { department_id: 6, department_name: 'Mathematics and Computing', department_code: 'MAC' }
    ];

    this.students = [
      { 
        student_id: 1, 
        student_name: 'Raj Kumar', 
        department_id: 1, 
        hostel_id: 1, 
        mess_id: 1,
        contact_number: '9876543210',
        email: 'raj.kumar@iitjammu.ac.in',
        date_of_birth: '2000-05-15',
        gender: 'Male',
        admission_year: 2020,
        status: 'Active',
        address: 'Mumbai, Maharashtra'
      },
      { 
        student_id: 2, 
        student_name: 'Priya Sharma', 
        department_id: 2, 
        hostel_id: 2, 
        mess_id: 1,
        contact_number: '9876543211',
        email: 'priya.sharma@iitjammu.ac.in',
        date_of_birth: '2001-03-20',
        gender: 'Female',
        admission_year: 2021,
        status: 'Active',
        address: 'Delhi, India'
      },
      { 
        student_id: 3, 
        student_name: 'Amit Singh', 
        department_id: 3, 
        hostel_id: 3, 
        mess_id: 2,
        contact_number: '9876543212',
        email: 'amit.singh@iitjammu.ac.in',
        date_of_birth: '1999-12-10',
        gender: 'Male',
        admission_year: 2019,
        status: 'Active',
        address: 'Pune, Maharashtra'
      },
      { 
        student_id: 4, 
        student_name: 'Sneha Patel', 
        department_id: 1, 
        hostel_id: 2, 
        mess_id: 1,
        contact_number: '9876543213',
        email: 'sneha.patel@iitjammu.ac.in',
        date_of_birth: '2000-08-25',
        gender: 'Female',
        admission_year: 2020,
        status: 'Active',
        address: 'Ahmedabad, Gujarat'
      },
      { 
        student_id: 5, 
        student_name: 'Vikram Reddy', 
        department_id: 4, 
        hostel_id: 1, 
        mess_id: 2,
        contact_number: '9876543214',
        email: 'vikram.reddy@iitjammu.ac.in',
        date_of_birth: '1999-11-30',
        gender: 'Male',
        admission_year: 2019,
        status: 'Graduated',
        address: 'Hyderabad, Telangana'
      }
    ];

    this.staff = [
      { staff_id: 1, staff_name: 'Dr. Rajesh Kumar', designation: 'Professor', department_id: 1, email: 'rajesh.kumar@iitjammu.ac.in', contact_number: '9876501001' },
      { staff_id: 2, staff_name: 'Dr. Sunita Sharma', designation: 'Associate Professor', department_id: 2, email: 'sunita.sharma@iitjammu.ac.in', contact_number: '9876501002' },
      { staff_id: 3, staff_name: 'Prof. Anil Gupta', designation: 'Professor', department_id: 3, email: 'anil.gupta@iitjammu.ac.in', contact_number: '9876501003' },
      { staff_id: 4, staff_name: 'Dr. Meera Joshi', designation: 'Assistant Professor', department_id: 4, email: 'meera.joshi@iitjammu.ac.in', contact_number: '9876501004' }
    ];

    this.hostels = [
      { hostel_id: 1, hostel_name: 'Brahmaputra Hostel', total_rooms: 150, warden_id: 1 },
      { hostel_id: 2, hostel_name: 'Ganga Hostel', total_rooms: 120, warden_id: 2 },
      { hostel_id: 3, hostel_name: 'Yamuna Hostel', total_rooms: 100, warden_id: 3 },
      { hostel_id: 4, hostel_name: 'Kaveri Hostel', total_rooms: 80, warden_id: 4 }
    ];

    this.events = [
      { event_id: 1, event_name: 'Tech Fest 2024', event_date: '2024-03-15', event_type: 'Technical', organizing_org_id: 1, description: 'Annual technical festival', venue: 'Main Auditorium' },
      { event_id: 2, event_name: 'Cultural Night', event_date: '2024-04-20', event_type: 'Cultural', organizing_org_id: 2, description: 'Cultural events and performances', venue: 'Open Air Theatre' },
      { event_id: 3, event_name: 'Sports Meet', event_date: '2024-05-10', event_type: 'Sports', organizing_org_id: 3, description: 'Inter-department sports competition', venue: 'Sports Complex' }
    ];

    this.organizations = [
      { org_id: 1, org_name: 'Technical Society', org_type: 'Technical', description: 'Student technical activities', faculty_advisor_id: 1 },
      { org_id: 2, org_name: 'Cultural Club', org_type: 'Cultural', description: 'Cultural activities and events', faculty_advisor_id: 2 },
      { org_id: 3, org_name: 'Sports Committee', org_type: 'Sports', description: 'Sports and fitness activities', faculty_advisor_id: 3 }
    ];

    this.placements = [
      { placement_id: 1, student_id: 5, company_name: 'Google', placement_type: 'Full-time', package_offered: 25.0, placement_date: '2023-12-15', status: 'Placed' },
      { placement_id: 2, student_id: 1, company_name: 'Microsoft', placement_type: 'Internship', package_offered: 8.0, placement_date: '2024-05-20', status: 'Placed' },
      { placement_id: 3, student_id: 2, company_name: 'Amazon', placement_type: 'Full-time', package_offered: 22.0, placement_date: '2024-01-10', status: 'Applied' }
    ];

    this.mess = [
      { mess_id: 1, mess_name: 'Central Mess', location: 'Academic Block', capacity: 500 },
      { mess_id: 2, mess_name: 'Hostel Mess A', location: 'Hostel Complex A', capacity: 300 },
      { mess_id: 3, mess_name: 'Hostel Mess B', location: 'Hostel Complex B', capacity: 250 }
    ];

    // Auto-increment counters
    this.nextIds = {
      department: Math.max(...this.departments.map(d => d.department_id)) + 1,
      student: Math.max(...this.students.map(s => s.student_id)) + 1,
      staff: Math.max(...this.staff.map(s => s.staff_id)) + 1,
      hostel: Math.max(...this.hostels.map(h => h.hostel_id)) + 1,
      event: Math.max(...this.events.map(e => e.event_id)) + 1,
      organization: Math.max(...this.organizations.map(o => o.org_id)) + 1,
      placement: Math.max(...this.placements.map(p => p.placement_id)) + 1,
      mess: Math.max(...this.mess.map(m => m.mess_id)) + 1
    };
  }

  // Generic CRUD operations
  async find(table, conditions = {}) {
    const data = this[table] || [];
    if (Object.keys(conditions).length === 0) {
      return [data]; // Return in MySQL format [rows, fields]
    }
    
    const filtered = data.filter(item => {
      return Object.keys(conditions).every(key => item[key] == conditions[key]);
    });
    return [filtered];
  }

  async findById(table, id, idField) {
    const data = this[table] || [];
    const item = data.find(item => item[idField] == id);
    return [item ? [item] : []];
  }

  async create(table, data) {
    const collection = this[table] || [];
    const idField = this.getIdField(table);
    
    // Auto-assign ID if not provided
    if (!data[idField]) {
      data[idField] = this.nextIds[table.replace(/s$/, '')]; // Remove 's' from plural
      this.nextIds[table.replace(/s$/, '')]++;
    }
    
    collection.push(data);
    return [{ insertId: data[idField], affectedRows: 1 }];
  }

  async update(table, id, data, idField) {
    const collection = this[table] || [];
    const index = collection.findIndex(item => item[idField] == id);
    
    if (index === -1) {
      return [{ affectedRows: 0 }];
    }
    
    // Update the item
    collection[index] = { ...collection[index], ...data };
    return [{ affectedRows: 1 }];
  }

  async delete(table, id, idField) {
    const collection = this[table] || [];
    const index = collection.findIndex(item => item[idField] == id);
    
    if (index === -1) {
      return [{ affectedRows: 0 }];
    }
    
    collection.splice(index, 1);
    return [{ affectedRows: 1 }];
  }

  getIdField(table) {
    const idFields = {
      departments: 'department_id',
      students: 'student_id',
      staff: 'staff_id',
      hostels: 'hostel_id',
      events: 'event_id',
      organizations: 'org_id',
      placements: 'placement_id',
      mess: 'mess_id'
    };
    return idFields[table] || 'id';
  }

  // Dashboard statistics
  async getOverviewStats() {
    return {
      students: this.students.length,
      departments: this.departments.length,
      staff: this.staff.length,
      hostels: this.hostels.length,
      events: this.events.length,
      organizations: this.organizations.length,
      placements: this.placements.length,
      mess: this.mess.length,
      alumni: this.students.filter(s => s.status === 'Graduated').length
    };
  }

  async getStudentStats() {
    return {
      byStatus: this.groupBy(this.students, 'status'),
      byDepartment: this.students.reduce((acc, student) => {
        const dept = this.departments.find(d => d.department_id === student.department_id);
        if (dept) {
          const existing = acc.find(item => item.department_name === dept.department_name);
          if (existing) {
            existing.student_count++;
          } else {
            acc.push({ department_name: dept.department_name, student_count: 1 });
          }
        }
        return acc;
      }, []),
      byGender: this.groupBy(this.students, 'gender'),
      byAdmissionYear: this.groupBy(this.students, 'admission_year')
    };
  }

  groupBy(array, key) {
    return array.reduce((acc, item) => {
      const value = item[key];
      const existing = acc.find(group => group[key] === value);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ [key]: value, count: 1 });
      }
      return acc;
    }, []);
  }
}

module.exports = new MockDataService();