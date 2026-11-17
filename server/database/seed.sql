-- ====================================================================
-- Campus Connect - Seed Data (2-Role Architecture: Student, Admin)
-- Passwords:
-- Admin: admin@campusconnect.edu / Admin@123
-- Students: arjun.sharma@campusconnect.edu / Student@123
--           priya.patel@campusconnect.edu / Student@123
--           rohit.verma@campusconnect.edu / Student@123
--           sneha.reddy@campusconnect.edu / Student@123
-- ====================================================================

USE campus_connect;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Departments
INSERT INTO departments (id, name, code, description, contact_email, contact_phone) VALUES
(1, 'IT & Network Services', 'IT', 'Campus networking, Wi-Fi infrastructure, servers, and computer labs', 'it.dept@campusconnect.edu', '+91 98765 43210'),
(2, 'Electrical Maintenance', 'ELEC', 'Power grids, electrical wiring, classroom fans, lighting, and UPS systems', 'elec.dept@campusconnect.edu', '+91 98765 43211'),
(3, 'Plumbing & Water Works', 'PLUMB', 'Drinking water RO plants, laboratory sinks, washrooms, and piping maintenance', 'plumbing.dept@campusconnect.edu', '+91 98765 43212'),
(4, 'Civil & Infrastructure', 'CIVIL', 'Building structures, classrooms, furniture, desks, doors, and auditoriums', 'estate.dept@campusconnect.edu', '+91 98765 43213'),
(5, 'Technical Equipment & AV', 'TECH_AV', 'Projectors, digital podiums, sound systems, and laboratory PCs', 'av.dept@campusconnect.edu', '+91 98765 43214');

