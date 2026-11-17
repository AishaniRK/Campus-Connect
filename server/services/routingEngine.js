/**
 * Department Routing Engine
 * Maps categorized complaints to the responsible department and designated staff member
 * based on configurable administrator routing rules.
 */

function matchLocationPattern(pattern, location, room) {
  if (!pattern || pattern === '*' || pattern === 'ALL') return true;
  const p = pattern.toLowerCase().replace(/\*/g, '.*');
  const regex = new RegExp(`^${p}$`, 'i');
  return regex.test(location.toLowerCase()) || regex.test(room.toLowerCase()) || regex.test(`${location} ${room}`.toLowerCase());
}

/**
 * Routes a complaint to the appropriate department and staff member
 * 
 * @param {Object} complaint - { category_id, campus_location, room_number }
 * @param {Array} routingRules - Array of active routing rules
 * @param {Array} departments - Array of departments
 * @param {Array} staffList - Array of staff members/profiles
 * @returns {Object} Routing decision
 */
function routeComplaint(complaint, routingRules = [], departments = [], staffList = []) {
  const { category_id, campus_location, room_number } = complaint;

  // 1. Check custom routing rules in order of specificity
  for (const rule of routingRules) {
    if (!rule.is_active) continue;

    const categoryMatches = Number(rule.category_id) === Number(category_id);
    const locationMatches = matchLocationPattern(rule.location_pattern, campus_location || '', room_number || '');

    if (categoryMatches && locationMatches) {
      const dep = departments.find(d => d.id === Number(rule.department_id));
      let assignedStaff = null;

      if (rule.assigned_staff_id) {
        assignedStaff = staffList.find(s => (s.user_id === Number(rule.assigned_staff_id) || s.id === Number(rule.assigned_staff_id)));
      }

      // If no specific staff assigned in rule, pick first staff of that department
      if (!assignedStaff && dep) {
        assignedStaff = staffList.find(s => Number(s.department_id) === dep.id);
      }

      return {
        departmentId: dep ? dep.id : Number(rule.department_id),
        departmentName: dep ? dep.name : 'Assigned Department',
        assignedTo: assignedStaff ? (assignedStaff.user_id || assignedStaff.id) : null,
        assignedStaffName: assignedStaff ? (assignedStaff.name || assignedStaff.designation) : null,
        priorityOverride: (rule.priority_override && rule.priority_override !== 'NONE') ? rule.priority_override : null,
        ruleApplied: rule.rule_name,
        autoRouted: true
      };
    }
  }

  // 2. Default fallback routing based on category
  // If no specific rule matched, check department associated with category
  if (departments.length > 0) {
    // Check if category maps to an obvious department
    let fallbackDep = null;
    if (category_id === 1) fallbackDep = departments.find(d => d.code === 'IT') || departments[0];
    else if (category_id === 2) fallbackDep = departments.find(d => d.code === 'LAB' || d.code === 'IT') || departments[0];
    else if (category_id === 3) fallbackDep = departments.find(d => d.code === 'ELEC') || departments[0];
    else if (category_id === 4) fallbackDep = departments.find(d => d.code === 'PLUMB') || departments[0];
    else if (category_id === 5) fallbackDep = departments.find(d => d.code === 'CIVIL') || departments[0];
    else fallbackDep = departments[0];

    const assignedStaff = staffList.find(s => Number(s.department_id) === (fallbackDep ? fallbackDep.id : 1));

    return {
      departmentId: fallbackDep ? fallbackDep.id : 1,
      departmentName: fallbackDep ? fallbackDep.name : 'Campus Administration',
      assignedTo: assignedStaff ? (assignedStaff.user_id || assignedStaff.id) : null,
      assignedStaffName: assignedStaff ? (assignedStaff.name || assignedStaff.designation) : null,
      priorityOverride: null,
      ruleApplied: 'Default Category Routing',
      autoRouted: true
    };
  }

  return {
    departmentId: 1,
    departmentName: 'Campus Helpdesk',
    assignedTo: null,
    assignedStaffName: null,
    priorityOverride: null,
    ruleApplied: 'System Default',
    autoRouted: false
  };
}

module.exports = {
  routeComplaint,
  matchLocationPattern
};

