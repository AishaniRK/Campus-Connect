const db = require('../config/db');

/**
 * Get staff dashboard overview and assigned complaints
 */
async function getStaffDashboard(req, res) {
  try {
    const staffId = req.user.id;

    // Get staff profile & department
    const [profRows] = await db.query(
      `SELECT sp.*, d.name AS department_name 
       FROM staff_profiles sp 
       JOIN departments d ON sp.department_id = d.id 
       WHERE sp.user_id = ?`,
      [staffId]
    );

    const profile = profRows[0];
    const departmentId = profile ? profile.department_id : null;

    // Fetch complaints assigned to this department or this staff specifically
    const [allComplaints] = await db.query(
      `SELECT c.*, ic.name AS category_name, d.name AS department_name, u_stu.name AS student_name, u_staff.name AS assigned_staff_name 
       FROM complaints c 
       LEFT JOIN issue_categories ic ON c.category_id = ic.id 
       LEFT JOIN departments d ON c.department_id = d.id 
       LEFT JOIN users u_stu ON c.student_id = u_stu.id 
       LEFT JOIN users u_staff ON c.assigned_to = u_staff.id 
       WHERE c.department_id = ? OR c.assigned_to = ? 
       ORDER BY FIELD(c.priority, 'HIGH', 'MEDIUM', 'LOW'), c.created_at DESC`,
      [departmentId, staffId]
    );

    const highPriority = allComplaints.filter(c => c.priority === 'HIGH' && c.status !== 'Resolved' && c.status !== 'Rejected');
    const inProgress = allComplaints.filter(c => c.status === 'In Progress');
    const pending = allComplaints.filter(c => c.status === 'Submitted' || c.status === 'Assigned' || c.status === 'Under Review');
    const resolved = allComplaints.filter(c => c.status === 'Resolved');

    res.json({
      success: true,
      department: profile ? profile.department_name : 'Assigned Department',
      stats: {
        total: allComplaints.length,
        highPriority: highPriority.length,
        pending: pending.length,
        inProgress: inProgress.length,
        resolved: resolved.length
      },
      complaints: allComplaints
    });
  } catch (error) {
    console.error('[GetStaffDashboard Error]', error);
    res.status(500).json({ success: false, message: 'Failed to load staff dashboard: ' + error.message });
  }
}

/**
 * Get high priority complaints for staff
 */
async function getHighPriorityComplaints(req, res) {
  try {
    const staffId = req.user.id;

    const [profRows] = await db.query('SELECT department_id FROM staff_profiles WHERE user_id = ?', [staffId]);
    const deptId = profRows[0]?.department_id;

    const [complaints] = await db.query(
      `SELECT c.*, ic.name AS category_name, d.name AS department_name, u_stu.name AS student_name 
       FROM complaints c 
       LEFT JOIN issue_categories ic ON c.category_id = ic.id 
       LEFT JOIN departments d ON c.department_id = d.id 
       LEFT JOIN users u_stu ON c.student_id = u_stu.id 
       WHERE (c.department_id = ? OR c.assigned_to = ?) AND c.priority = 'HIGH' AND c.status != 'Resolved'
       ORDER BY c.created_at DESC`,
      [deptId, staffId]
    );

    res.json({ success: true, count: complaints.length, complaints });
  } catch (error) {
    console.error('[GetHighPriority Error]', error);
    res.status(500).json({ success: false, message: 'Failed to fetch high priority complaints: ' + error.message });
  }
}

/**
 * Get resolved complaints for staff
 */
async function getResolvedComplaints(req, res) {
  try {
    const staffId = req.user.id;

    const [profRows] = await db.query('SELECT department_id FROM staff_profiles WHERE user_id = ?', [staffId]);
    const deptId = profRows[0]?.department_id;

    const [complaints] = await db.query(
      `SELECT c.*, ic.name AS category_name, d.name AS department_name, u_stu.name AS student_name 
       FROM complaints c 
       LEFT JOIN issue_categories ic ON c.category_id = ic.id 
       LEFT JOIN departments d ON c.department_id = d.id 
       LEFT JOIN users u_stu ON c.student_id = u_stu.id 
       WHERE (c.department_id = ? OR c.assigned_to = ?) AND c.status = 'Resolved' 
       ORDER BY c.resolved_at DESC, c.created_at DESC`,
      [deptId, staffId]
    );

    res.json({ success: true, count: complaints.length, complaints });
  } catch (error) {
    console.error('[GetResolved Error]', error);
    res.status(500).json({ success: false, message: 'Failed to fetch resolved complaints: ' + error.message });
  }
}

module.exports = {
  getStaffDashboard,
  getHighPriorityComplaints,
  getResolvedComplaints
};

