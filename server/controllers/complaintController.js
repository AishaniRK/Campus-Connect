const db = require('../config/db');
const { categorizeComplaint } = require('../services/categorizationEngine');
const { evaluatePriority } = require('../services/priorityEngine');
const { checkForDuplicateComplaint } = require('../services/duplicateDetectionEngine');

/**
 * Submit a new campus complaint
 * Categorizes issue, suggests responsible department, detects priority, and checks for duplicates.
 */
async function submitComplaint(req, res) {
  try {
    const studentId = req.user.id;
    const { title, description, campus_location, room_number, category_id } = req.body;

    if (!title || !description || !campus_location || !room_number) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, campus location, and room or laboratory number are required.'
      });
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    // Reference tables
    const [categories] = await db.query('SELECT * FROM issue_categories');
    const [departments] = await db.query('SELECT * FROM departments');
    const [activeComplaints] = await db.query(
      "SELECT * FROM complaints WHERE status != 'Resolved' AND parent_complaint_id IS NULL"
    );

    // 1. Issue Categorization (uses student-provided category or rule-based auto categorization)
    let selectedCategoryId = category_id ? parseInt(category_id, 10) : null;
    let selectedCategoryName = '';

    if (!selectedCategoryId) {
      const catResult = categorizeComplaint(title, description, categories);
      selectedCategoryId = catResult.categoryId;
      selectedCategoryName = catResult.categoryName;
    } else {
      const matchedCat = categories.find(c => c.id === selectedCategoryId);
      selectedCategoryName = matchedCat ? matchedCat.name : 'General Maintenance';
    }

    // 2. Department Suggestion (maps category to department)
    let suggestedDepartmentId = null;
    let suggestedDepartmentName = 'Campus Helpdesk';

    const catObj = categories.find(c => c.id === selectedCategoryId);
    if (catObj && catObj.default_department_id) {
      suggestedDepartmentId = catObj.default_department_id;
    } else {
      // Map based on category code or ID
      if (selectedCategoryId === 1) suggestedDepartmentId = 1; // IT
      else if (selectedCategoryId === 2) suggestedDepartmentId = 5; // Tech AV
      else if (selectedCategoryId === 3) suggestedDepartmentId = 2; // Electrical
      else if (selectedCategoryId === 4) suggestedDepartmentId = 3; // Plumbing
      else if (selectedCategoryId === 5) suggestedDepartmentId = 4; // Infrastructure
      else suggestedDepartmentId = 1;
    }

    const depObj = departments.find(d => d.id === suggestedDepartmentId);
    if (depObj) suggestedDepartmentName = depObj.name;

    // 3. Priority Detection (HIGH, MEDIUM, LOW)
    const priorityResult = evaluatePriority(title, description, selectedCategoryName, 1);
    const assignedPriority = priorityResult.priority;

    // 4. Duplicate Complaint Detection
    const dupResult = checkForDuplicateComplaint(
      { title, description, campus_location, room_number, category_id: selectedCategoryId },
      activeComplaints
    );

    // If duplicate detected: Link report to existing master incident!
    if (dupResult.isDuplicate && dupResult.masterComplaint) {
      const masterCmp = dupResult.masterComplaint;

      await db.query(
        `INSERT INTO complaint_reports 
         (complaint_id, student_id, reported_title, reported_description, image_url, similarity_score, status) 
         VALUES (?, ?, ?, ?, ?, ?, 'Confirmed Duplicate')`,
        [
          masterCmp.id,
          studentId,
          title.trim(),
          description.trim(),
          imageUrl,
          dupResult.similarityScore
        ]
      );

      const newAffectedCount = (masterCmp.affected_student_count || 1) + 1;
      await db.query(
        'UPDATE complaints SET affected_student_count = ?, is_duplicate = TRUE WHERE id = ?',
        [newAffectedCount, masterCmp.id]
      );

      // Re-evaluate priority if affected student count grew
      if (newAffectedCount >= 3 && masterCmp.priority !== 'HIGH') {
        await db.query('UPDATE complaints SET priority = "HIGH" WHERE id = ?', [masterCmp.id]);
      }

      await db.query(
        `INSERT INTO complaint_history (complaint_id, changed_by, previous_status, new_status, comment) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          masterCmp.id,
          studentId,
          masterCmp.status,
          masterCmp.status,
          `Additional report linked from student. Total ${newAffectedCount} reports from this location.`
        ]
      );

      await db.query(
        'INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, "complaint", ?)',
        [
          studentId,
          'Duplicate Issue Linked',
          `Your report was merged with existing open issue #${masterCmp.complaint_number} at ${campus_location} (${room_number}). Total ${newAffectedCount} reports received.`,
          '/complaints'
        ]
      );

      return res.status(201).json({
        success: true,
        isDuplicate: true,
        message: `Possible duplicate issue detected! 3 or more reports from ${campus_location} (${room_number}). Your report has been associated with Incident #${masterCmp.complaint_number}.`,
        masterComplaint: {
          id: masterCmp.id,
          complaint_number: masterCmp.complaint_number,
          title: masterCmp.title,
          status: masterCmp.status,
          priority: masterCmp.priority,
          affected_student_count: newAffectedCount,
          similarityScore: dupResult.similarityScore,
          matchReasons: dupResult.matchReasons
        }
      });
    }

    // 5. Generate Complaint Number
    const yearStr = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const complaintNumber = `CMP-${yearStr}-${randomSuffix}`;

    // 6. Insert Master Complaint (Initial status: 'Pending')
    const [insertResult] = await db.query(
      `INSERT INTO complaints 
       (complaint_number, student_id, title, description, campus_location, room_number, category_id, department_id, priority, status, is_duplicate, parent_complaint_id, affected_student_count, image_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', FALSE, NULL, 1, ?)`,
      [
        complaintNumber,
        studentId,
        title.trim(),
        description.trim(),
        campus_location.trim(),
        room_number.trim(),
        selectedCategoryId,
        suggestedDepartmentId,
        assignedPriority,
        imageUrl
      ]
    );

    const complaintId = insertResult.insertId;

    // 7. Add Audit History Log
    await db.query(
      `INSERT INTO complaint_history (complaint_id, changed_by, previous_status, new_status, comment) 
       VALUES (?, ?, NULL, 'Pending', ?)`,
      [
        complaintId,
        studentId,
        `Complaint submitted by student. Categorized as "${selectedCategoryName}" with ${assignedPriority} priority, suggested department: ${suggestedDepartmentName}.`
      ]
    );

    // 8. Notification
    await db.query(
      'INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, "complaint", ?)',
      [
        studentId,
        'Complaint Submitted',
        `Your complaint #${complaintNumber} has been submitted and is Pending administrative routing.`,
        '/complaints'
      ]
    );

    res.status(201).json({
      success: true,
      isDuplicate: false,
      message: 'Complaint submitted successfully.',
      complaint: {
        id: complaintId,
        complaint_number: complaintNumber,
        title,
        campus_location,
        room_number,
        category: selectedCategoryName,
        department: suggestedDepartmentName,
        priority: assignedPriority,
        status: 'Pending',
        affected_student_count: 1
      }
    });
  } catch (error) {
    console.error('[SubmitComplaint Error]', error);
    res.status(500).json({ success: false, message: 'Failed to submit complaint: ' + error.message });
  }
}

