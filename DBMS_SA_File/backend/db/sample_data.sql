-- Sample Data for IIT Jammu Student Affairs System
-- Run this after creating the database schema

USE iit_jammu_student_affairs;

-- Clear existing data
DELETE FROM Networking;
DELETE FROM Alumni;
DELETE FROM Feedback_System;
DELETE FROM Disciplinary_Actions;
DELETE FROM Payments;
DELETE FROM Recruiters;
DELETE FROM Event_Participation;
DELETE FROM Placements;
DELETE FROM Events;
DELETE FROM Memberships;
DELETE FROM Organizations;
DELETE FROM Mess_Subscriptions;
DELETE FROM Room_Allocations;
DELETE FROM Rooms;
DELETE FROM Students;
DELETE FROM Mess;
DELETE FROM Hostels;
DELETE FROM Staff;
DELETE FROM Departments;

-- Sample Departments
INSERT INTO Departments (department_id, department_name, department_code) VALUES
(1, 'Computer Science & Engineering', 'CSE'),
(2, 'Electrical Engineering', 'EE'),
(3, 'Mechanical Engineering', 'ME'),
(4, 'Civil Engineering', 'CE'),
(5, 'Mathematics', 'MATH'),
(6, 'Physics', 'PHY'),
(7, 'Chemistry', 'CHE'),
(8, 'Metallurgical Engineering', 'MTE'),
(9, 'Chemical Engineering', 'CHE'),
(10, 'Biotechnology', 'BT');

-- Sample Staff
INSERT INTO Staff (staff_id, staff_name, designation, department_id, email, contact_number) VALUES
(1, 'Dr. Rajesh Kumar', 'Professor', 1, 'rajesh.kumar@iitjammu.ac.in', '9876543210'),
(2, 'Dr. Priya Sharma', 'Associate Professor', 2, 'priya.sharma@iitjammu.ac.in', '9876543211'),
(3, 'Dr. Amit Singh', 'Assistant Professor', 3, 'amit.singh@iitjammu.ac.in', '9876543212'),
(4, 'Mr. Suresh Verma', 'Warden', 1, 'suresh.verma@iitjammu.ac.in', '9876543213'),
(5, 'Ms. Anjali Gupta', 'Mess Manager', 2, 'anjali.gupta@iitjammu.ac.in', '9876543214'),
(6, 'Dr. Kavita Jain', 'Professor', 5, 'kavita.jain@iitjammu.ac.in', '9876543215'),
(7, 'Dr. Rohit Agarwal', 'Associate Professor', 6, 'rohit.agarwal@iitjammu.ac.in', '9876543216'),
(8, 'Dr. Neha Thakur', 'Assistant Professor', 7, 'neha.thakur@iitjammu.ac.in', '9876543217'),
(9, 'Prof. Vikash Pandey', 'Professor', 8, 'vikash.pandey@iitjammu.ac.in', '9876543218'),
(10, 'Dr. Sunita Rani', 'Warden', 9, 'sunita.rani@iitjammu.ac.in', '9876543219');

-- Sample Hostels
INSERT INTO Hostels (hostel_id, hostel_name, warden_id) VALUES
(1, 'Tawi Hostel', 4),
(2, 'Chenab Hostel', 1),
(3, 'Jhelum Hostel', 2),
(4, 'Ravi Hostel', 10),
(5, 'Indus Hostel', 6);

-- Sample Mess
INSERT INTO Mess (mess_id, mess_name, mess_incharge_id) VALUES
(1, 'Central Mess', 5),
(2, 'North Mess', 5),
(3, 'South Mess', 5),
(4, 'Faculty Mess', 1);

-- Sample Rooms
INSERT INTO Rooms (room_id, hostel_id, room_number, capacity) VALUES
(1, 1, '101', 2),
(2, 1, '102', 2),
(3, 1, '103', 3),
(4, 1, '104', 2),
(5, 1, '105', 2),
(6, 2, '201', 2),
(7, 2, '202', 2),
(8, 2, '203', 3),
(9, 2, '204', 2),
(10, 3, '301', 2),
(11, 3, '302', 2),
(12, 3, '303', 2),
(13, 4, '401', 2),
(14, 4, '402', 3),
(15, 5, '501', 2),
(16, 5, '502', 2),
(17, 5, '503', 3);

