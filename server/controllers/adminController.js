const db = require('../config/db');

/**
 * Get comprehensive Admin Dashboard Analytics
 */
async function getAdminOverview(req, res) {
  try {
    // 1. Opportunities & Saved metrics
    const [oppRows] = await db.query(
      `SELECT o.*, oc.name AS category_name, 
              (SELECT COUNT(*) FROM saved_opportunities so WHERE so.opportunity_id = o.id) AS saved_count
       FROM opportunities o
       LEFT JOIN opportunity_categories oc ON o.category_id = oc.id
       WHERE o.is_active = TRUE`
    );

    // Most saved opportunities
    const mostSavedOpportunities = [...oppRows]
      .sort((a, b) => (b.saved_count || 0) - (a.saved_count || 0))
      .slice(0, 5)
      .map(o => ({
        id: o.id,
        title: o.title,
        category: o.category_name,
        deadline: o.application_deadline,
        savedCount: o.saved_count || 0
      }));

    // Opportunities by Category
    const oppCategoryMap = {};
    for (const opp of oppRows) {
      const cat = opp.category_name || 'General';
      oppCategoryMap[cat] = (oppCategoryMap[cat] || 0) + 1;
    }
    const opportunitiesByCategory = Object.keys(oppCategoryMap).map(name => ({
      name,
      count: oppCategoryMap[name]
    }));

    // 2. User metrics
    const [studentRows] = await db.query('SELECT COUNT(*) AS count FROM users WHERE role = "student"');
    const totalStudents = studentRows[0]?.count || 0;

    // 3. Complaint metrics
    const [allComplaints] = await db.query(
      `SELECT c.*, ic.name AS category_name, d.name AS department_name 
       FROM complaints c 
       LEFT JOIN issue_categories ic ON c.category_id = ic.id 
       LEFT JOIN departments d ON c.department_id = d.id`
    );

    const totalComplaints = allComplaints.length;
    const pendingComplaints = allComplaints.filter(c => c.status === 'Pending').length;
    const assignedComplaints = allComplaints.filter(c => c.status === 'Assigned').length;
    const inProgressComplaints = allComplaints.filter(c => c.status === 'In Progress').length;
    const resolvedComplaints = allComplaints.filter(c => c.status === 'Resolved').length;
    const highPriorityComplaints = allComplaints.filter(c => c.priority === 'HIGH' && c.status !== 'Resolved').length;

    // Potential duplicates
    const potentialDuplicateComplaints = allComplaints.filter(c => (c.affected_student_count > 1 || c.is_duplicate) && c.status !== 'Resolved');

    // Complaints by Department
    const deptMap = {};
    for (const c of allComplaints) {
      const dept = c.department_name || 'Unassigned';
      deptMap[dept] = (deptMap[dept] || 0) + 1;
    }
    const complaintsByDepartment = Object.keys(deptMap).map(name => ({
      name,
      count: deptMap[name]
    }));

    // Status breakdown for Recharts Pie/Bar chart
    const statusBreakdown = [
      { name: 'Pending', count: pendingComplaints, fill: '#f59e0b' },
      { name: 'Assigned', count: assignedComplaints, fill: '#6366f1' },
      { name: 'In Progress', count: inProgressComplaints, fill: '#3b82f6' },
      { name: 'Resolved', count: resolvedComplaints, fill: '#10b981' }
    ];

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalOpportunities: oppRows.length,
        totalComplaints,
        pendingComplaints,
        assignedComplaints,
        inProgressComplaints,
        resolvedComplaints,
        highPriorityComplaints,
        duplicateIncidentsCount: potentialDuplicateComplaints.length
      },
      charts: {
        complaintsByDepartment,
        opportunitiesByCategory,
        statusBreakdown,
        mostSavedOpportunities
      },
      potentialDuplicates: potentialDuplicateComplaints
    });
  } catch (error) {
    console.error('[GetAdminOverview Error]', error);
    res.status(500).json({ success: false, message: 'Failed to generate admin overview: ' + error.message });
  }
}

/**
 * Manage Students / Users
 */