/**
 * Get all complaints for logged-in student (master complaints + linked duplicate reports)
 */
async function getMyComplaints(req, res) {
  try {
    const studentId = req.user.id;

    const [masterRows] = await db.query(
      `SELECT c.*, ic.name AS category_name, d.name AS department_name 
       FROM complaints c 
       LEFT JOIN issue_categories ic ON c.category_id = ic.id 
       LEFT JOIN departments d ON c.department_id = d.id 
       WHERE c.student_id = ? 
       ORDER BY c.created_at DESC`,
      [studentId]
    );

    const [reportRows] = await db.query(
      `SELECT cr.*, c.complaint_number, c.campus_location, c.room_number, c.status AS master_status, c.priority, c.resolution_notes, ic.name AS category_name, d.name AS department_name 
       FROM complaint_reports cr 
       JOIN complaints c ON cr.complaint_id = c.id 
       LEFT JOIN issue_categories ic ON c.category_id = ic.id 
       LEFT JOIN departments d ON c.department_id = d.id 
       WHERE cr.student_id = ? 
       ORDER BY cr.created_at DESC`,
      [studentId]
    );

    res.json({
      success: true,
      masterComplaints: masterRows,
      linkedReports: reportRows,
      totalCount: masterRows.length + reportRows.length
    });
  } catch (error) {
    console.error('[GetMyComplaints Error]', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve complaints: ' + error.message });
  }
}

/**
 * Get complaint details by ID (including history timeline and duplicate reports)
 */
async function getComplaintById(req, res) {
  try {
    const complaintId = parseInt(req.params.id, 10);

    const [rows] = await db.query(
      `SELECT c.*, ic.name AS category_name, d.name AS department_name, u_stu.name AS student_name, u_stu.email AS student_email 
       FROM complaints c 
       LEFT JOIN issue_categories ic ON c.category_id = ic.id 
       LEFT JOIN departments d ON c.department_id = d.id 
       LEFT JOIN users u_stu ON c.student_id = u_stu.id 
       WHERE c.id = ?`,
      [complaintId]
    );

    const complaint = rows[0];
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    const isOwner = req.user.id === complaint.student_id;
    const isAdmin = req.user.role === 'admin';

    const [userReport] = await db.query(
      'SELECT id FROM complaint_reports WHERE complaint_id = ? AND student_id = ?',
      [complaintId, req.user.id]
    );

    if (!isOwner && !isAdmin && userReport.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const [history] = await db.query(
      `SELECT ch.*, u.name AS changed_by_name, u.role AS changed_by_role 
       FROM complaint_history ch 
       LEFT JOIN users u ON ch.changed_by = u.id 
       WHERE ch.complaint_id = ? 
       ORDER BY ch.created_at ASC`,
      [complaintId]
    );

    const [duplicateReports] = await db.query(
      `SELECT cr.*, u.name AS student_name, u.email AS student_email 
       FROM complaint_reports cr 
       LEFT JOIN users u ON cr.student_id = u.id 
       WHERE cr.complaint_id = ? 
       ORDER BY cr.created_at DESC`,
      [complaintId]
    );

    res.json({
      success: true,
      complaint: {
        ...complaint,
        history,
        duplicateReports
      }
    });
  } catch (error) {
    console.error('[GetComplaintById Error]', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve complaint: ' + error.message });
  }
}

/**
 * Get all complaints (Administrator view with filters)
 */
async function getAllComplaints(req, res) {
  try {
    const { status, priority, department_id, category_id, search, is_duplicate } = req.query;

    const [rows] = await db.query(
      `SELECT c.*, ic.name AS category_name, d.name AS department_name, u_stu.name AS student_name, u_stu.email AS student_email 
       FROM complaints c 
       LEFT JOIN issue_categories ic ON c.category_id = ic.id 
       LEFT JOIN departments d ON c.department_id = d.id 
       LEFT JOIN users u_stu ON c.student_id = u_stu.id 
       ORDER BY FIELD(c.priority, 'HIGH', 'MEDIUM', 'LOW'), c.created_at DESC`
    );

    let filtered = rows;

    if (status && status !== 'ALL') {
      filtered = filtered.filter(c => c.status === status);
    }

    if (priority && priority !== 'ALL') {
      filtered = filtered.filter(c => c.priority === priority);
    }

    if (department_id && department_id !== 'ALL') {
      filtered = filtered.filter(c => String(c.department_id) === String(department_id));
    }

    if (category_id && category_id !== 'ALL') {
      filtered = filtered.filter(c => String(c.category_id) === String(category_id));
    }

    if (is_duplicate === 'true') {
      filtered = filtered.filter(c => c.affected_student_count > 1 || c.is_duplicate);
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(c => 
        (c.title && c.title.toLowerCase().includes(q)) ||
        (c.complaint_number && c.complaint_number.toLowerCase().includes(q)) ||
        (c.campus_location && c.campus_location.toLowerCase().includes(q)) ||
        (c.room_number && c.room_number.toLowerCase().includes(q))
      );
    }

    res.json({
      success: true,
      total: filtered.length,
      complaints: filtered
    });
  } catch (error) {
    console.error('[GetAllComplaints Error]', error);
    res.status(500).json({ success: false, message: 'Failed to fetch complaints: ' + error.message });
  }
}

/**
 * Update complaint status & add resolution notes (Administrator action)
 * Statuses: 'Pending', 'Assigned', 'In Progress', 'Resolved'
 */
async function updateComplaintStatus(req, res) {
  try {
    const complaintId = parseInt(req.params.id, 10);
    const { status, resolution_notes, comment } = req.body;

    const validStatuses = ['Pending', 'Assigned', 'In Progress', 'Resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: [${validStatuses.join(', ')}]`
      });
    }

    const [rows] = await db.query('SELECT * FROM complaints WHERE id = ?', [complaintId]);
    const current = rows[0];
    if (!current) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    const prevStatus = current.status;
    const resolvedAt = status === 'Resolved' ? new Date() : current.resolved_at;

    await db.query(
      `UPDATE complaints SET 
        status = ?, 
        resolution_notes = COALESCE(?, resolution_notes), 
        resolved_at = ? 
       WHERE id = ?`,
      [status, resolution_notes || null, resolvedAt, complaintId]
    );

    const historyComment = comment || resolution_notes || `Status changed from ${prevStatus} to ${status}.`;
    await db.query(
      `INSERT INTO complaint_history (complaint_id, changed_by, previous_status, new_status, comment) 
       VALUES (?, ?, ?, ?, ?)`,
      [complaintId, req.user.id, prevStatus, status, historyComment]
    );

    // Notify student
    await db.query(
      `INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, 'complaint', ?)`,
      [
        current.student_id,
        `Complaint #${current.complaint_number} is now ${status}`,
        historyComment,
        '/complaints'
      ]
    );

    // Notify any linked duplicate reporters as well
    const [reporters] = await db.query('SELECT student_id FROM complaint_reports WHERE complaint_id = ?', [complaintId]);
    for (const r of reporters) {
      await db.query(
        `INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, 'complaint', ?)`,
        [
          r.student_id,
          `Incident #${current.complaint_number} is now ${status}`,
          historyComment,
          '/complaints'
        ]
      );
    }

    res.json({
      success: true,
      message: `Complaint #${current.complaint_number} status updated to ${status}.`
    });
  } catch (error) {
    console.error('[UpdateComplaintStatus Error]', error);
    res.status(500).json({ success: false, message: 'Failed to update status: ' + error.message });
  }
}

/**
 * Override complaint priority (Administrator action)
 */
async function updateComplaintPriority(req, res) {
  try {
    const complaintId = parseInt(req.params.id, 10);
    const { priority, reason } = req.body;

    const validPriorities = ['LOW', 'MEDIUM', 'HIGH'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid priority. Must be LOW, MEDIUM, or HIGH.'
      });
    }

    const [rows] = await db.query('SELECT * FROM complaints WHERE id = ?', [complaintId]);
    const current = rows[0];
    if (!current) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    await db.query('UPDATE complaints SET priority = ? WHERE id = ?', [priority, complaintId]);

    await db.query(
      `INSERT INTO complaint_history (complaint_id, changed_by, previous_status, new_status, comment) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        complaintId,
        req.user.id,
        current.status,
        current.status,
        `Priority updated to ${priority}. Reason: ${reason || 'Administrator adjustment.'}`
      ]
    );

    res.json({
      success: true,
      message: `Priority updated to ${priority}.`
    });
  } catch (error) {
    console.error('[UpdatePriority Error]', error);
    res.status(500).json({ success: false, message: 'Failed to update priority: ' + error.message });
  }
}

/**
 * Assign or reassign complaint to department (Administrator action)
 */
async function assignDepartment(req, res) {
  try {
    const complaintId = parseInt(req.params.id, 10);
    const { department_id, comment } = req.body;

    const [rows] = await db.query('SELECT * FROM complaints WHERE id = ?', [complaintId]);
    const current = rows[0];
    if (!current) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    const nextStatus = current.status === 'Pending' ? 'Assigned' : current.status;

    await db.query(
      `UPDATE complaints SET department_id = ?, status = ? WHERE id = ?`,
      [parseInt(department_id, 10), nextStatus, complaintId]
    );

    const [deptRows] = await db.query('SELECT name FROM departments WHERE id = ?', [department_id]);
    const deptName = deptRows[0]?.name || 'Department';

    await db.query(
      `INSERT INTO complaint_history (complaint_id, changed_by, previous_status, new_status, comment) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        complaintId,
        req.user.id,
        current.status,
        nextStatus,
        comment || `Complaint assigned to ${deptName}.`
      ]
    );

    res.json({ success: true, message: `Complaint assigned to ${deptName}.` });
  } catch (error) {
    console.error('[AssignDepartment Error]', error);
    res.status(500).json({ success: false, message: 'Failed to assign department: ' + error.message });
  }
}

/**
 * Get issue categories list
 */
async function getIssueCategories(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT ic.*, d.name AS default_department_name 
       FROM issue_categories ic 
       LEFT JOIN departments d ON ic.default_department_id = d.id 
       ORDER BY ic.id ASC`
    );

    const categories = rows.map(r => ({
      ...r,
      keywords: typeof r.keywords === 'string' ? JSON.parse(r.keywords || '[]') : (r.keywords || [])
    }));

    res.json({ success: true, categories });
  } catch (error) {
    console.error('[GetCategories Error]', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories: ' + error.message });
  }
}

/**
 * Get departments list
 */
async function getDepartments(req, res) {
  try {
    const [departments] = await db.query('SELECT * FROM departments ORDER BY name ASC');
    res.json({ success: true, departments });
  } catch (error) {
    console.error('[GetDepartments Error]', error);
    res.status(500).json({ success: false, message: 'Failed to fetch departments: ' + error.message });
  }
}

module.exports = {
  submitComplaint,
  getMyComplaints,
  getComplaintById,
  getAllComplaints,
  updateComplaintStatus,
  updateComplaintPriority,
  assignDepartment,
  getIssueCategories,
  getDepartments
};