-- 2. Users (Admin and Students)
-- Passwords:
-- Admin@123   -> $2a$10$I3bVHUXXB7J7VOuiaEQlHOHdxXyetILMKzjFI4VV/HhGjC9WSzfjW
-- Student@123 -> $2a$10$jeGick.P.Uc7L4WPr4/9yeHpIgO5XokoZ0VH/Q0DpL4JrHbJ9qZey
INSERT INTO users (id, name, email, password, role, phone, avatar, status) VALUES
(1, 'System Administrator', 'admin@campusconnect.edu', '$2a$10$I3bVHUXXB7J7VOuiaEQlHOHdxXyetILMKzjFI4VV/HhGjC9WSzfjW', 'admin', '+91 90000 00001', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'active'),
(2, 'Arjun Sharma', 'arjun.sharma@campusconnect.edu', '$2a$10$jeGick.P.Uc7L4WPr4/9yeHpIgO5XokoZ0VH/Q0DpL4JrHbJ9qZey', 'student', '+91 98888 11111', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', 'active'),
(3, 'Priya Patel', 'priya.patel@campusconnect.edu', '$2a$10$jeGick.P.Uc7L4WPr4/9yeHpIgO5XokoZ0VH/Q0DpL4JrHbJ9qZey', 'student', '+91 98888 22222', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'active'),
(4, 'Rohit Verma', 'rohit.verma@campusconnect.edu', '$2a$10$jeGick.P.Uc7L4WPr4/9yeHpIgO5XokoZ0VH/Q0DpL4JrHbJ9qZey', 'student', '+91 98888 33333', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150', 'active'),
(5, 'Sneha Reddy', 'sneha.reddy@campusconnect.edu', '$2a$10$jeGick.P.Uc7L4WPr4/9yeHpIgO5XokoZ0VH/Q0DpL4JrHbJ9qZey', 'student', '+91 98888 44444', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', 'active');

-- 3. Student Profiles
INSERT INTO student_profiles (id, user_id, roll_number, department, branch, academic_year, semester, skills, interests, bio) VALUES
(1, 2, '22CS1045', 'Computer Science & Engineering', 'CSE', 3, 5, 
 '["JavaScript", "React", "Node.js", "Python", "SQL", "Git", "Tailwind CSS"]', 
 '["Web Development", "Artificial Intelligence", "Hackathons", "Open Source"]', 
 'Third-year CSE student passionate about full-stack web applications and participating in national hackathons.'),

(2, 3, '23IT2012', 'Information Technology', 'IT', 2, 3, 
 '["Python", "Cloud Computing", "Cybersecurity", "Docker", "Linux"]', 
 '["Cloud Computing", "Cybersecurity", "Competitive Programming", "DevOps"]', 
 'Sophomore IT undergraduate exploring cloud architectures, containerization, and ethical hacking.'),

(3, 4, '21EC3088', 'Electronics & Communication', 'ECE', 4, 7, 
 '["Embedded Systems", "C++", "IoT", "Arduino", "Robotics", "MATLAB"]', 
 '["Robotics", "Hardware Hackathons", "IoT Solutions", "Automation"]', 
 'Final-year ECE major working on connected smart campus sensors and embedded robotics.'),

(4, 5, '22CS1092', 'Computer Science & Engineering', 'CSE', 3, 5, 
 '["Python", "Machine Learning", "PyTorch", "Data Science", "SQL", "Tableau"]', 
 '["Artificial Intelligence", "Machine Learning", "Data Analytics", "Research Opportunities"]', 
 'Junior student focusing on deep learning research, computer vision, and academic paper publications.');

-- 4. Opportunity Categories
INSERT INTO opportunity_categories (id, name, slug, icon, description) VALUES
(1, 'Hackathons', 'hackathons', 'Code', 'Competitive programming and software building marathons with cash prizes and hiring opportunities'),
(2, 'Internships', 'internships', 'Briefcase', 'Paid industry and research summer/winter internship openings for students'),
(3, 'Workshops', 'workshops', 'BookOpen', 'Hands-on technical bootcamps, masterclasses, and certified skill workshops'),
(4, 'Competitions', 'competitions', 'Trophy', 'Inter-college technical quizzes, paper presentations, and project expos'),
(5, 'Scholarships', 'scholarships', 'GraduationCap', 'Merit-cum-means and corporate diversity engineering scholarships'),
(6, 'Research Opportunities', 'research', 'FlaskConical', 'Faculty-led research fellowships, lab assistantships, and conference grants'),
(7, 'Coding Contests', 'coding-contests', 'Terminal', 'Algorithmic contests, weekly speed coding, and competitive rankings'),
(8, 'College Events', 'college-events', 'Calendar', 'Campus technical fests, guest expert lectures, and cultural clubs');

-- 5. Opportunities
INSERT INTO opportunities (id, title, description, category_id, opportunity_type, organization_name, eligible_branches, eligible_academic_years, required_skills, mode, location, registration_link, application_deadline, eligibility_requirements, stipend_or_prize, posted_by, is_active, view_count) VALUES
(1, 'Smart India Campus Hackathon 2026', 
 'A premier 36-hour national level hackathon where student teams develop cutting-edge web, mobile, and AI solutions for smart city and campus automation problems. Top teams get direct interview opportunities and grant funding.',
 1, 'Hackathon', 'Ministry of Education Innovation Cell', 
 '["CSE", "IT", "ECE"]', '[2, 3, 4]', '["React", "Node.js", "Python", "SQL", "Git"]', 
 'Hybrid', 'Main Auditorium & Online', 'https://innovation.gov.in/hackathon2026', 
 DATE_ADD(CURRENT_DATE, INTERVAL 12 DAY), 
 'Teams of 3-4 members. CSE/IT/ECE 2nd to 4th year students with active student ID.', 
 '₹2,50,000 Cash Pool + Incubation', 1, TRUE, 142),

(2, 'Google Cloud Summer Engineering Internship', 
 'Join the Google Cloud Engineering team as a Software Engineer Intern for 10-12 weeks during Summer 2027. You will design, build, and deploy high-performance microservices and cloud tooling.',
 2, 'Internship', 'Google India', 
 '["CSE", "IT"]', '[3]', '["Python", "Node.js", "Cloud Computing", "Docker", "SQL"]', 
 'Hybrid', 'Bengaluru / Hyderabad', 'https://careers.google.com/students/cloud-intern', 
 DATE_ADD(CURRENT_DATE, INTERVAL 6 DAY), 
 'Currently enrolled in 3rd year Bachelor of Technology in CSE or IT. Minimum CGPA of 8.0 with strong foundations in Data Structures and Algorithms.', 
 '₹1,10,000 / month + Relocation', 1, TRUE, 389),

(3, 'IEEE Advanced Robotics & Autonomous Systems Workshop', 
 'A 3-day rigorous practical workshop on ROS2 (Robot Operating System), LiDAR sensor fusion, and autonomous path planning using NVIDIA Jetson boards. Certificate of completion issued by IEEE Robotics Society.',
 3, 'Workshop', 'IEEE Robotics & Automation Society', 
 '["ECE", "MECH", "CSE"]', '[2, 3, 4]', '["C++", "Embedded Systems", "IoT", "Robotics"]', 
 'Offline', 'Robotics Lab 301, Block B', 'https://ieee-ras.org/workshops/autonomous2026', 
 DATE_ADD(CURRENT_DATE, INTERVAL 4 DAY), 
 'Open to ECE, MECH, and CSE students with basic familiarity in C++ and electronics.', 
 'IEEE Official Certificate + Hardware Kit', 1, TRUE, 95),

(4, 'CodeSprint National Algorithmic Challenge', 
 '5-hour individual competitive programming contest featuring 6 algorithmic problems ranging from dynamic programming, graphs, to number theory. Fast track interview referrals to tier-1 tech firms.',
 7, 'Coding Contest', 'CodeNation & TechGig', 
 '["ALL"]', '[1, 2, 3, 4]', '["Python", "C++", "Java", "SQL"]', 
 'Online', 'Virtual Platform', 'https://techgig.com/codesprint2026', 
 DATE_ADD(CURRENT_DATE, INTERVAL 18 DAY), 
 'Open to all undergraduate branches and years. Must have an active competitive programming profile.', 
 'MacBook Pro + ₹1,00,000 Cash', 1, TRUE, 260),

(5, 'Microsoft Security Research & Threat Hunting Internship', 
 'Work alongside Microsoft Defender security researchers analyzing malware telemetry, reverse engineering exploits, and building cloud-native intrusion detection models.',
 2, 'Internship', 'Microsoft Security India', 
 '["CSE", "IT"]', '[3, 4]', '["Cybersecurity", "Python", "Linux", "Cloud Computing"]', 
 'Online', 'Remote / Hyderabad', 'https://careers.microsoft.com/students/security', 
 DATE_ADD(CURRENT_DATE, INTERVAL 9 DAY), 
 '3rd or 4th year CSE/IT students with demonstrated interest in network security, operating system internals, and threat analysis.', 
 '₹95,000 / month Stipend', 1, TRUE, 178),

(6, 'Reliance Foundation Undergraduate STEM Scholarship', 
 'Scholarship program awarding up to ₹2,00,000 per academic year to meritorious undergraduate students enrolled in engineering and STEM fields, along with industry mentorship.',
 5, 'Scholarship', 'Reliance Foundation', 
 '["ALL"]', '[1, 2, 3, 4]', '["Git", "SQL"]', 
 'Online', 'Pan-India', 'https://reliancefoundation.org/stem-scholarship', 
 DATE_ADD(CURRENT_DATE, INTERVAL 25 DAY), 
 'Indian national enrolled full-time in accredited B.E./B.Tech degree. First class academic record (CGPA >= 7.5).', 
 '₹2,00,000 / year Financial Grant', 1, TRUE, 310),

(7, 'AI Research Fellowship: Computer Vision in Healthcare', 
 'Funded academic research assistantship under the Center of Artificial Intelligence. Selected fellows will collaborate on multimodal deep learning models for radiological scan anomaly detection.',
 6, 'Research Opportunities', 'AI Research Lab & AIIMS Collaboration', 
 '["CSE", "IT"]', '[3, 4]', '["Python", "Machine Learning", "PyTorch", "Data Science"]', 
 'Offline', 'High Performance Computing Lab, Room 410', 'https://campusconnect.edu/research/ai-vision', 
 DATE_ADD(CURRENT_DATE, INTERVAL 15 DAY), 
 'Open to 3rd and 4th year CSE/IT undergraduates with prior coursework in Machine Learning or Deep Learning.', 
 '₹25,000 / month Research Stipend + Co-authorship', 1, TRUE, 134),

(8, 'Campus TechSummit 2026: GenAI & Web3 Innovation Expo', 
 'The flagship annual technical fest of the college featuring student project demonstrations, venture pitch battles, live CTF hacking challenges, and keynote speeches from startup founders.',
 8, 'College Event', 'Campus Student Technical Council', 
 '["ALL"]', '[1, 2, 3, 4]', '["Web Development", "UI/UX", "Git"]', 
 'Offline', 'Campus Central Grounds & Auditorium', 'https://techsummit.campusconnect.edu', 
 DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY), 
 'All college students, staff, and registered guest delegates.', 
 'Trophies, Goodies & Startup Grants', 1, TRUE, 520);

-- 6. Saved Opportunities
INSERT INTO saved_opportunities (student_id, opportunity_id) VALUES
(2, 1),
(2, 2),
(2, 7),
(3, 2),
(3, 5);

-- 7. Issue Categories & Keyword Mappings
INSERT INTO issue_categories (id, name, code, keywords, description, default_department_id, default_priority) VALUES
(1, 'IT / Network', 'IT_NET', 
 '["wifi", "wi-fi", "internet", "network", "lan", "ethernet", "router", "bandwidth", "connection", "ip", "dns", "firewall", "gateway", "hotspot", "signal", "offline", "disconnect"]', 
 'Issues relating to campus Wi-Fi connectivity, LAN ports, network speed, and router hardware.', 1, 'HIGH'),

(2, 'Technical Equipment', 'TECH_EQUIP', 
 '["projector", "computer", "pc", "monitor", "cpu", "keyboard", "mouse", "screen", "display", "audio", "mic", "microphone", "speaker", "hdmi", "podium", "ups", "cable"]', 
 'Malfunctioning projectors, lab desktop machines, presentation screens, and audio-visual podiums.', 5, 'MEDIUM'),

(3, 'Electrical', 'ELECTRICAL', 
 '["light", "tube", "fan", "electricity", "socket", "power", "switch", "ac", "air conditioner", "voltage", "short circuit", "mcb", "spark", "blackout", "shock", "generator"]', 
 'Classroom lighting, fans, electrical switches, air conditioning, and power hazards.', 2, 'HIGH'),

(4, 'Plumbing', 'PLUMBING', 
 '["water", "tap", "leakage", "pipe", "washroom", "toilet", "sink", "drainage", "flush", "restroom", "ro", "cooler", "overflow", "basin"]', 
 'Water leakage, broken taps, washroom sanitation problems, drinking water coolers, and clogged drainage.', 3, 'MEDIUM'),

(5, 'Infrastructure', 'INFRA', 
 '["desk", "chair", "bench", "furniture", "door", "window", "board", "whiteboard", "tile", "ceiling", "lock", "handle", "wall", "plaster", "crack"]', 
 'Damaged benches, broken chairs, damaged classroom doors, whiteboard, and furniture repairs.', 4, 'LOW');

-- 8. Complaints (Statuses: 'Pending', 'Assigned', 'In Progress', 'Resolved')
INSERT INTO complaints (id, complaint_number, student_id, title, description, campus_location, room_number, category_id, department_id, priority, status, is_duplicate, parent_complaint_id, affected_student_count, image_url, resolution_notes, resolved_at, created_at) VALUES
(1, 'CMP-2026-0001', 2, 'Wi-Fi not working in Lab 4', 
 'The Wi-Fi access point in Computer Lab 4 has been dropping connection continuously for 2 hours. Students cannot connect to academic servers or run practical lab tasks.',
 'Tech Tower', 'Lab 4', 1, 1, 'HIGH', 'In Progress', FALSE, NULL, 3, 
 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500', 
 'Technician assigned to reboot Cisco Catalyst switch and replace Ethernet patch cord.', NULL, DATE_SUB(NOW(), INTERVAL 2 DAY)),

(2, 'CMP-2026-0002', 3, 'Projector malfunctioning in Classroom 203', 
 'The ceiling mounted Epson projector in Classroom 203 blinks red light and shuts down after 5 minutes of operation. Display flickers with yellow tint during lectures.',
 'Academic Block A', 'Classroom 203', 2, 5, 'MEDIUM', 'Assigned', FALSE, NULL, 1, 
 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500', 
 'Routed to Technical Equipment & AV department for lamp inspection.', NULL, DATE_SUB(NOW(), INTERVAL 1 DAY)),

(3, 'CMP-2026-0003', 4, 'Severe water pipe leakage near 2nd floor washroom', 
 'Water is leaking continuously from the ceiling pipe joint right outside the 2nd floor men washroom. Floor is slippery and water is accumulating in the corridor.',
 'Science Wing', 'Washroom 2F Corridor', 4, 3, 'HIGH', 'Resolved', FALSE, NULL, 1, 
 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=500', 
 'Pipe coupling replaced, valve pressure balanced, and floor sanitized by plumbing maintenance crew.', DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 3 DAY)),

(4, 'CMP-2026-0004', 5, 'Broken classroom bench and loose desk support', 
 'The wooden desk on row 4 seat 3 has a broken side metal support. Students cannot sit safely without the desk tilting.',
 'Academic Block A', 'Classroom 105', 5, 4, 'LOW', 'Pending', FALSE, NULL, 1, 
 NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 6 HOUR));

