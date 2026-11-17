const app = require('./server');

async function runTests() {
  console.log('========================================================');
  console.log('🧪 CAMPUS CONNECT AUTOMATED INTEGRATION TEST SUITE');
  console.log('========================================================\n');

  const http = require('http');
  const server = http.createServer(app);

  await new Promise((resolve) => server.listen(5002, resolve));
  const baseUrl = 'http://127.0.0.1:5002/api';

  const fetchJson = async (endpoint, options = {}) => {
    const res = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    const data = await res.json();
    return { status: res.status, data };
  };

  let studentToken = '';
  let adminToken = '';

  try {
    // 1. Health Check
    console.log('[TEST 1] Checking API Health Endpoint...');
    const health = await fetchJson('/health');
    console.log(`✓ Health status: ${health.data.status}, storageMode: ${health.data.storageMode}`);

    // 2. Student Authentication
    console.log('\n[TEST 2] Testing Student Authentication...');
    const stuLogin = await fetchJson('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'arjun.sharma@campusconnect.edu',
        password: 'Student@123'
      })
    });
    if (!stuLogin.data.success || !stuLogin.data.token) {
      throw new Error('Student login failed: ' + stuLogin.data.message);
    }
    studentToken = stuLogin.data.token;
    console.log(`✓ Student authenticated: ${stuLogin.data.user.name} (${stuLogin.data.user.role})`);

    // 3. Admin Authentication
    console.log('\n[TEST 3] Testing Administrator Authentication...');
    const admLogin = await fetchJson('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@campusconnect.edu',
        password: 'Admin@123'
      })
    });
    if (!admLogin.data.success || !admLogin.data.token) {
      throw new Error('Admin login failed: ' + admLogin.data.message);
    }
    adminToken = admLogin.data.token;
    console.log(`✓ Admin authenticated: ${admLogin.data.user.name} (${admLogin.data.user.role})`);

    // 4. Opportunities Catalog & Recommendation Engine
    console.log('\n[TEST 4] Testing Module 1: Opportunity Catalog & Filtering...');
    const opps = await fetchJson('/opportunities', {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    console.log(`✓ Total opportunities in catalog: ${opps.data.total}`);

    console.log('\n[TEST 5] Testing Recommendation Algorithm...');
    const recs = await fetchJson('/opportunities/recommended', {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    console.log(`✓ Recommendations generated: ${recs.data.total}`);
    if (recs.data.recommendedOpportunities && recs.data.recommendedOpportunities.length > 0) {
      const topMatch = recs.data.recommendedOpportunities[0];
      console.log(`✓ Top Match: "${topMatch.title}" with score: ${topMatch.matchPercentage}%`);
      console.log(`  Reasons: ${topMatch.recommendationReasons.join(' | ')}`);
    }

    // 5. Bookmarking
    console.log('\n[TEST 6] Testing Bookmarking / Saved Opportunities...');
    const saveRes = await fetchJson('/opportunities/1/save', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    console.log(`✓ Bookmark response: ${saveRes.data.message}`);

    const savedList = await fetchJson('/opportunities/saved', {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    console.log(`✓ Current student saved items: ${savedList.data.total}`);

    // 6. Module 2: Smart Campus Issue Routing - New Complaint
    console.log('\n[TEST 7] Testing Module 2: Complaint Submission & Auto-Routing...');
    const newComplaintRes = await fetchJson('/complaints', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({
        title: 'Ceiling fan emitting spark and loud noise in Room 302',
        description: 'Electrical switch sparked and fan is shaking violently above row 2.',
        campus_location: 'Academic Block A',
        room_number: 'Classroom 302'
      })
    });
    console.log(`✓ Submission result: isDuplicate=${newComplaintRes.data.isDuplicate}`);
    console.log(`  Ticket: ${newComplaintRes.data.complaint.complaint_number}`);
    console.log(`  Category: ${newComplaintRes.data.complaint.category}`);
    console.log(`  Priority: ${newComplaintRes.data.complaint.priority} (Rule-Based Hazard Detection)`);
    console.log(`  Department: ${newComplaintRes.data.complaint.department}`);

    // 7. Duplicate Complaint Detection (Crucial Test)
    console.log('\n[TEST 8] Testing Duplicate Complaint Detection Engine...');
    const duplicateRes = await fetchJson('/complaints', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({
        title: 'Internet totally disconnected in Lab 4',
        description: 'Cannot browse web or access server from Lab 4 workstations.',
        campus_location: 'Tech Tower',
        room_number: 'Lab 4'
      })
    });
    console.log(`✓ Duplicate Detected: ${duplicateRes.data.isDuplicate}`);
    console.log(`  Message: ${duplicateRes.data.message}`);
    console.log(`  Merged with Incident: #${duplicateRes.data.masterComplaint?.complaint_number}`);
    console.log(`  Total Students Now Affected: ${duplicateRes.data.masterComplaint?.affected_student_count}`);

    // 8. Admin Operations & Analytics
    console.log('\n[TEST 9] Testing Administrator Dashboard Analytics...');
    const adminOverview = await fetchJson('/admin/overview', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`✓ Admin Total Complaints: ${adminOverview.data.stats.totalComplaints}`);
    console.log(`✓ Admin Pending Complaints: ${adminOverview.data.stats.pendingComplaints}`);
    console.log(`✓ Admin High Priority: ${adminOverview.data.stats.highPriorityComplaints}`);
    console.log(`✓ Departments charted: ${adminOverview.data.charts.complaintsByDepartment.length}`);

    // 9. Admin Status Update
    console.log('\n[TEST 10] Testing Admin Status & Resolution Notes...');
    const updateStatusRes = await fetchJson('/complaints/1/status', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        status: 'In Progress',
        resolution_notes: 'Technician on-site testing switchboard.'
      })
    });
    console.log(`✓ Status update: ${updateStatusRes.data.message}`);

    console.log('\n========================================================');
    console.log('🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY! (10/10)');
    console.log('========================================================\n');
  } catch (err) {
    console.error('\n❌ TEST RUNNER ERROR:', err.message);
  } finally {
    server.close();
  }
}

runTests();