-- Sample Students
INSERT INTO Students (student_id, student_name, department_id, hostel_id, mess_id, contact_number, email, date_of_birth, gender, address, admission_year, status) VALUES
(2021001, 'Rahul Sharma', 1, 1, 1, '9876543220', 'rahul.sharma@iitjammu.ac.in', '2003-05-15', 'Male', 'Delhi, India', 2021, 'Active'),
(2021002, 'Priya Patel', 1, 3, 1, '9876543221', 'priya.patel@iitjammu.ac.in', '2003-07-20', 'Female', 'Mumbai, India', 2021, 'Active'),
(2021003, 'Amit Kumar', 2, 2, 2, '9876543222', 'amit.kumar@iitjammu.ac.in', '2003-03-10', 'Male', 'Bangalore, India', 2021, 'Active'),
(2021004, 'Neha Singh', 3, 4, 3, '9876543223', 'neha.singh@iitjammu.ac.in', '2003-09-12', 'Female', 'Kolkata, India', 2021, 'Active'),
(2021005, 'Rohit Gupta', 4, 5, 1, '9876543224', 'rohit.gupta@iitjammu.ac.in', '2003-02-28', 'Male', 'Pune, India', 2021, 'Active'),
(2022001, 'Sneha Singh', 1, 3, 1, '9876543225', 'sneha.singh@iitjammu.ac.in', '2004-08-25', 'Female', 'Pune, India', 2022, 'Active'),
(2022002, 'Vikram Mehta', 3, 2, 2, '9876543226', 'vikram.mehta@iitjammu.ac.in', '2004-01-30', 'Male', 'Chennai, India', 2022, 'Active'),
(2022003, 'Kavya Reddy', 2, 4, 3, '9876543227', 'kavya.reddy@iitjammu.ac.in', '2004-06-15', 'Female', 'Hyderabad, India', 2022, 'Active'),
(2022004, 'Arjun Yadav', 5, 1, 1, '9876543228', 'arjun.yadav@iitjammu.ac.in', '2004-11-08', 'Male', 'Lucknow, India', 2022, 'Active'),
(2022005, 'Pooja Kumari', 6, 5, 2, '9876543229', 'pooja.kumari@iitjammu.ac.in', '2004-04-22', 'Female', 'Patna, India', 2022, 'Active'),
(2020001, 'Ananya Reddy', 2, 3, 3, '9876543230', 'ananya.reddy@iitjammu.ac.in', '2002-11-12', 'Female', 'Hyderabad, India', 2020, 'Active'),
(2020002, 'Karan Kapoor', 4, 1, 1, '9876543231', 'karan.kapoor@iitjammu.ac.in', '2002-09-05', 'Male', 'Kolkata, India', 2020, 'Active'),
(2020003, 'Divya Agarwal', 7, 4, 2, '9876543232', 'divya.agarwal@iitjammu.ac.in', '2002-12-18', 'Female', 'Jaipur, India', 2020, 'Active'),
(2023001, 'Aman Verma', 8, 2, 3, '9876543233', 'aman.verma@iitjammu.ac.in', '2005-03-10', 'Male', 'Chandigarh, India', 2023, 'Active'),
(2023002, 'Riya Sharma', 9, 5, 1, '9876543234', 'riya.sharma@iitjammu.ac.in', '2005-07-14', 'Female', 'Shimla, India', 2023, 'Active'),
(2023003, 'Varun Singh', 10, 1, 2, '9876543235', 'varun.singh@iitjammu.ac.in', '2005-01-25', 'Male', 'Dehradun, India', 2023, 'Active'),
(2019001, 'Rohan Mishra', 1, NULL, NULL, '9876543236', 'rohan.mishra@iitjammu.ac.in', '2001-04-12', 'Male', 'Kanpur, India', 2019, 'Graduated'),
(2019002, 'Shreya Joshi', 2, NULL, NULL, '9876543237', 'shreya.joshi@iitjammu.ac.in', '2001-08-30', 'Female', 'Nashik, India', 2019, 'Graduated'),
(2018001, 'Abhishek Tiwari', 3, NULL, NULL, '9876543238', 'abhishek.tiwari@iitjammu.ac.in', '2000-06-18', 'Male', 'Bhopal, India', 2018, 'Graduated'),
(2024001, 'Ishita Rana', 1, 3, 1, '9876543239', 'ishita.rana@iitjammu.ac.in', '2006-05-12', 'Female', 'Manali, India', 2024, 'Active');

