-- Create the database
CREATE DATABASE IF NOT EXISTS iit_jammu_student_affairs;

-- Use the database
USE iit_jammu_student_affairs;

-- Create Departments table
CREATE TABLE Departments (
    department_id INT PRIMARY KEY,
    department_name VARCHAR(100),
    department_code VARCHAR(10)
);

-- Create Staff table
CREATE TABLE Staff (
    staff_id INT PRIMARY KEY,
    staff_name VARCHAR(100),
    designation VARCHAR(50),
    department_id INT,
    email VARCHAR(100),
    contact_number VARCHAR(15),
    FOREIGN KEY (department_id) REFERENCES Departments(department_id)
);

-- Create Hostels table
CREATE TABLE Hostels (
    hostel_id INT PRIMARY KEY,
    hostel_name VARCHAR(100),
    warden_id INT,
    FOREIGN KEY (warden_id) REFERENCES Staff(staff_id)
);

-- Create Mess table
CREATE TABLE Mess (
    mess_id INT PRIMARY KEY,
    mess_name VARCHAR(100),
    mess_incharge_id INT,
    FOREIGN KEY (mess_incharge_id) REFERENCES Staff(staff_id)
);

-- Create Students table
CREATE TABLE Students (
    student_id INT PRIMARY KEY,
    student_name VARCHAR(100),
    department_id INT,
    hostel_id INT,
    mess_id INT,
    contact_number VARCHAR(15),
    email VARCHAR(100) UNIQUE,
    date_of_birth DATE,
    gender ENUM('Male', 'Female', 'Other'),
    address TEXT,
    admission_year INT,
    status ENUM('Active', 'Graduated', 'On Leave', 'Withdrawn'),
    FOREIGN KEY (department_id) REFERENCES Departments(department_id),
    FOREIGN KEY (hostel_id) REFERENCES Hostels(hostel_id),
    FOREIGN KEY (mess_id) REFERENCES Mess(mess_id)
);

-- Create Rooms table
CREATE TABLE Rooms (
    room_id INT PRIMARY KEY,
    hostel_id INT,
    room_number VARCHAR(10),
    capacity INT,
    FOREIGN KEY (hostel_id) REFERENCES Hostels(hostel_id)
);

-- Create Room_Allocations table
CREATE TABLE Room_Allocations (
    allocation_id INT PRIMARY KEY,
    student_id INT,
    room_id INT,
    start_date DATE,
    end_date DATE,
    FOREIGN KEY (student_id) REFERENCES Students(student_id),
    FOREIGN KEY (room_id) REFERENCES Rooms(room_id)
);

-- Create Mess_Subscriptions table
CREATE TABLE Mess_Subscriptions (
    subscription_id INT PRIMARY KEY,
    student_id INT,
    mess_id INT,
    start_date DATE,
    end_date DATE,
    FOREIGN KEY (student_id) REFERENCES Students(student_id),
    FOREIGN KEY (mess_id) REFERENCES Mess(mess_id)
);

-- Create Disciplinary_Actions table
CREATE TABLE Disciplinary_Actions (
    action_id INT PRIMARY KEY,
    student_id INT,
    incident_date DATE,
    description TEXT,
    action_taken TEXT,
    fine_amount DECIMAL(10,2),
    severity ENUM('Minor', 'Major', 'Severe'),
    recorded_by INT,
    status ENUM('Active', 'Closed'),
    FOREIGN KEY (student_id) REFERENCES Students(student_id),
    FOREIGN KEY (recorded_by) REFERENCES Staff(staff_id)
);

-- Create Organizations table
CREATE TABLE Organizations (
    org_id INT PRIMARY KEY,
    org_name VARCHAR(100),
    org_type ENUM('Club', 'Sports', 'Society'),
    category ENUM('Technical', 'Cultural', 'Social', 'Sports'),
    faculty_coordinator_id INT,
    coordinator_id INT,
    secretary_id INT,
    head_id INT,
    parent_org_id INT,
    budget DECIMAL(12,2),
    coach_name VARCHAR(100),
    coach_contact VARCHAR(20),
    description TEXT,
    FOREIGN KEY (faculty_coordinator_id) REFERENCES Staff(staff_id),
    FOREIGN KEY (coordinator_id) REFERENCES Students(student_id),
    FOREIGN KEY (secretary_id) REFERENCES Students(student_id),
    FOREIGN KEY (head_id) REFERENCES Staff(staff_id),
    FOREIGN KEY (parent_org_id) REFERENCES Organizations(org_id)
);

