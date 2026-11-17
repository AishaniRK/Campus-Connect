const mysql = require('mysql2/promise');

const host = process.env.DB_HOST || '127.0.0.1';
const port = parseInt(process.env.DB_PORT || '3306', 10);
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '';
const database = process.env.DB_NAME || 'campus_connect';

let pool = null;
let isConnectedToMySQL = false;

// Fallback in-memory database storage (Student & Admin 2-role system)
const fallbackStore = {
  users: [],
  departments: [],
  student_profiles: [],
  opportunity_categories: [],
  opportunities: [],
  saved_opportunities: [],
  issue_categories: [],
  complaints: [],
  complaint_reports: [],
  complaint_history: [],
  notifications: []
};

// Preload fallback store with seed data
function seedFallbackStore() {
  fallbackStore.departments = [
    { id: 1, name: 'IT & Network Services', code: 'IT', description: 'Campus networking, Wi-Fi infrastructure, servers, and computer labs', contact_email: 'it.dept@campusconnect.edu', contact_phone: '+91 98765 43210', created_at: new Date() },
    { id: 2, name: 'Electrical Maintenance', code: 'ELEC', description: 'Power grids, electrical wiring, classroom fans, lighting, and UPS systems', contact_email: 'elec.dept@campusconnect.edu', contact_phone: '+91 98765 43211', created_at: new Date() },
    { id: 3, name: 'Plumbing & Water Works', code: 'PLUMB', description: 'Drinking water RO plants, laboratory sinks, washrooms, and piping maintenance', contact_email: 'plumbing.dept@campusconnect.edu', contact_phone: '+91 98765 43212', created_at: new Date() },
    { id: 4, name: 'Civil & Infrastructure', code: 'CIVIL', description: 'Building structures, classrooms, furniture, desks, doors, and auditoriums', contact_email: 'estate.dept@campusconnect.edu', contact_phone: '+91 98765 43213', created_at: new Date() },
    { id: 5, name: 'Technical Equipment & AV', code: 'TECH_AV', description: 'Projectors, digital podiums, sound systems, and laboratory PCs', contact_email: 'av.dept@campusconnect.edu', contact_phone: '+91 98765 43214', created_at: new Date() }
  ];

  fallbackStore.users = [
    { id: 1, name: 'System Administrator', email: 'admin@campusconnect.edu', password: '$2a$10$I3bVHUXXB7J7VOuiaEQlHOHdxXyetILMKzjFI4VV/HhGjC9WSzfjW', role: 'admin', phone: '+91 90000 00001', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', status: 'active', created_at: new Date() },
    { id: 2, name: 'Arjun Sharma', email: 'arjun.sharma@campusconnect.edu', password: '$2a$10$jeGick.P.Uc7L4WPr4/9yeHpIgO5XokoZ0VH/Q0DpL4JrHbJ9qZey', role: 'student', phone: '+91 98888 11111', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', status: 'active', created_at: new Date() },
    { id: 3, name: 'Priya Patel', email: 'priya.patel@campusconnect.edu', password: '$2a$10$jeGick.P.Uc7L4WPr4/9yeHpIgO5XokoZ0VH/Q0DpL4JrHbJ9qZey', role: 'student', phone: '+91 98888 22222', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', status: 'active', created_at: new Date() },
    { id: 4, name: 'Rohit Verma', email: 'rohit.verma@campusconnect.edu', password: '$2a$10$jeGick.P.Uc7L4WPr4/9yeHpIgO5XokoZ0VH/Q0DpL4JrHbJ9qZey', role: 'student', phone: '+91 98888 33333', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150', status: 'active', created_at: new Date() },
    { id: 5, name: 'Sneha Reddy', email: 'sneha.reddy@campusconnect.edu', password: '$2a$10$jeGick.P.Uc7L4WPr4/9yeHpIgO5XokoZ0VH/Q0DpL4JrHbJ9qZey', role: 'student', phone: '+91 98888 44444', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', status: 'active', created_at: new Date() }
  ];

  fallbackStore.student_profiles = [
    { id: 1, user_id: 2, roll_number: '22CS1045', department: 'Computer Science & Engineering', branch: 'CSE', academic_year: 3, semester: 5, skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git', 'Tailwind CSS'], interests: ['Web Development', 'Artificial Intelligence', 'Hackathons', 'Open Source'], bio: 'Third-year CSE student passionate about full-stack web applications and participating in national hackathons.' },
    { id: 2, user_id: 3, roll_number: '23IT2012', department: 'Information Technology', branch: 'IT', academic_year: 2, semester: 3, skills: ['Python', 'Cloud Computing', 'Cybersecurity', 'Docker', 'Linux'], interests: ['Cloud Computing', 'Cybersecurity', 'Competitive Programming', 'DevOps'], bio: 'Sophomore IT undergraduate exploring cloud architectures, containerization, and ethical hacking.' },
    { id: 3, user_id: 4, roll_number: '21EC3088', department: 'Electronics & Communication', branch: 'ECE', academic_year: 4, semester: 7, skills: ['Embedded Systems', 'C++', 'IoT', 'Arduino', 'Robotics', 'MATLAB'], interests: ['Robotics', 'Hardware Hackathons', 'IoT Solutions', 'Automation'], bio: 'Final-year ECE major working on connected smart campus sensors and embedded robotics.' },
    { id: 4, user_id: 5, roll_number: '22CS1092', department: 'Computer Science & Engineering', branch: 'CSE', academic_year: 3, semester: 5, skills: ['Python', 'Machine Learning', 'PyTorch', 'Data Science', 'SQL', 'Tableau'], interests: ['Artificial Intelligence', 'Machine Learning', 'Data Analytics', 'Research Opportunities'], bio: 'Junior student focusing on deep learning research, computer vision, and academic paper publications.' }
  ];

  fallbackStore.opportunity_categories = [
    { id: 1, name: 'Hackathons', slug: 'hackathons', icon: 'Code', description: 'Competitive programming and software building marathons with cash prizes and hiring opportunities' },
    { id: 2, name: 'Internships', slug: 'internships', icon: 'Briefcase', description: 'Paid industry and research summer/winter internship openings for students' },
    { id: 3, name: 'Workshops', slug: 'workshops', icon: 'BookOpen', description: 'Hands-on technical bootcamps, masterclasses, and certified skill workshops' },
    { id: 4, name: 'Competitions', slug: 'competitions', icon: 'Trophy', description: 'Inter-college technical quizzes, paper presentations, and project expos' },
    { id: 5, name: 'Scholarships', slug: 'scholarships', icon: 'GraduationCap', description: 'Merit-cum-means and corporate diversity engineering scholarships' },
    { id: 6, name: 'Research Opportunities', slug: 'research', icon: 'FlaskConical', description: 'Faculty-led research fellowships, lab assistantships, and conference grants' },
    { id: 7, name: 'Coding Contests', slug: 'coding-contests', icon: 'Terminal', description: 'Algorithmic contests, weekly speed coding, and competitive rankings' },
    { id: 8, name: 'College Events', slug: 'college-events', icon: 'Calendar', description: 'Campus technical fests, guest expert lectures, and cultural clubs' }
  ];

  const now = new Date();
  const addDays = (d, n) => {
    const copy = new Date(d);
    copy.setDate(copy.getDate() + n);
    return copy.toISOString().split('T')[0];
  };

  fallbackStore.opportunities = [
    {
      id: 1,
      title: 'Smart India Campus Hackathon 2026',
      description: 'A premier 36-hour national level hackathon where student teams develop cutting-edge web, mobile, and AI solutions for smart city and campus automation problems. Top teams get direct interview opportunities and grant funding.',
      category_id: 1,
      opportunity_type: 'Hackathon',
      organization_name: 'Ministry of Education Innovation Cell',
      eligible_branches: ['CSE', 'IT', 'ECE'],
      eligible_academic_years: [2, 3, 4],
      required_skills: ['React', 'Node.js', 'Python', 'SQL', 'Git'],
      mode: 'Hybrid',
      location: 'Main Auditorium & Online',
      registration_link: 'https://innovation.gov.in/hackathon2026',
      application_deadline: addDays(now, 12),
      eligibility_requirements: 'Teams of 3-4 members. CSE/IT/ECE 2nd to 4th year students with active student ID.',
      stipend_or_prize: '₹2,50,000 Cash Pool + Incubation',
      posted_by: 1,
      is_active: true,
      view_count: 142,
      created_at: new Date(Date.now() - 2 * 86400000)
    },
    {
      id: 2,
      title: 'Google Cloud Summer Engineering Internship',
      description: 'Join the Google Cloud Engineering team as a Software Engineer Intern for 10-12 weeks during Summer 2027. You will design, build, and deploy high-performance microservices and cloud tooling.',
      category_id: 2,
      opportunity_type: 'Internship',
      organization_name: 'Google India',
      eligible_branches: ['CSE', 'IT'],
      eligible_academic_years: [3],
      required_skills: ['Python', 'Node.js', 'Cloud Computing', 'Docker', 'SQL'],
      mode: 'Hybrid',
      location: 'Bengaluru / Hyderabad',
      registration_link: 'https://careers.google.com/students/cloud-intern',
      application_deadline: addDays(now, 6),
      eligibility_requirements: 'Currently enrolled in 3rd year Bachelor of Technology in CSE or IT. Minimum CGPA of 8.0 with strong foundations in Data Structures and Algorithms.',
      stipend_or_prize: '₹1,10,000 / month + Relocation',
      posted_by: 1,
      is_active: true,
      view_count: 389,
      created_at: new Date(Date.now() - 3 * 86400000)
    },
    {
      id: 3,
      title: 'IEEE Advanced Robotics & Autonomous Systems Workshop',
      description: 'A 3-day rigorous practical workshop on ROS2 (Robot Operating System), LiDAR sensor fusion, and autonomous path planning using NVIDIA Jetson boards. Certificate of completion issued by IEEE Robotics Society.',
      category_id: 3,
      opportunity_type: 'Workshop',
      organization_name: 'IEEE Robotics & Automation Society',
      eligible_branches: ['ECE', 'MECH', 'CSE'],
      eligible_academic_years: [2, 3, 4],
      required_skills: ['C++', 'Embedded Systems', 'IoT', 'Robotics'],
      mode: 'Offline',
      location: 'Robotics Lab 301, Block B',
      registration_link: 'https://ieee-ras.org/workshops/autonomous2026',
      application_deadline: addDays(now, 4),
      eligibility_requirements: 'Open to ECE, MECH, and CSE students with basic familiarity in C++ and electronics.',
      stipend_or_prize: 'IEEE Official Certificate + Hardware Kit',
      posted_by: 1,
      is_active: true,
      view_count: 95,
      created_at: new Date(Date.now() - 4 * 86400000)
    },
    {
      id: 4,
      title: 'CodeSprint National Algorithmic Challenge',
      description: '5-hour individual competitive programming contest featuring 6 algorithmic problems ranging from dynamic programming, graphs, to number theory. Fast track interview referrals to tier-1 tech firms.',
      category_id: 7,
      opportunity_type: 'Coding Contest',
      organization_name: 'CodeNation & TechGig',
      eligible_branches: ['ALL'],
      eligible_academic_years: [1, 2, 3, 4],
      required_skills: ['Python', 'C++', 'Java', 'SQL'],
      mode: 'Online',
      location: 'Virtual Platform',
      registration_link: 'https://techgig.com/codesprint2026',
      application_deadline: addDays(now, 18),
      eligibility_requirements: 'Open to all undergraduate branches and years. Must have an active competitive programming profile.',
      stipend_or_prize: 'MacBook Pro + ₹1,00,000 Cash',
      posted_by: 1,
      is_active: true,
      view_count: 260,
      created_at: new Date(Date.now() - 5 * 86400000)
    },
    {
      id: 5,
      title: 'Microsoft Security Research & Threat Hunting Internship',
      description: 'Work alongside Microsoft Defender security researchers analyzing malware telemetry, reverse engineering exploits, and building cloud-native intrusion detection models.',
      category_id: 2,
      opportunity_type: 'Internship',
      organization_name: 'Microsoft Security India',
      eligible_branches: ['CSE', 'IT'],
      eligible_academic_years: [3, 4],
      required_skills: ['Cybersecurity', 'Python', 'Linux', 'Cloud Computing'],
      mode: 'Online',
      location: 'Remote / Hyderabad',
      registration_link: 'https://careers.microsoft.com/students/security',
      application_deadline: addDays(now, 9),
      eligibility_requirements: '3rd or 4th year CSE/IT students with demonstrated interest in network security, operating system internals, and threat analysis.',
      stipend_or_prize: '₹95,000 / month Stipend',
      posted_by: 1,
      is_active: true,
      view_count: 178,
      created_at: new Date(Date.now() - 6 * 86400000)
    },
    {
      id: 6,
      title: 'Reliance Foundation Undergraduate STEM Scholarship',
      description: 'Scholarship program awarding up to ₹2,00,000 per academic year to meritorious undergraduate students enrolled in engineering and STEM fields, along with industry mentorship.',
      category_id: 5,
      opportunity_type: 'Scholarship',
      organization_name: 'Reliance Foundation',
      eligible_branches: ['ALL'],
      eligible_academic_years: [1, 2, 3, 4],
      required_skills: ['Git', 'SQL'],
      mode: 'Online',
      location: 'Pan-India',
      registration_link: 'https://reliancefoundation.org/stem-scholarship',
      application_deadline: addDays(now, 25),
      eligibility_requirements: 'Indian national enrolled full-time in accredited B.E./B.Tech degree. First class academic record (CGPA >= 7.5).',
      stipend_or_prize: '₹2,00,000 / year Financial Grant',
      posted_by: 1,
      is_active: true,
      view_count: 310,
      created_at: new Date(Date.now() - 7 * 86400000)
    },
    {
      id: 7,
      title: 'AI Research Fellowship: Computer Vision in Healthcare',
      description: 'Funded academic research assistantship under the Center of Artificial Intelligence. Selected fellows will collaborate on multimodal deep learning models for radiological scan anomaly detection.',
      category_id: 6,
      opportunity_type: 'Research Opportunities',
      organization_name: 'AI Research Lab & AIIMS Collaboration',
      eligible_branches: ['CSE', 'IT'],
      eligible_academic_years: [3, 4],
      required_skills: ['Python', 'Machine Learning', 'PyTorch', 'Data Science'],
      mode: 'Offline',
      location: 'High Performance Computing Lab, Room 410',
      registration_link: 'https://campusconnect.edu/research/ai-vision',
      application_deadline: addDays(now, 15),
      eligibility_requirements: 'Open to 3rd and 4th year CSE/IT undergraduates with prior coursework in Machine Learning or Deep Learning.',
      stipend_or_prize: '₹25,000 / month Research Stipend + Co-authorship',
      posted_by: 1,
      is_active: true,
      view_count: 134,
      created_at: new Date(Date.now() - 1 * 86400000)
    },
    {
      id: 8,
      title: 'Campus TechSummit 2026: GenAI & Web3 Innovation Expo',
      description: 'The flagship annual technical fest of the college featuring student project demonstrations, venture pitch battles, live CTF hacking challenges, and keynote speeches from startup founders.',
      category_id: 8,
      opportunity_type: 'College Event',
      organization_name: 'Campus Student Technical Council',
      eligible_branches: ['ALL'],
      eligible_academic_years: [1, 2, 3, 4],
      required_skills: ['Web Development', 'UI/UX', 'Git'],
      mode: 'Offline',
      location: 'Campus Central Grounds & Auditorium',
      registration_link: 'https://techsummit.campusconnect.edu',
      application_deadline: addDays(now, 30),
      eligibility_requirements: 'All college students, staff, and registered guest delegates.',
      stipend_or_prize: 'Trophies, Goodies & Startup Grants',
      posted_by: 1,
      is_active: true,
      view_count: 520,
      created_at: new Date(Date.now() - 10 * 86400000)
    }
  ];

  fallbackStore.saved_opportunities = [
    { id: 1, student_id: 2, opportunity_id: 1, saved_at: new Date() },
    { id: 2, student_id: 2, opportunity_id: 2, saved_at: new Date() },
    { id: 3, student_id: 2, opportunity_id: 7, saved_at: new Date() },
    { id: 4, student_id: 3, opportunity_id: 2, saved_at: new Date() },
    { id: 5, student_id: 3, opportunity_id: 5, saved_at: new Date() }
  ];

  fallbackStore.issue_categories = [
    {
      id: 1,
      name: 'IT / Network',
      code: 'IT_NET',
      keywords: ['wifi', 'wi-fi', 'internet', 'network', 'lan', 'ethernet', 'router', 'bandwidth', 'connection', 'ip', 'dns', 'firewall', 'gateway', 'hotspot', 'signal', 'offline', 'disconnect'],
      description: 'Issues relating to campus Wi-Fi connectivity, LAN ports, network speed, and router hardware.',
      default_department_id: 1,
      default_priority: 'HIGH',
      created_at: new Date()
    },
    {
      id: 2,
      name: 'Technical Equipment',
      code: 'TECH_EQUIP',
      keywords: ['projector', 'computer', 'pc', 'monitor', 'cpu', 'keyboard', 'mouse', 'screen', 'display', 'audio', 'mic', 'microphone', 'speaker', 'hdmi', 'podium', 'ups', 'cable'],
      description: 'Malfunctioning projectors, lab desktop machines, presentation screens, and audio-visual podiums.',
      default_department_id: 5,
      default_priority: 'MEDIUM',
      created_at: new Date()
    },
    {
      id: 3,
      name: 'Electrical',
      code: 'ELECTRICAL',
      keywords: ['light', 'tube', 'fan', 'electricity', 'socket', 'power', 'switch', 'ac', 'air conditioner', 'voltage', 'short circuit', 'mcb', 'spark', 'blackout', 'shock', 'generator'],
      description: 'Classroom lighting, fans, electrical switches, air conditioning, and power hazards.',
      default_department_id: 2,
      default_priority: 'HIGH',
      created_at: new Date()
    },
    {
      id: 4,
      name: 'Plumbing',
      code: 'PLUMBING',
      keywords: ['water', 'tap', 'leakage', 'pipe', 'washroom', 'toilet', 'sink', 'drainage', 'flush', 'restroom', 'ro', 'cooler', 'overflow', 'basin'],
      description: 'Water leakage, broken taps, washroom sanitation problems, drinking water coolers, and clogged drainage.',
      default_department_id: 3,
      default_priority: 'MEDIUM',
      created_at: new Date()
    },
    {
      id: 5,
      name: 'Infrastructure',
      code: 'INFRA',
      keywords: ['desk', 'chair', 'bench', 'furniture', 'door', 'window', 'board', 'whiteboard', 'tile', 'ceiling', 'lock', 'handle', 'wall', 'plaster', 'crack'],
      description: 'Damaged benches, broken chairs, damaged classroom doors, whiteboard, and furniture repairs.',
      default_department_id: 4,
      default_priority: 'LOW',
      created_at: new Date()
    }
  ];

  fallbackStore.complaints = [
    {
      id: 1,
      complaint_number: 'CMP-2026-0001',
      student_id: 2,
      title: 'Wi-Fi not working in Lab 4',
      description: 'The Wi-Fi access point in Computer Lab 4 has been dropping connection continuously for 2 hours. Students cannot connect to academic servers or run practical lab tasks.',
      campus_location: 'Tech Tower',
      room_number: 'Lab 4',
      category_id: 1,
      department_id: 1,
      priority: 'HIGH',
      status: 'In Progress',
      is_duplicate: false,
      parent_complaint_id: null,
      affected_student_count: 3,
      image_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500',
      resolution_notes: 'Technician assigned to reboot Cisco Catalyst switch and replace Ethernet patch cord.',
      resolved_at: null,
      created_at: new Date(Date.now() - 48 * 3600000),
      updated_at: new Date(Date.now() - 24 * 3600000)
    },
    {
      id: 2,
      complaint_number: 'CMP-2026-0002',
      student_id: 3,
      title: 'Projector malfunctioning in Classroom 203',
      description: 'The ceiling mounted Epson projector in Classroom 203 blinks red light and shuts down after 5 minutes of operation. Display flickers with yellow tint during lectures.',
      campus_location: 'Academic Block A',
      room_number: 'Classroom 203',
      category_id: 2,
      department_id: 5,
      priority: 'MEDIUM',
      status: 'Assigned',
      is_duplicate: false,
      parent_complaint_id: null,
      affected_student_count: 1,
      image_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500',
      resolution_notes: 'Routed to Technical Equipment & AV department for lamp inspection.',
      resolved_at: null,
      created_at: new Date(Date.now() - 24 * 3600000),
      updated_at: new Date(Date.now() - 20 * 3600000)
    },
    {
      id: 3,
      complaint_number: 'CMP-2026-0003',
      student_id: 4,
      title: 'Severe water pipe leakage near 2nd floor washroom',
      description: 'Water is leaking continuously from the ceiling pipe joint right outside the 2nd floor men washroom. Floor is slippery and water is accumulating in the corridor.',
      campus_location: 'Science Wing',
      room_number: 'Washroom 2F Corridor',
      category_id: 4,
      department_id: 3,
      priority: 'HIGH',
      status: 'Resolved',
      is_duplicate: false,
      parent_complaint_id: null,
      affected_student_count: 1,
      image_url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=500',
      resolution_notes: 'Pipe coupling replaced, valve pressure balanced, and floor sanitized by plumbing maintenance crew.',
      resolved_at: new Date(Date.now() - 3 * 3600000),
      created_at: new Date(Date.now() - 72 * 3600000),
      updated_at: new Date(Date.now() - 3 * 3600000)
    },
    {
      id: 4,
      complaint_number: 'CMP-2026-0004',
      student_id: 5,
      title: 'Broken classroom bench and loose desk support',
      description: 'The wooden desk on row 4 seat 3 has a broken side metal support. Students cannot sit safely without the desk tilting.',
      campus_location: 'Academic Block A',
      room_number: 'Classroom 105',
      category_id: 5,
      department_id: 4,
      priority: 'LOW',
      status: 'Pending',
      is_duplicate: false,
      parent_complaint_id: null,
      affected_student_count: 1,
      image_url: null,
      resolution_notes: null,
      resolved_at: null,
      created_at: new Date(Date.now() - 6 * 3600000),
      updated_at: new Date(Date.now() - 6 * 3600000)
    }
  ];

  fallbackStore.complaint_reports = [
    {
      id: 1,
      complaint_id: 1,
      student_id: 3,
      reported_title: 'Internet connection unavailable in Lab 4',
      reported_description: 'Unable to load any websites on the desktop computers or Wi-Fi in Lab 4. Network adapter showing no IP address.',
      similarity_score: 92.50,
      status: 'Confirmed Duplicate',
      created_at: new Date(Date.now() - 40 * 3600000)
    },
    {
      id: 2,
      complaint_id: 1,
      student_id: 4,
      reported_title: 'Network problem in Lab 4 during practical session',
      reported_description: 'Wi-Fi router shows orange light and cannot ping default gateway from Lab 4. Students cannot access lab server.',
      similarity_score: 88.00,
      status: 'Confirmed Duplicate',
      created_at: new Date(Date.now() - 30 * 3600000)
    }
  ];

  fallbackStore.complaint_history = [
    { id: 1, complaint_id: 1, changed_by: 2, previous_status: null, new_status: 'Pending', comment: 'Complaint submitted via Student Portal.', created_at: new Date(Date.now() - 48 * 3600000) },
    { id: 2, complaint_id: 1, changed_by: 1, previous_status: 'Pending', new_status: 'Assigned', comment: 'Assigned to IT & Network Services Department.', created_at: new Date(Date.now() - 46 * 3600000) },
    { id: 3, complaint_id: 1, changed_by: 1, previous_status: 'Assigned', new_status: 'In Progress', comment: 'Hardware diagnostics initiated on Lab 4 switch.', created_at: new Date(Date.now() - 24 * 3600000) },
    { id: 4, complaint_id: 3, changed_by: 4, previous_status: null, new_status: 'Pending', comment: 'Urgent complaint submitted regarding washroom flooding.', created_at: new Date(Date.now() - 72 * 3600000) },
    { id: 5, complaint_id: 3, changed_by: 1, previous_status: 'Pending', new_status: 'Assigned', comment: 'Assigned to Plumbing & Water Works with HIGH priority.', created_at: new Date(Date.now() - 71 * 3600000) },
    { id: 6, complaint_id: 3, changed_by: 1, previous_status: 'Assigned', new_status: 'In Progress', comment: 'Emergency plumbing isolation in progress.', created_at: new Date(Date.now() - 48 * 3600000) },
    { id: 7, complaint_id: 3, changed_by: 1, previous_status: 'In Progress', new_status: 'Resolved', comment: 'Pipe coupling replaced, valve pressure balanced, and floor sanitized.', created_at: new Date(Date.now() - 3 * 3600000) }
  ];

  fallbackStore.notifications = [
    { id: 1, user_id: 2, title: 'Complaint Status Updated', message: 'Your complaint CMP-2026-0001 (Wi-Fi not working in Lab 4) is now In Progress.', type: 'complaint', link: '/complaints', is_read: false, created_at: new Date(Date.now() - 24 * 3600000) },
    { id: 2, user_id: 2, title: 'New Opportunity Recommended', message: 'Smart India Campus Hackathon 2026 matches 95% of your CSE profile and interests.', type: 'opportunity', link: '/opportunities', is_read: false, created_at: new Date(Date.now() - 12 * 3600000) },
    { id: 3, user_id: 4, title: 'Complaint Resolved', message: 'Your complaint CMP-2026-0003 regarding washroom water leakage has been successfully resolved.', type: 'complaint', link: '/complaints', is_read: false, created_at: new Date(Date.now() - 3 * 3600000) }
  ];
}

seedFallbackStore();

async function initMySQL() {
  try {
    const tempPool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    const [rows] = await tempPool.query('SELECT 1 + 1 AS test');
    pool = tempPool;
    isConnectedToMySQL = true;
    console.log(`[DB] Connected to MySQL database '${database}' on ${host}:${port}`);

    // Auto-check tables
    try {
      const [tables] = await pool.query('SHOW TABLES LIKE "users"');
      if (tables.length === 0) {
        console.log('[DB] Database tables not found. Automatically running schema & seed...');
        const initDatabase = require('../database/initDb');
        await initDatabase();
      }
    } catch (e) {
      console.warn('[DB] Auto-check error (proceeding):', e.message);
    }
  } catch (err) {
    isConnectedToMySQL = false;
    console.warn(`[DB WARNING] Could not connect to MySQL at ${host}:${port} (${err.code || err.message}).`);
    console.warn(`[DB INFO] Running in Fallback Resilient Mode with seed data preloaded.`);
  }
}

initMySQL();

module.exports = {
  pool: () => pool,
  isMySQLConnected: () => isConnectedToMySQL,
  fallbackStore,
  initMySQL,

  async query(sql, params = []) {
    if (isConnectedToMySQL && pool) {
      return pool.query(sql, params);
    }
    return executeFallbackQuery(sql, params);
  }
};

function executeFallbackQuery(sql, params = []) {
  const cleanSql = sql.trim().replace(/\s+/g, ' ');
  const upperSql = cleanSql.toUpperCase();

  // 1. SELECT
  if (upperSql.startsWith('SELECT')) {
    if (upperSql.includes('FROM USERS')) {
      if (upperSql.includes('WHERE EMAIL = ?') || upperSql.includes('WHERE U.EMAIL = ?')) {
        const email = params[0]?.toLowerCase();
        const user = fallbackStore.users.find(u => u.email.toLowerCase() === email);
        return [user ? [user] : []];
      }
      if (upperSql.includes('WHERE ID = ?') || upperSql.includes('WHERE U.ID = ?')) {
        const id = parseInt(params[0], 10);
        const user = fallbackStore.users.find(u => u.id === id);
        return [user ? [user] : []];
      }
      if (upperSql.includes('ROLE = ?')) {
        const role = params[0];
        const users = fallbackStore.users.filter(u => u.role === role);
        return [users];
      }
      return [fallbackStore.users];
    }

    if (upperSql.includes('FROM STUDENT_PROFILES')) {
      if (upperSql.includes('WHERE USER_ID = ?')) {
        const uid = parseInt(params[0], 10);
        const profile = fallbackStore.student_profiles.find(p => p.user_id === uid);
        return [profile ? [profile] : []];
      }
      return [fallbackStore.student_profiles];
    }

    if (upperSql.includes('FROM DEPARTMENTS')) {
      if (upperSql.includes('WHERE ID = ?')) {
        const id = parseInt(params[0], 10);
        const dep = fallbackStore.departments.find(d => d.id === id);
        return [dep ? [dep] : []];
      }
      return [fallbackStore.departments];
    }

    if (upperSql.includes('FROM OPPORTUNITY_CATEGORIES')) {
      if (upperSql.includes('WHERE ID = ?')) {
        const id = parseInt(params[0], 10);
        const cat = fallbackStore.opportunity_categories.find(c => c.id === id);
        return [cat ? [cat] : []];
      }
      return [fallbackStore.opportunity_categories];
    }

    if (upperSql.includes('FROM OPPORTUNITIES')) {
      if (upperSql.includes('WHERE ID = ?') || upperSql.includes('WHERE O.ID = ?')) {
        const id = parseInt(params[0], 10);
        const opp = fallbackStore.opportunities.find(o => o.id === id);
        return [opp ? [opp] : []];
      }
      return [fallbackStore.opportunities];
    }

    if (upperSql.includes('FROM SAVED_OPPORTUNITIES') || upperSql.includes('FROM STUDENT_SAVED_OPPORTUNITIES')) {
      if (
        upperSql.includes('WHERE STUDENT_ID = ? AND OPPORTUNITY_ID = ?') ||
        upperSql.includes('WHERE SSO.STUDENT_ID = ? AND SSO.OPPORTUNITY_ID = ?') ||
        upperSql.includes('WHERE SO.STUDENT_ID = ? AND SO.OPPORTUNITY_ID = ?')
      ) {
        const [sid, oid] = params.map(Number);
        const saved = fallbackStore.saved_opportunities.find(s => s.student_id === sid && s.opportunity_id === oid);
        return [saved ? [saved] : []];
      }
      if (
        upperSql.includes('WHERE STUDENT_ID = ?') ||
        upperSql.includes('WHERE SSO.STUDENT_ID = ?') ||
        upperSql.includes('WHERE SO.STUDENT_ID = ?') ||
        upperSql.includes('WHERE SO.STUDENT_ID = ?')
      ) {
        const sid = parseInt(params[0], 10);
        const savedList = fallbackStore.saved_opportunities.filter(s => s.student_id === sid);

        // If query joins OPPORTUNITIES or requests o.* (as in getSavedOpportunities)
        if (upperSql.includes('JOIN OPPORTUNITIES') || upperSql.includes('O.*')) {
          const joined = savedList.map(s => {
            const opp = fallbackStore.opportunities.find(o => o.id === s.opportunity_id);
            if (!opp) return null;
            const cat = fallbackStore.opportunity_categories.find(c => c.id === opp.category_id);
            return {
              ...opp,
              id: opp.id,
              opportunity_id: opp.id,
              category_name: cat ? cat.name : 'General',
              category_icon: cat ? cat.icon : 'Tag',
              saved_at: s.saved_at,
              is_saved: true
            };
          }).filter(Boolean);
          return [joined];
        }

        return [savedList];
      }
      return [fallbackStore.saved_opportunities];
    }

    if (upperSql.includes('FROM ISSUE_CATEGORIES')) {
      if (upperSql.includes('WHERE ID = ?')) {
        const id = parseInt(params[0], 10);
        const cat = fallbackStore.issue_categories.find(c => c.id === id);
        return [cat ? [cat] : []];
      }
      return [fallbackStore.issue_categories];
    }

    if (upperSql.includes('FROM COMPLAINTS')) {
      if (upperSql.includes('WHERE ID = ?') || upperSql.includes('WHERE C.ID = ?')) {
        const id = parseInt(params[0], 10);
        const cmp = fallbackStore.complaints.find(c => c.id === id);
        return [cmp ? [cmp] : []];
      }
      if (upperSql.includes('WHERE STUDENT_ID = ?') || upperSql.includes('WHERE C.STUDENT_ID = ?')) {
        const sid = parseInt(params[0], 10);
        const cmps = fallbackStore.complaints.filter(c => c.student_id === sid);
        return [cmps];
      }
      if (upperSql.includes('DEPARTMENT_ID = ?')) {
        const did = parseInt(params[0], 10);
        const cmps = fallbackStore.complaints.filter(c => c.department_id === did);
        return [cmps];
      }
      return [fallbackStore.complaints];
    }

    if (upperSql.includes('FROM COMPLAINT_REPORTS')) {
      if (upperSql.includes('WHERE COMPLAINT_ID = ?')) {
        const cid = parseInt(params[0], 10);
        const reports = fallbackStore.complaint_reports.filter(r => r.complaint_id === cid);
        return [reports];
      }
      if (upperSql.includes('WHERE STUDENT_ID = ?') || upperSql.includes('WHERE CR.STUDENT_ID = ?')) {
        const sid = parseInt(params[0], 10);
        const reports = fallbackStore.complaint_reports.filter(r => r.student_id === sid);
        return [reports];
      }
      return [fallbackStore.complaint_reports];
    }

    if (upperSql.includes('FROM COMPLAINT_HISTORY')) {
      if (upperSql.includes('WHERE COMPLAINT_ID = ?')) {
        const cid = parseInt(params[0], 10);
        const hist = fallbackStore.complaint_history.filter(h => h.complaint_id === cid);
        return [hist];
      }
      return [fallbackStore.complaint_history];
    }

    if (upperSql.includes('FROM NOTIFICATIONS')) {
      if (upperSql.includes('WHERE USER_ID = ?')) {
        const uid = parseInt(params[0], 10);
        const notifs = fallbackStore.notifications.filter(n => n.user_id === uid);
        return [notifs];
      }
      return [fallbackStore.notifications];
    }

    return [[]];
  }

  // 2. INSERT
  if (upperSql.startsWith('INSERT')) {
    const newId = (Date.now() % 900000) + 10;
    const now = new Date();

    if (upperSql.includes('INTO USERS')) {
      let name, email, password, role, phone, avatar;
      if (params.length === 5) {
        [name, email, password, phone, avatar] = params;
        role = 'student';
      } else {
        [name, email, password, role, phone, avatar] = params;
      }
      role = (role && String(role).toLowerCase() === 'admin') ? 'admin' : 'student';
      const newUser = {
        id: newId,
        name: name ? String(name).trim() : '',
        email: email ? String(email).toLowerCase().trim() : '',
        password,
        role,
        phone: phone || null,
        avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=2563eb&color=fff`,
        status: 'active',
        created_at: now,
        updated_at: now
      };
      fallbackStore.users.push(newUser);
      return [{ insertId: newId, affectedRows: 1 }];
    }

    if (upperSql.includes('INTO STUDENT_PROFILES')) {
      const [user_id, roll_number, department, branch, academic_year, semester, skills, interests, bio] = params;
      const newProf = {
        id: newId,
        user_id: Number(user_id),
        roll_number,
        department,
        branch,
        academic_year: Number(academic_year),
        semester: Number(semester || 1),
        skills: typeof skills === 'string' ? JSON.parse(skills || '[]') : (skills || []),
        interests: typeof interests === 'string' ? JSON.parse(interests || '[]') : (interests || []),
        bio,
        created_at: now,
        updated_at: now
      };
      fallbackStore.student_profiles.push(newProf);
      return [{ insertId: newId, affectedRows: 1 }];
    }

    if (upperSql.includes('INTO OPPORTUNITIES')) {
      const [title, description, category_id, opportunity_type, organization_name, eligible_branches, eligible_academic_years, required_skills, mode, location, registration_link, application_deadline, eligibility_requirements, stipend_or_prize, posted_by] = params;
      const newOpp = {
        id: newId,
        title,
        description,
        category_id: Number(category_id),
        opportunity_type,
        organization_name,
        eligible_branches: typeof eligible_branches === 'string' ? JSON.parse(eligible_branches) : eligible_branches,
        eligible_academic_years: typeof eligible_academic_years === 'string' ? JSON.parse(eligible_academic_years) : eligible_academic_years,
        required_skills: typeof required_skills === 'string' ? JSON.parse(required_skills) : required_skills,
        mode: mode || 'Online',
        location: location || 'Virtual / Remote',
        registration_link,
        application_deadline,
        eligibility_requirements,
        stipend_or_prize: stipend_or_prize || 'Certificate & Perks',
        posted_by: posted_by ? Number(posted_by) : 1,
        is_active: true,
        view_count: 0,
        created_at: now,
        updated_at: now
      };
      fallbackStore.opportunities.push(newOpp);
      return [{ insertId: newId, affectedRows: 1 }];
    }

    if (upperSql.includes('INTO SAVED_OPPORTUNITIES') || upperSql.includes('INTO STUDENT_SAVED_OPPORTUNITIES')) {
      const [student_id, opportunity_id] = params.map(Number);
      const exists = fallbackStore.saved_opportunities.find(s => s.student_id === student_id && s.opportunity_id === opportunity_id);
      if (!exists) {
        fallbackStore.saved_opportunities.push({ id: newId, student_id, opportunity_id, saved_at: now });
      } else {
        exists.saved_at = now;
      }
      return [{ insertId: exists ? exists.id : newId, affectedRows: 1 }];
    }

    if (upperSql.includes('INTO COMPLAINTS')) {
      const [complaint_number, student_id, title, description, campus_location, room_number, category_id, department_id, priority, status, is_duplicate, parent_complaint_id, affected_student_count, image_url] = params;
      const newCmp = {
        id: newId,
        complaint_number,
        student_id: Number(student_id),
        title,
        description,
        campus_location,
        room_number,
        category_id: category_id ? Number(category_id) : null,
        department_id: department_id ? Number(department_id) : null,
        priority: priority || 'MEDIUM',
        status: status || 'Pending',
        is_duplicate: Boolean(is_duplicate),
        parent_complaint_id: parent_complaint_id ? Number(parent_complaint_id) : null,
        affected_student_count: Number(affected_student_count || 1),
        image_url: image_url || null,
        resolution_notes: null,
        resolved_at: null,
        created_at: now,
        updated_at: now
      };
      fallbackStore.complaints.push(newCmp);
      return [{ insertId: newId, affectedRows: 1 }];
    }

    if (upperSql.includes('INTO COMPLAINT_REPORTS')) {
      const [complaint_id, student_id, reported_title, reported_description, image_url, similarity_score, status] = params;
      const newReport = {
        id: newId,
        complaint_id: Number(complaint_id),
        student_id: Number(student_id),
        reported_title,
        reported_description,
        image_url: image_url || null,
        similarity_score: Number(similarity_score || 0),
        status: status || 'Confirmed Duplicate',
        created_at: now
      };
      fallbackStore.complaint_reports.push(newReport);
      return [{ insertId: newId, affectedRows: 1 }];
    }

    if (upperSql.includes('INTO COMPLAINT_HISTORY')) {
      const [complaint_id, changed_by, previous_status, new_status, comment] = params;
      const newHist = {
        id: newId,
        complaint_id: Number(complaint_id),
        changed_by: Number(changed_by),
        previous_status,
        new_status,
        comment,
        created_at: now
      };
      fallbackStore.complaint_history.push(newHist);
      return [{ insertId: newId, affectedRows: 1 }];
    }

    if (upperSql.includes('INTO NOTIFICATIONS')) {
      const [user_id, title, message, type, link] = params;
      const newNotif = {
        id: newId,
        user_id: Number(user_id),
        title,
        message,
        type: type || 'system',
        link,
        is_read: false,
        created_at: now
      };
      fallbackStore.notifications.push(newNotif);
      return [{ insertId: newId, affectedRows: 1 }];
    }

    return [{ insertId: newId, affectedRows: 1 }];
  }

  // 3. UPDATE
  if (upperSql.startsWith('UPDATE')) {
    const now = new Date();

    if (upperSql.includes('COMPLAINTS')) {
      const id = parseInt(params[params.length - 1], 10);
      const cmp = fallbackStore.complaints.find(c => c.id === id);
      if (cmp) {
        if (upperSql.includes('STATUS = ?')) {
          cmp.status = params[0];
          if (params[0] === 'Resolved') cmp.resolved_at = now;
        }
        if (upperSql.includes('RESOLUTION_NOTES = ?') || upperSql.includes('RESOLUTION_NOTES = COALESCE(?, RESOLUTION_NOTES)')) {
          cmp.resolution_notes = params[1] || params[0];
        }
        if (upperSql.includes('PRIORITY = ?')) cmp.priority = params[0];
        if (upperSql.includes('DEPARTMENT_ID = ?')) cmp.department_id = Number(params[0]);
        if (upperSql.includes('AFFECTED_STUDENT_COUNT = ?')) cmp.affected_student_count = Number(params[0]);
        cmp.updated_at = now;
      }
      return [{ affectedRows: cmp ? 1 : 0 }];
    }

    if (upperSql.includes('OPPORTUNITIES')) {
      const id = parseInt(params[params.length - 1], 10);
      const opp = fallbackStore.opportunities.find(o => o.id === id);
      if (opp) opp.updated_at = now;
      return [{ affectedRows: opp ? 1 : 0 }];
    }

    if (upperSql.includes('NOTIFICATIONS')) {
      if (upperSql.includes('IS_READ = TRUE')) {
        const uid = parseInt(params[0], 10);
        fallbackStore.notifications.filter(n => n.user_id === uid).forEach(n => { n.is_read = true; });
        return [{ affectedRows: 1 }];
      }
    }

    return [{ affectedRows: 1 }];
  }

  // 4. DELETE
  if (upperSql.startsWith('DELETE')) {
    if (upperSql.includes('FROM SAVED_OPPORTUNITIES') || upperSql.includes('FROM STUDENT_SAVED_OPPORTUNITIES')) {
      const [sid, oid] = params.map(Number);
      const initLen = fallbackStore.saved_opportunities.length;
      fallbackStore.saved_opportunities = fallbackStore.saved_opportunities.filter(s => !(s.student_id === sid && s.opportunity_id === oid));
      return [{ affectedRows: initLen - fallbackStore.saved_opportunities.length }];
    }

    if (upperSql.includes('FROM OPPORTUNITIES')) {
      const id = parseInt(params[0], 10);
      const initLen = fallbackStore.opportunities.length;
      fallbackStore.opportunities = fallbackStore.opportunities.filter(o => o.id !== id);
      return [{ affectedRows: initLen - fallbackStore.opportunities.length }];
    }

    if (upperSql.includes('FROM COMPLAINTS')) {
      const id = parseInt(params[0], 10);
      const initLen = fallbackStore.complaints.length;
      fallbackStore.complaints = fallbackStore.complaints.filter(c => c.id !== id);
      return [{ affectedRows: initLen - fallbackStore.complaints.length }];
    }

    return [{ affectedRows: 1 }];
  }

  return [[]];
}
