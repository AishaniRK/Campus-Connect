const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { generateToken } = require('../config/jwt');

/**
 * Register a student account
 */
async function register(req, res) {
  try {
    const {
      name,
      email,
      password,
      phone,
      roll_number,
      department,
      branch,
      academic_year,
      semester,
      skills,
      interests,
      bio
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.'
      });
    }

    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please log in.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563eb&color=fff`;

    // Role is always 'student' for public registration
    const [userResult] = await db.query(
      'INSERT INTO users (name, email, password, role, phone, avatar) VALUES (?, ?, ?, ?, ?, ?)',
      [name.trim(), email.toLowerCase().trim(), hashedPassword, 'student', phone || null, avatar]
    );

    const userId = userResult.insertId;

    const skillsArr = Array.isArray(skills) ? skills : (skills ? String(skills).split(',').map(s => s.trim()) : ['JavaScript', 'Web Development']);
    const interestsArr = Array.isArray(interests) ? interests : (interests ? String(interests).split(',').map(i => i.trim()) : ['Hackathons', 'Internships']);

    const roll = roll_number || `24CS${Math.floor(1000 + Math.random() * 9000)}`;
    const dept = department || 'Computer Science & Engineering';
    const br = (branch || 'CSE').toUpperCase();
    const year = parseInt(academic_year || 3, 10);
    const sem = parseInt(semester || 5, 10);

    await db.query(
      `INSERT INTO student_profiles 
      (user_id, roll_number, department, branch, academic_year, semester, skills, interests, bio) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        roll,
        dept,
        br,
        year,
        sem,
        JSON.stringify(skillsArr),
        JSON.stringify(interestsArr),
        bio || ''
      ]
    );

    await db.query(
      'INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, "system", ?)',
      [
        userId,
        'Welcome to Campus Connect!',
        'Discover curated internships & hackathons and report any campus maintenance issues anytime.',
        '/opportunities'
      ]
    );

    const token = generateToken({ id: userId, email: email.toLowerCase().trim(), role: 'student', name });

    res.status(201).json({
      success: true,
      message: 'Student account registered successfully.',
      token,
      user: {
        id: userId,
        name,
        email: email.toLowerCase().trim(),
        role: 'student',
        avatar,
        profile: {
          roll_number: roll,
          department: dept,
          branch: br,
          academic_year: year,
          semester: sem,
          skills: skillsArr,
          interests: interestsArr,
          bio: bio || ''
        }
      }
    });
  } catch (error) {
    console.error('[Register Error]', error);
    res.status(500).json({ success: false, message: 'Failed to complete registration: ' + error.message });
  }
}

/**
 * Log in (Student or Administrator)
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const [rows] = await db.query(
      'SELECT id, name, email, password, role, phone, avatar, status FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    const user = rows[0];
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: `Account is ${user.status}. Please contact the administrator.`
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    let profile = null;
    if (user.role === 'student') {
      const [stuRows] = await db.query('SELECT * FROM student_profiles WHERE user_id = ?', [user.id]);
      if (stuRows[0]) {
        profile = {
          ...stuRows[0],
          skills: typeof stuRows[0].skills === 'string' ? JSON.parse(stuRows[0].skills || '[]') : (stuRows[0].skills || []),
          interests: typeof stuRows[0].interests === 'string' ? JSON.parse(stuRows[0].interests || '[]') : (stuRows[0].interests || [])
        };
      }
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        profile
      }
    });
  } catch (error) {
    console.error('[Login Error]', error);
    res.status(500).json({ success: false, message: 'Server error during login: ' + error.message });
  }
}

/**
 * Get current authenticated user details
 */
async function getMe(req, res) {
  try {
    const userId = req.user.id;

    const [userRows] = await db.query('SELECT id, name, email, role, phone, avatar, status FROM users WHERE id = ?', [userId]);
    const user = userRows[0];

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    let profile = null;
    if (user.role === 'student') {
      const [stuRows] = await db.query('SELECT * FROM student_profiles WHERE user_id = ?', [userId]);
      if (stuRows[0]) {
        profile = {
          ...stuRows[0],
          skills: typeof stuRows[0].skills === 'string' ? JSON.parse(stuRows[0].skills || '[]') : (stuRows[0].skills || []),
          interests: typeof stuRows[0].interests === 'string' ? JSON.parse(stuRows[0].interests || '[]') : (stuRows[0].interests || [])
        };
      }
    }

    res.json({
      success: true,
      user: {
        ...user,
        profile
      }
    });
  } catch (error) {
    console.error('[GetMe Error]', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve profile: ' + error.message });
  }
}

/**
 * Update student profile (branch, academic year, skills, interests, bio)
 */
async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { name, phone, avatar, bio, department, branch, academic_year, semester, skills, interests } = req.body;

    if (name || phone || avatar) {
      await db.query(
        'UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), avatar = COALESCE(?, avatar) WHERE id = ?',
        [name || null, phone || null, avatar || null, userId]
      );
    }

    if (req.user.role === 'student') {
      const skillsJson = JSON.stringify(Array.isArray(skills) ? skills : (skills ? String(skills).split(',').map(s => s.trim()) : []));
      const interestsJson = JSON.stringify(Array.isArray(interests) ? interests : (interests ? String(interests).split(',').map(i => i.trim()) : []));

      const [existingProf] = await db.query('SELECT id FROM student_profiles WHERE user_id = ?', [userId]);
      if (existingProf.length > 0) {
        await db.query(
          `UPDATE student_profiles SET 
            bio = COALESCE(?, bio),
            department = COALESCE(?, department),
            branch = COALESCE(?, branch),
            academic_year = COALESCE(?, academic_year),
            semester = COALESCE(?, semester),
            skills = COALESCE(?, skills),
            interests = COALESCE(?, interests)
           WHERE user_id = ?`,
          [bio || null, department || null, branch || null, academic_year ? parseInt(academic_year, 10) : null, semester ? parseInt(semester, 10) : null, skillsJson, interestsJson, userId]
        );
      } else {
        await db.query(
          `INSERT INTO student_profiles 
          (user_id, roll_number, department, branch, academic_year, semester, skills, interests, bio) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            `24CS${Math.floor(1000 + Math.random() * 9000)}`,
            department || 'Computer Science & Engineering',
            (branch || 'CSE').toUpperCase(),
            academic_year || 3,
            semester || 5,
            skillsJson,
            interestsJson,
            bio || ''
          ]
        );
      }
    }

    res.json({
      success: true,
      message: 'Profile updated successfully.'
    });
  } catch (error) {
    console.error('[UpdateProfile Error]', error);
    res.status(500).json({ success: false, message: 'Failed to update profile: ' + error.message });
  }
}

module.exports = {
  register,
  login,
  getMe,
  updateProfile
};