-- Sample Room Allocations
INSERT INTO Room_Allocations (allocation_id, student_id, room_id, start_date, end_date) VALUES
(1, 2021001, 1, '2021-08-01', NULL),
(2, 2021002, 10, '2021-08-01', NULL),
(3, 2021003, 6, '2021-08-01', NULL),
(4, 2021004, 13, '2021-08-01', NULL),
(5, 2021005, 15, '2021-08-01', NULL),
(6, 2022001, 11, '2022-08-01', NULL),
(7, 2022002, 7, '2022-08-01', NULL),
(8, 2022003, 14, '2022-08-01', NULL),
(9, 2022004, 2, '2022-08-01', NULL),
(10, 2022005, 16, '2022-08-01', NULL),
(11, 2020001, 12, '2020-08-01', NULL),
(12, 2020002, 3, '2020-08-01', NULL),
(13, 2020003, 14, '2020-08-01', NULL),
(14, 2023001, 8, '2023-08-01', NULL),
(15, 2023002, 17, '2023-08-01', NULL),
(16, 2023003, 4, '2023-08-01', NULL),
(17, 2024001, 12, '2024-08-01', NULL);

-- Sample Mess Subscriptions
INSERT INTO Mess_Subscriptions (subscription_id, student_id, mess_id, start_date, end_date) VALUES
(1, 2021001, 1, '2021-08-01', NULL),
(2, 2021002, 1, '2021-08-01', NULL),
(3, 2021003, 2, '2021-08-01', NULL),
(4, 2021004, 3, '2021-08-01', NULL),
(5, 2021005, 1, '2021-08-01', NULL),
(6, 2022001, 1, '2022-08-01', NULL),
(7, 2022002, 2, '2022-08-01', NULL),
(8, 2022003, 3, '2022-08-01', NULL),
(9, 2022004, 1, '2022-08-01', NULL),
(10, 2022005, 2, '2022-08-01', NULL),
(11, 2020001, 3, '2020-08-01', NULL),
(12, 2020002, 1, '2020-08-01', NULL),
(13, 2020003, 2, '2020-08-01', NULL),
(14, 2023001, 3, '2023-08-01', NULL),
(15, 2023002, 1, '2023-08-01', NULL),
(16, 2023003, 2, '2023-08-01', NULL),
(17, 2024001, 1, '2024-08-01', NULL);

-- Sample Organizations
INSERT INTO Organizations (org_id, org_name, org_type, category, faculty_coordinator_id, coordinator_id, secretary_id, head_id, parent_org_id, budget, coach_name, coach_contact, description) VALUES
(1, 'Coding Club', 'Club', 'Technical', 1, 2021001, 2021002, 1, NULL, 50000.00, NULL, NULL, 'Programming and competitive coding'),
(2, 'Drama Club', 'Club', 'Cultural', 2, 2022001, 2021003, 2, NULL, 75000.00, NULL, NULL, 'Theater and performing arts'),
(3, 'Cricket Team', 'Sports', 'Sports', 3, 2021003, 2022002, 3, NULL, 100000.00, 'Coach Ramesh', '9876543250', 'College cricket team'),
(4, 'IEEE Student Chapter', 'Society', 'Technical', 1, 2020001, 2021001, 1, NULL, 60000.00, NULL, NULL, 'IEEE technical society'),
(5, 'Photography Club', 'Club', 'Cultural', 7, 2022003, 2023001, 7, NULL, 30000.00, NULL, NULL, 'Photography and visual arts'),
(6, 'Robotics Club', 'Club', 'Technical', 8, 2021004, 2022004, 8, NULL, 80000.00, NULL, NULL, 'Robotics and automation'),
(7, 'Football Team', 'Sports', 'Sports', 9, 2020002, 2021005, 9, NULL, 90000.00, 'Coach Suresh', '9876543251', 'College football team'),
(8, 'Music Society', 'Society', 'Cultural', 6, 2022005, 2023002, 6, NULL, 45000.00, NULL, NULL, 'Music and cultural events'),
(9, 'Debate Society', 'Society', 'Cultural', 5, 2020003, 2023003, 5, NULL, 25000.00, NULL, NULL, 'Debates and public speaking'),
(10, 'Basketball Team', 'Sports', 'Sports', 4, 2021002, 2024001, 4, NULL, 70000.00, 'Coach Priya', '9876543252', 'College basketball team');