-- Create Memberships table
CREATE TABLE Memberships (
    membership_id INT PRIMARY KEY,
    student_id INT,
    org_id INT,
    role VARCHAR(50),
    join_date DATE,
    end_date DATE,
    FOREIGN KEY (student_id) REFERENCES Students(student_id),
    FOREIGN KEY (org_id) REFERENCES Organizations(org_id)
);

-- Create Events table
CREATE TABLE Events (
    event_id INT PRIMARY KEY,
    event_name VARCHAR(100),
    event_type ENUM('Cultural', 'Technical', 'Workshop', 'Sports'),
    organizing_org_id INT,
    event_date DATE,
    venue VARCHAR(100),
    event_level ENUM('Intra-College', 'Inter-College', 'National'),
    description TEXT,
    budget DECIMAL(12,2),
    FOREIGN KEY (organizing_org_id) REFERENCES Organizations(org_id)
);

-- Create Event_Participation table
CREATE TABLE Event_Participation (
    participation_id INT PRIMARY KEY,
    event_id INT,
    student_id INT,
    role ENUM('Participant', 'Organizer', 'Volunteer'),
    position_secured VARCHAR(50),
    medal VARCHAR(20),
    certificate_issued BOOLEAN,
    FOREIGN KEY (event_id) REFERENCES Events(event_id),
    FOREIGN KEY (student_id) REFERENCES Students(student_id)
);

-- Create Placements table
CREATE TABLE Placements (
    placement_id INT PRIMARY KEY,
    student_id INT,
    company_name VARCHAR(100),
    role_offered VARCHAR(100),
    package_offered DECIMAL(12,2),
    placement_type ENUM('Internship', 'Full-Time'),
    placement_date DATE,
    status ENUM('Placed', 'Not Placed', 'Offer Declined'),
    FOREIGN KEY (student_id) REFERENCES Students(student_id)
);

-- Create Recruiters table
CREATE TABLE Recruiters (
    recruiter_id INT PRIMARY KEY,
    company_name VARCHAR(100),
    industry_type VARCHAR(100),
    contact_person VARCHAR(100),
    contact_email VARCHAR(100),
    contact_number VARCHAR(15)
);

-- Create Payments table
CREATE TABLE Payments (
    payment_id INT PRIMARY KEY,
    student_id INT,
    payment_type ENUM('Hostel Fee', 'Mess Fee', 'Fine', 'Event Fee', 'Other'),
    amount DECIMAL(10,2),
    payment_date DATE,
    payment_status ENUM('Pending', 'Completed', 'Failed'),
    transaction_id VARCHAR(50),
    FOREIGN KEY (student_id) REFERENCES Students(student_id)
);

-- Create Feedback_System table
CREATE TABLE Feedback_System (
    feedback_id INT PRIMARY KEY,
    student_id INT,
    category ENUM('Hostel', 'Mess', 'Event', 'Course', 'General'),
    reference_id INT,
    feedback_text TEXT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    feedback_date DATE,
    FOREIGN KEY (student_id) REFERENCES Students(student_id)
);

-- Create Alumni table
CREATE TABLE Alumni (
    alumni_id INT PRIMARY KEY,
    student_id INT,
    graduation_year INT,
    current_position VARCHAR(100),
    company_name VARCHAR(100),
    location VARCHAR(100),
    linkedin_url VARCHAR(255),
    email VARCHAR(100),
    FOREIGN KEY (student_id) REFERENCES Students(student_id)
);

-- Create Networking table
CREATE TABLE Networking (
    connection_id INT PRIMARY KEY,
    alumni_id INT,
    student_id INT,
    connection_type ENUM('Mentorship', 'Referral', 'Collaboration'),
    initiated_date DATE,
    status ENUM('Active', 'Closed'),
    FOREIGN KEY (alumni_id) REFERENCES Alumni(alumni_id),
    FOREIGN KEY (student_id) REFERENCES Students(student_id)
);