-- 9. Duplicate Complaint Reports (Linked to CMP-2026-0001: Wi-Fi in Lab 4)
INSERT INTO complaint_reports (id, complaint_id, student_id, reported_title, reported_description, similarity_score, status, created_at) VALUES
(1, 1, 3, 'Internet connection unavailable in Lab 4', 'Unable to load any websites on the desktop computers or Wi-Fi in Lab 4. Network adapter showing no IP address.', 92.50, 'Confirmed Duplicate', DATE_SUB(NOW(), INTERVAL 40 HOUR)),
(2, 1, 4, 'Network problem in Lab 4 during practical session', 'Wi-Fi router shows orange light and cannot ping default gateway from Lab 4. Students cannot access lab server.', 88.00, 'Confirmed Duplicate', DATE_SUB(NOW(), INTERVAL 30 HOUR));

-- 10. Complaint History
INSERT INTO complaint_history (complaint_id, changed_by, previous_status, new_status, comment, created_at) VALUES
(1, 2, NULL, 'Pending', 'Complaint submitted via Student Portal.', DATE_SUB(NOW(), INTERVAL 48 HOUR)),
(1, 1, 'Pending', 'Assigned', 'Assigned to IT & Network Services Department.', DATE_SUB(NOW(), INTERVAL 46 HOUR)),
(1, 1, 'Assigned', 'In Progress', 'Hardware diagnostics initiated on Lab 4 switch.', DATE_SUB(NOW(), INTERVAL 24 HOUR)),
(3, 4, NULL, 'Pending', 'Urgent complaint submitted regarding washroom flooding.', DATE_SUB(NOW(), INTERVAL 72 HOUR)),
(3, 1, 'Pending', 'Assigned', 'Assigned to Plumbing & Water Works with HIGH priority.', DATE_SUB(NOW(), INTERVAL 71 HOUR)),
(3, 1, 'Assigned', 'In Progress', 'Emergency plumbing isolation in progress.', DATE_SUB(NOW(), INTERVAL 48 HOUR)),
(3, 1, 'In Progress', 'Resolved', 'Pipe coupling replaced, valve pressure balanced, and floor sanitized.', DATE_SUB(NOW(), INTERVAL 3 HOUR));

-- 11. Notifications
INSERT INTO notifications (id, user_id, title, message, type, link, is_read, created_at) VALUES
(1, 2, 'Complaint Status Updated', 'Your complaint CMP-2026-0001 (Wi-Fi not working in Lab 4) is now In Progress.', 'complaint', '/complaints', FALSE, DATE_SUB(NOW(), INTERVAL 24 HOUR)),
(2, 2, 'New Opportunity Recommended', 'Smart India Campus Hackathon 2026 matches 95% of your CSE profile and interests.', 'opportunity', '/opportunities', FALSE, DATE_SUB(NOW(), INTERVAL 12 HOUR)),
(3, 4, 'Complaint Resolved', 'Your complaint CMP-2026-0003 regarding washroom water leakage has been successfully resolved.', 'complaint', '/complaints', FALSE, DATE_SUB(NOW(), INTERVAL 3 HOUR));

SET FOREIGN_KEY_CHECKS = 1;