-- Sample Memberships
INSERT INTO Memberships (membership_id, student_id, org_id, role, join_date, end_date) VALUES
(1, 2021001, 1, 'Coordinator', '2023-01-01', NULL),
(2, 2021002, 1, 'Secretary', '2023-01-01', NULL),
(3, 2022001, 2, 'Coordinator', '2023-06-01', NULL),
(4, 2021003, 3, 'Captain', '2022-08-01', NULL),
(5, 2022002, 3, 'Vice Captain', '2023-01-01', NULL),
(6, 2020001, 4, 'President', '2022-01-01', NULL),
(7, 2022003, 5, 'Coordinator', '2023-08-01', NULL),
(8, 2021004, 6, 'Coordinator', '2022-08-01', NULL),
(9, 2020002, 7, 'Captain', '2021-08-01', NULL),
(10, 2022005, 8, 'Secretary', '2023-08-01', NULL),
(11, 2020003, 9, 'President', '2021-08-01', NULL),
(12, 2021002, 10, 'Captain', '2022-01-01', NULL),
(13, 2023001, 1, 'Member', '2023-08-01', NULL),
(14, 2023002, 2, 'Member', '2023-08-01', NULL),
(15, 2023003, 4, 'Member', '2023-08-01', NULL),
(16, 2024001, 5, 'Member', '2024-08-01', NULL),
(17, 2021005, 7, 'Member', '2022-01-01', NULL),
(18, 2022004, 6, 'Member', '2022-08-01', NULL);

-- Sample Events
INSERT INTO Events (event_id, event_name, event_type, organizing_org_id, event_date, venue, event_level, description, budget) VALUES
(1, 'TechFest 2024', 'Technical', 1, '2024-03-15', 'Main Auditorium', 'Inter-College', 'Annual technical festival', 200000.00),
(2, 'CodeWars Competition', 'Technical', 1, '2024-02-20', 'Computer Lab', 'Intra-College', 'Programming competition', 25000.00),
(3, 'Cultural Night', 'Cultural', 2, '2024-04-10', 'Open Theatre', 'Intra-College', 'Cultural performances', 150000.00),
(4, 'Inter-IIT Cricket', 'Sports', 3, '2024-12-05', 'Sports Complex', 'National', 'Cricket tournament', 500000.00),
(5, 'Photography Workshop', 'Workshop', 5, '2024-01-25', 'Art Studio', 'Intra-College', 'Photography techniques workshop', 15000.00),
(6, 'Robotics Competition', 'Technical', 6, '2024-11-15', 'Engineering Lab', 'Inter-College', 'Robot building competition', 100000.00),
(7, 'Annual Football Tournament', 'Sports', 7, '2024-10-20', 'Football Ground', 'Inter-College', 'Football championship', 80000.00),
(8, 'Classical Music Concert', 'Cultural', 8, '2024-09-12', 'Auditorium', 'Intra-College', 'Classical music performances', 40000.00),
(9, 'National Debate Championship', 'Cultural', 9, '2024-08-18', 'Conference Hall', 'National', 'Debate competition', 60000.00),
(10, 'Basketball League', 'Sports', 10, '2024-07-22', 'Basketball Court', 'Intra-College', 'Basketball tournament', 35000.00),
(11, 'AI/ML Workshop', 'Technical', 4, '2024-06-10', 'Computer Lab', 'Inter-College', 'Machine Learning workshop', 45000.00),
(12, 'Drama Festival', 'Cultural', 2, '2024-05-14', 'Open Theatre', 'Inter-College', 'Drama performances', 70000.00);