async function getAllUsers(req, res) {
  try {
    const { role = 'student', search } = req.query;

    const [rows] = await db.query(
      `SELECT u.id, u.name, u.email, u.role, u.phone, u.avatar, u.status, u.created_at,
              sp.branch, sp.academic_year, sp.roll_number, sp.department 
       FROM users u 
       LEFT JOIN student_profiles sp ON u.id = sp.user_id 
       ORDER BY u.created_at DESC`
    );

    let users = rows;
    if (role && role !== 'ALL') {
      users = users.filter(u => u.role === role);
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      users = users.filter(u => 
        u.name.toLowerCase().includes(q) || 
        u.email.toLowerCase().includes(q) ||
        (u.roll_number && u.roll_number.toLowerCase().includes(q))
      );
    }

    res.json({ success: true, count: users.length, users });
  } catch (error) {
    console.error('[GetAllUsers Error]', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users: ' + error.message });
  }
}

/**
 * Toggle user status (active / suspended)
 */
async function updateUserStatus(req, res) {
  try {
    const userId = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (userId === req.user.id && status === 'suspended') {
      return res.status(400).json({ success: false, message: 'You cannot suspend your own admin account.' });
    }

    await db.query('UPDATE users SET status = ? WHERE id = ?', [status, userId]);
    res.json({ success: true, message: `User status changed to ${status}.` });
  } catch (error) {
    console.error('[UpdateUserStatus Error]', error);
    res.status(500).json({ success: false, message: 'Failed to update user status: ' + error.message });
  }
}

/**
 * Departments CRUD
 */
async function createDepartment(req, res) {
  try {
    const { name, code, description, contact_email, contact_phone } = req.body;
    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Department name and code are required.' });
    }

    const [result] = await db.query(
      'INSERT INTO departments (name, code, description, contact_email, contact_phone) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), code.toUpperCase().trim(), description || '', contact_email || '', contact_phone || '']
    );

    res.status(201).json({ success: true, message: 'Department created successfully.', departmentId: result.insertId });
  } catch (error) {
    console.error('[CreateDept Error]', error);
    res.status(500).json({ success: false, message: 'Failed to create department: ' + error.message });
  }
}

async function updateDepartment(req, res) {
  try {
    const deptId = parseInt(req.params.id, 10);
    const { name, code, description, contact_email, contact_phone } = req.body;

    await db.query(
      `UPDATE departments SET 
        name = COALESCE(?, name), 
        code = COALESCE(?, code), 
        description = COALESCE(?, description), 
        contact_email = COALESCE(?, contact_email), 
        contact_phone = COALESCE(?, contact_phone) 
       WHERE id = ?`,
      [name || null, code ? code.toUpperCase() : null, description || null, contact_email || null, contact_phone || null, deptId]
    );

    res.json({ success: true, message: 'Department updated successfully.' });
  } catch (error) {
    console.error('[UpdateDept Error]', error);
    res.status(500).json({ success: false, message: 'Failed to update department: ' + error.message });
  }
}

async function deleteDepartment(req, res) {
  try {
    const deptId = parseInt(req.params.id, 10);
    await db.query('DELETE FROM departments WHERE id = ?', [deptId]);
    res.json({ success: true, message: 'Department deleted successfully.' });
  } catch (error) {
    console.error('[DeleteDept Error]', error);
    res.status(500).json({ success: false, message: 'Failed to delete department: ' + error.message });
  }
}

/**
 * Issue Categories & Keywords Management
 */
async function updateIssueCategory(req, res) {
  try {
    const catId = parseInt(req.params.id, 10);
    const { name, keywords, description, default_department_id, default_priority } = req.body;

    const keywordsJson = keywords ? JSON.stringify(Array.isArray(keywords) ? keywords : String(keywords).split(',').map(k => k.trim())) : null;

    await db.query(
      `UPDATE issue_categories SET 
        name = COALESCE(?, name), 
        keywords = COALESCE(?, keywords), 
        description = COALESCE(?, description), 
        default_department_id = COALESCE(?, default_department_id), 
        default_priority = COALESCE(?, default_priority) 
       WHERE id = ?`,
      [name || null, keywordsJson, description || null, default_department_id ? parseInt(default_department_id, 10) : null, default_priority || null, catId]
    );

    res.json({ success: true, message: 'Issue category keywords and department mapping updated.' });
  } catch (error) {
    console.error('[UpdateCategory Error]', error);
    res.status(500).json({ success: false, message: 'Failed to update category: ' + error.message });
  }
}

module.exports = {
  getAdminOverview,
  getAllUsers,
  updateUserStatus,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  updateIssueCategory
};