-- Sample Event Participation
INSERT INTO Event_Participation (participation_id, event_id, student_id, role, position_secured, medal, certificate_issued) VALUES
(1, 2, 2021001, 'Participant', '1st Place', 'Gold', TRUE),
(2, 2, 2021002, 'Participant', '3rd Place', 'Bronze', TRUE),
(3, 2, 2022001, 'Organizer', NULL, NULL, TRUE),
(4, 3, 2022001, 'Organizer', NULL, NULL, TRUE),
(5, 4, 2021003, 'Participant', '2nd Place', 'Silver', TRUE),
(6, 5, 2022003, 'Organizer', NULL, NULL, TRUE),
(7, 6, 2021004, 'Participant', '1st Place', 'Gold', TRUE),
(8, 7, 2020002, 'Participant', '1st Place', 'Gold', TRUE),
(9, 8, 2022005, 'Organizer', NULL, NULL, TRUE),
(10, 9, 2020003, 'Participant', '2nd Place', 'Silver', TRUE),
(11, 10, 2021002, 'Participant', '3rd Place', 'Bronze', TRUE),
(12, 11, 2020001, 'Organizer', NULL, NULL, TRUE),
(13, 12, 2023002, 'Participant', '1st Place', 'Gold', TRUE),
(14, 1, 2023001, 'Participant', NULL, NULL, TRUE),
(15, 1, 2023003, 'Participant', NULL, NULL, TRUE);

-- Sample Placements
INSERT INTO Placements (placement_id, student_id, company_name, role_offered, package_offered, placement_type, placement_date, status) VALUES
(1, 2019001, 'Google India', 'Software Engineer', 2500000.00, 'Full-Time', '2023-12-15', 'Placed'),
(2, 2019002, 'Microsoft', 'SDE-2', 3000000.00, 'Full-Time', '2024-01-20', 'Placed'),
(3, 2018001, 'Amazon', 'Senior SDE', 3500000.00, 'Full-Time', '2022-11-10', 'Placed'),
(4, 2021001, 'Amazon', 'SDE Intern', 100000.00, 'Internship', '2024-05-01', 'Placed'),
(5, 2021002, 'Flipkart', 'Software Engineer', 1800000.00, 'Full-Time', '2024-11-10', 'Placed'),
(6, 2021003, 'TCS', 'Systems Engineer', 800000.00, 'Full-Time', '2024-09-15', 'Placed'),
(7, 2020001, 'Infosys', 'Software Developer', 900000.00, 'Full-Time', '2024-08-20', 'Placed'),
(8, 2020002, 'Wipro', 'Project Engineer', 850000.00, 'Full-Time', '2024-10-05', 'Placed'),
(9, 2021004, 'L&T', 'Graduate Engineer', 1200000.00, 'Full-Time', '2024-07-12', 'Placed'),
(10, 2021005, 'Accenture', 'Associate Software Engineer', 950000.00, 'Full-Time', '2024-08-30', 'Placed'),
(11, 2022001, 'Google', 'SDE Intern', 120000.00, 'Internship', '2024-06-01', 'Placed'),
(12, 2022002, 'Microsoft', 'SDE Intern', 110000.00, 'Internship', '2024-06-15', 'Placed'),
(13, 2020003, 'Adobe', 'Software Engineer', 2200000.00, 'Full-Time', '2024-03-18', 'Placed');

-- Sample Recruiters
INSERT INTO Recruiters (recruiter_id, company_name, industry_type, contact_person, contact_email, contact_number) VALUES
(1, 'Google India', 'Technology', 'HR Manager', 'recruit@google.com', '9876543240'),
(2, 'Microsoft', 'Technology', 'Talent Acquisition', 'careers@microsoft.com', '9876543241'),
(3, 'Amazon', 'E-Commerce/Tech', 'Campus Relations', 'campus@amazon.com', '9876543242'),
(4, 'Flipkart', 'E-Commerce', 'HR Team', 'placement@flipkart.com', '9876543243'),
(5, 'TCS', 'IT Services', 'Campus Coordinator', 'recruitment@tcs.com', '9876543244'),
(6, 'Infosys', 'IT Services', 'Campus Relations', 'campushiring@infosys.com', '9876543245'),
(7, 'Wipro', 'IT Services', 'Talent Acquisition', 'campusrecruitment@wipro.com', '9876543246'),
(8, 'L&T', 'Engineering/Construction', 'HR Manager', 'careers@lnt.com', '9876543247'),
(9, 'Accenture', 'Consulting/Technology', 'Campus Hiring', 'campushiring@accenture.com', '9876543248'),
(10, 'Adobe', 'Software', 'University Relations', 'universityrelations@adobe.com', '9876543249');

-- Sample Payments
INSERT INTO Payments (payment_id, student_id, payment_type, amount, payment_date, payment_status, transaction_id) VALUES
(1, 2021001, 'Hostel Fee', 25000.00, '2024-01-15', 'Completed', 'TXN001'),
(2, 2021001, 'Mess Fee', 15000.00, '2024-01-15', 'Completed', 'TXN002'),
(3, 2021002, 'Hostel Fee', 25000.00, '2024-01-16', 'Completed', 'TXN003'),
(4, 2022001, 'Event Fee', 500.00, '2024-02-10', 'Completed', 'TXN004'),
(5, 2021003, 'Mess Fee', 15000.00, '2024-01-20', 'Pending', 'TXN005'),
(6, 2021004, 'Hostel Fee', 25000.00, '2024-01-18', 'Completed', 'TXN006'),
(7, 2021005, 'Mess Fee', 15000.00, '2024-01-22', 'Completed', 'TXN007'),
(8, 2022002, 'Other', 2000.00, '2024-02-01', 'Completed', 'TXN008'),
(9, 2022003, 'Hostel Fee', 25000.00, '2024-01-25', 'Completed', 'TXN009'),
(10, 2022004, 'Mess Fee', 15000.00, '2024-01-28', 'Pending', 'TXN010'),
(11, 2022005, 'Event Fee', 1000.00, '2024-02-05', 'Completed', 'TXN011'),
(12, 2020001, 'Other', 500.00, '2024-01-30', 'Completed', 'TXN012'),
(13, 2020002, 'Other', 1500.00, '2024-02-02', 'Completed', 'TXN013'),
(14, 2020003, 'Hostel Fee', 25000.00, '2024-01-12', 'Completed', 'TXN014'),
(15, 2023001, 'Other', 2000.00, '2024-01-08', 'Completed', 'TXN015'),
(16, 2023002, 'Mess Fee', 15000.00, '2024-01-10', 'Pending', 'TXN016'),
(17, 2023003, 'Hostel Fee', 25000.00, '2024-01-14', 'Completed', 'TXN017'),
(18, 2024001, 'Other', 2000.00, '2024-08-01', 'Completed', 'TXN018'),
(19, 2024001, 'Hostel Fee', 25000.00, '2024-08-01', 'Completed', 'TXN019'),
(20, 2024001, 'Mess Fee', 15000.00, '2024-08-01', 'Completed', 'TXN020');

-- Sample Disciplinary Actions
INSERT INTO Disciplinary_Actions (action_id, student_id, incident_date, description, action_taken, fine_amount, severity, recorded_by, status) VALUES
(1, 2022002, '2024-01-10', 'Late night disturbance in hostel', 'Written warning issued', 500.00, 'Minor', 4, 'Closed'),
(2, 2021003, '2024-02-05', 'Unauthorized absence from hostel', 'Fine imposed', 1000.00, 'Minor', 4, 'Active'),
(3, 2023001, '2024-02-15', 'Mess hall misconduct', 'Verbal warning', 0.00, 'Minor', 5, 'Closed'),
(4, 2022004, '2024-01-28', 'Violation of hostel curfew', 'Fine imposed', 750.00, 'Minor', 10, 'Active'),
(5, 2021005, '2024-02-20', 'Damage to hostel property', 'Compensation required', 2000.00, 'Major', 4, 'Active');

-- Sample Feedback
INSERT INTO Feedback_System (feedback_id, student_id, category, reference_id, feedback_text, rating, feedback_date) VALUES
(1, 2021001, 'Mess', 1, 'Food quality is good but variety can be improved', 4, '2024-01-20'),
(2, 2021002, 'Hostel', 1, 'Excellent facilities and maintenance', 5, '2024-01-25'),
(3, 2022001, 'Event', 2, 'Well organized coding competition', 5, '2024-02-21'),
(4, 2021003, 'Mess', 2, 'Need more vegetarian options', 3, '2024-02-01'),
(5, 2022003, 'Hostel', 4, 'Room cleanliness could be better', 3, '2024-02-10'),
(6, 2020001, 'Event', 1, 'Great technical festival with good speakers', 5, '2024-03-16'),
(7, 2022005, 'Mess', 3, 'South mess has excellent breakfast options', 4, '2024-02-12'),
(8, 2021004, 'Hostel', 5, 'Very good security arrangements', 4, '2024-02-08'),
(9, 2023002, 'Event', 8, 'Music concert was well organized', 5, '2024-09-13'),
(10, 2020002, 'Event', 7, 'Football tournament was competitive and fun', 4, '2024-10-21'),
(11, 2021002, 'Event', 10, 'Basketball league needs better scheduling', 3, '2024-07-23'),
(12, 2022002, 'Hostel', 2, 'Wi-Fi connectivity issues in some rooms', 2, '2024-02-18');

-- Sample Alumni
INSERT INTO Alumni (alumni_id, student_id, graduation_year, current_position, company_name, location, linkedin_url, email) VALUES
(1, 2019001, 2023, 'Software Engineer', 'Google India', 'Bangalore, India', 'https://linkedin.com/in/rohanmishra', 'rohan.mishra.alumni@iitjammu.ac.in'),
(2, 2019002, 2023, 'SDE-2', 'Microsoft', 'Hyderabad, India', 'https://linkedin.com/in/shreyajoshi', 'shreya.joshi.alumni@iitjammu.ac.in'),
(3, 2018001, 2022, 'Senior Software Engineer', 'Amazon', 'Seattle, USA', 'https://linkedin.com/in/abhishektiwari', 'abhishek.tiwari.alumni@iitjammu.ac.in');

-- Sample Networking
INSERT INTO Networking (connection_id, alumni_id, student_id, connection_type, initiated_date, status) VALUES
(1, 1, 2021001, 'Mentorship', '2024-01-15', 'Active'),
(2, 1, 2022001, 'Referral', '2024-02-01', 'Active'),
(3, 2, 2021002, 'Mentorship', '2024-01-20', 'Active'),
(4, 3, 2020001, 'Mentorship', '2024-01-10', 'Active'),
(5, 2, 2022003, 'Collaboration', '2024-02-15', 'Active'),
(6, 1, 2023001, 'Mentorship', '2024-02-20', 'Active'),
(7, 3, 2021004, 'Collaboration', '2024-01-25', 'Active');

-- Display summary
SELECT 'Database populated with enhanced sample data successfully!' as Status;
SELECT COUNT(*) as Total_Students FROM Students;
SELECT COUNT(*) as Total_Departments FROM Departments;
SELECT COUNT(*) as Total_Staff FROM Staff;
SELECT COUNT(*) as Total_Events FROM Events;
SELECT COUNT(*) as Total_Organizations FROM Organizations;
SELECT COUNT(*) as Total_Placements FROM Placements;
SELECT COUNT(*) as Total_Payments FROM Payments;
SELECT COUNT(*) as Total_Hostels FROM Hostels;
SELECT COUNT(*) as Total_Rooms FROM Rooms;

-- Show some statistics
SELECT 'Current Statistics:' as Info;
SELECT 
  status, 
  COUNT(*) as student_count 
FROM Students 
GROUP BY status;

SELECT 
  d.department_name, 
  COUNT(s.student_id) as student_count 
FROM Departments d 
LEFT JOIN Students s ON d.department_id = s.department_id 
GROUP BY d.department_id, d.department_name 
ORDER BY student_count DESC;
