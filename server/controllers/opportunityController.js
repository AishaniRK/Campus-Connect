const db = require('../config/db');
const { evaluateOpportunityForStudent } = require('../services/recommendationEngine');

function parseJsonField(val, fallback = []) {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch (e) {
    return fallback;
  }
}

/**
 * Get all opportunities with advanced filtering & search
 */
async function getAllOpportunities(req, res) {
  try {
    const {
      category,
      branch,
      academic_year,
      skill,
      mode,
      search,
      approaching_deadline
    } = req.query;

    const [oppRows] = await db.query(
      `SELECT o.*, oc.name AS category_name, oc.icon AS category_icon, u.name AS posted_by_name 
       FROM opportunities o 
       LEFT JOIN opportunity_categories oc ON o.category_id = oc.id 
       LEFT JOIN users u ON o.posted_by = u.id 
       WHERE o.is_active = TRUE 
       ORDER BY o.application_deadline ASC`
    );

    let results = oppRows.map(opp => ({
      ...opp,
      eligible_branches: parseJsonField(opp.eligible_branches, ['ALL']),
      eligible_academic_years: parseJsonField(opp.eligible_academic_years, ['ALL']),
      required_skills: parseJsonField(opp.required_skills, [])
    }));

    // Filter by Category
    if (category && category !== 'ALL') {
      const catLower = category.toLowerCase();
      results = results.filter(o => 
        (o.category_name && o.category_name.toLowerCase() === catLower) ||
        String(o.category_id) === String(category) ||
        (o.opportunity_type && o.opportunity_type.toLowerCase() === catLower)
      );
    }

    // Filter by Branch
    if (branch && branch !== 'ALL') {
      const bUpper = branch.toUpperCase();
      results = results.filter(o => 
        o.eligible_branches.includes('ALL') || 
        o.eligible_branches.map(b => String(b).toUpperCase()).includes(bUpper)
      );
    }

    // Filter by Academic Year
    if (academic_year && academic_year !== 'ALL') {
      const yStr = String(academic_year);
      results = results.filter(o => 
        o.eligible_academic_years.includes('ALL') || 
        o.eligible_academic_years.map(String).includes(yStr)
      );
    }

    // Filter by Skill
    if (skill) {
      const sLower = skill.toLowerCase();
      results = results.filter(o => 
        o.required_skills.some(sk => sk.toLowerCase().includes(sLower))
      );
    }

    // Filter by Mode (Online, Offline, Hybrid)
    if (mode && mode !== 'ALL') {
      results = results.filter(o => o.mode && o.mode.toLowerCase() === mode.toLowerCase());
    }

    // Filter Approaching Deadline (within 7 days)
    if (approaching_deadline === 'true') {
      const today = new Date();
      const in7Days = new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000));
      results = results.filter(o => {
        const d = new Date(o.application_deadline);
        return d >= today && d <= in7Days;
      });
    }

    // Keyword Search
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      results = results.filter(o => 
        (o.title && o.title.toLowerCase().includes(q)) ||
        (o.description && o.description.toLowerCase().includes(q)) ||
        (o.organization_name && o.organization_name.toLowerCase().includes(q)) ||
        (o.required_skills && o.required_skills.some(s => s.toLowerCase().includes(q)))
      );
    }

    // If student, attach is_saved and recommendation preview
    if (req.user && req.user.role === 'student') {
      const studentId = req.user.id;
      const [savedRows] = await db.query('SELECT opportunity_id FROM saved_opportunities WHERE student_id = ?', [studentId]);
      const savedIds = new Set(savedRows.map(r => r.opportunity_id));

      const [profRows] = await db.query('SELECT * FROM student_profiles WHERE user_id = ?', [studentId]);
      const studentProfile = profRows[0] ? {
        ...profRows[0],
        skills: parseJsonField(profRows[0].skills, []),
        interests: parseJsonField(profRows[0].interests, [])
      } : null;

      results = results.map(opp => {
        const rec = evaluateOpportunityForStudent(opp, studentProfile);
        return {
          ...opp,
          is_saved: savedIds.has(opp.id),
          matchPercentage: rec.matchPercentage,
          isEligible: rec.isEligible,
          recommendationReasons: rec.reasons
        };
      });
    }

    res.json({
      success: true,
      total: results.length,
      opportunities: results
    });
  } catch (error) {
    console.error('[GetAllOpportunities Error]', error);
    res.status(500).json({ success: false, message: 'Failed to fetch opportunities: ' + error.message });
  }
}

/**
 * Get personalized recommendations for logged-in student
 */
async function getRecommendedOpportunities(req, res) {
  try {
    const studentId = req.user.id;

    const [profRows] = await db.query('SELECT * FROM student_profiles WHERE user_id = ?', [studentId]);
    if (!profRows[0]) {
      return res.status(400).json({
        success: false,
        message: 'Student profile not found. Please complete your profile to receive personalized recommendations.'
      });
    }

    const studentProfile = {
      ...profRows[0],
      skills: parseJsonField(profRows[0].skills, []),
      interests: parseJsonField(profRows[0].interests, [])
    };

    const [oppRows] = await db.query(
      `SELECT o.*, oc.name AS category_name, oc.icon AS category_icon 
       FROM opportunities o 
       LEFT JOIN opportunity_categories oc ON o.category_id = oc.id 
       WHERE o.is_active = TRUE AND o.application_deadline >= CURRENT_DATE 
       ORDER BY o.application_deadline ASC`
    );

    const [savedRows] = await db.query('SELECT opportunity_id FROM saved_opportunities WHERE student_id = ?', [studentId]);
    const savedIds = new Set(savedRows.map(r => r.opportunity_id));

    const recommendedList = [];

    for (const rawOpp of oppRows) {
      const opp = {
        ...rawOpp,
        eligible_branches: parseJsonField(rawOpp.eligible_branches, ['ALL']),
        eligible_academic_years: parseJsonField(rawOpp.eligible_academic_years, ['ALL']),
        required_skills: parseJsonField(rawOpp.required_skills, [])
      };

      const evaluation = evaluateOpportunityForStudent(opp, studentProfile);

      // Only recommend eligible opportunities
      if (evaluation.isEligible) {
        recommendedList.push({
          ...opp,
          is_saved: savedIds.has(opp.id),
          matchScore: evaluation.matchScore,
          matchPercentage: evaluation.matchPercentage,
          isEligible: evaluation.isEligible,
          recommendationReasons: evaluation.reasons,
          matchingSkills: evaluation.matchingSkills,
          missingSkills: evaluation.missingSkills
        });
      }
    }

    // Sort descending by match percentage
    recommendedList.sort((a, b) => b.matchPercentage - a.matchPercentage);

    res.json({
      success: true,
      total: recommendedList.length,
      studentDetails: {
        branch: studentProfile.branch,
        academic_year: studentProfile.academic_year,
        skillsCount: studentProfile.skills.length,
        interestsCount: studentProfile.interests.length
      },
      recommendedOpportunities: recommendedList
    });
  } catch (error) {
    console.error('[GetRecommended Error]', error);
    res.status(500).json({ success: false, message: 'Failed to generate recommendations: ' + error.message });
  }
}

/**
 * Get opportunity by ID
 */
async function getOpportunityById(req, res) {
  try {
    const oppId = parseInt(req.params.id, 10);

    const [rows] = await db.query(
      `SELECT o.*, oc.name AS category_name, oc.icon AS category_icon, u.name AS posted_by_name 
       FROM opportunities o 
       LEFT JOIN opportunity_categories oc ON o.category_id = oc.id 
       LEFT JOIN users u ON o.posted_by = u.id 
       WHERE o.id = ?`,
      [oppId]
    );

    const rawOpp = rows[0];
    if (!rawOpp) {
      return res.status(404).json({ success: false, message: 'Opportunity not found.' });
    }

    await db.query('UPDATE opportunities SET view_count = view_count + 1 WHERE id = ?', [oppId]);

    const opp = {
      ...rawOpp,
      view_count: (rawOpp.view_count || 0) + 1,
      eligible_branches: parseJsonField(rawOpp.eligible_branches, ['ALL']),
      eligible_academic_years: parseJsonField(rawOpp.eligible_academic_years, ['ALL']),
      required_skills: parseJsonField(rawOpp.required_skills, [])
    };

    let isSaved = false;
    let recommendation = null;

    if (req.user && req.user.role === 'student') {
      const studentId = req.user.id;
      const [saved] = await db.query('SELECT id FROM saved_opportunities WHERE student_id = ? AND opportunity_id = ?', [studentId, oppId]);
      isSaved = saved.length > 0;

      const [prof] = await db.query('SELECT * FROM student_profiles WHERE user_id = ?', [studentId]);
      if (prof[0]) {
        const profObj = {
          ...prof[0],
          skills: parseJsonField(prof[0].skills, []),
          interests: parseJsonField(prof[0].interests, [])
        };
        recommendation = evaluateOpportunityForStudent(opp, profObj);
      }
    }

    res.json({
      success: true,
      opportunity: {
        ...opp,
        is_saved: isSaved,
        recommendation
      }
    });
  } catch (error) {
    console.error('[GetOpportunityById Error]', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve opportunity: ' + error.message });
  }
}

/**
 * Bookmark / Save opportunity
 */
async function saveOpportunity(req, res) {
  try {
    const studentId = req.user.id;
    const oppId = parseInt(req.params.id, 10);

    if (isNaN(oppId)) {
      return res.status(400).json({ success: false, message: 'Invalid opportunity ID.' });
    }

    // Check if opportunity exists
    const [oppRows] = await db.query('SELECT id FROM opportunities WHERE id = ?', [oppId]);
    if (!oppRows || oppRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Opportunity not found.' });
    }

    // Insert or update timestamp if already saved
    await db.query(
      'INSERT INTO saved_opportunities (student_id, opportunity_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE saved_at = CURRENT_TIMESTAMP',
      [studentId, oppId]
    );

    res.json({ success: true, message: 'Opportunity bookmarked successfully.' });
  } catch (error) {
    console.error('[SaveOpportunity Error]', error);
    res.status(500).json({ success: false, message: 'Failed to save opportunity: ' + error.message });
  }
}

/**
 * Remove bookmark
 */
async function unsaveOpportunity(req, res) {
  try {
    const studentId = req.user.id;
    const oppId = parseInt(req.params.id, 10);

    if (isNaN(oppId)) {
      return res.status(400).json({ success: false, message: 'Invalid opportunity ID.' });
    }

    await db.query(
      'DELETE FROM saved_opportunities WHERE student_id = ? AND opportunity_id = ?',
      [studentId, oppId]
    );

    res.json({ success: true, message: 'Opportunity removed from bookmarks.' });
  } catch (error) {
    console.error('[UnsaveOpportunity Error]', error);
    res.status(500).json({ success: false, message: 'Failed to remove saved opportunity: ' + error.message });
  }
}

/**
 * Get student's bookmarked opportunities
 */
async function getSavedOpportunities(req, res) {
  try {
    const studentId = req.user.id;

    const [rows] = await db.query(
      `SELECT o.*, oc.name AS category_name, oc.icon AS category_icon, so.saved_at 
       FROM saved_opportunities so 
       JOIN opportunities o ON so.opportunity_id = o.id 
       LEFT JOIN opportunity_categories oc ON o.category_id = oc.id 
       WHERE so.student_id = ? 
       ORDER BY so.saved_at DESC`,
      [studentId]
    );

    const saved = rows.map(r => ({
      ...r,
      is_saved: true,
      eligible_branches: parseJsonField(r.eligible_branches, ['ALL']),
      eligible_academic_years: parseJsonField(r.eligible_academic_years, ['ALL']),
      required_skills: parseJsonField(r.required_skills, [])
    }));

    res.json({
      success: true,
      total: saved.length,
      savedOpportunities: saved
    });
  } catch (error) {
    console.error('[GetSaved Error]', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve saved opportunities: ' + error.message });
  }
}

/**
 * Get opportunity categories
 */
async function getOpportunityCategories(req, res) {
  try {
    const [categories] = await db.query('SELECT * FROM opportunity_categories ORDER BY name ASC');
    res.json({ success: true, categories });
  } catch (error) {
    console.error('[GetCategories Error]', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories: ' + error.message });
  }
}

/**
 * Admin: Create opportunity
 */
async function createOpportunity(req, res) {
  try {
    const {
      title,
      description,
      category_id,
      opportunity_type,
      organization_name,
      eligible_branches,
      eligible_academic_years,
      required_skills,
      mode = 'Online',
      location = 'Virtual / Remote',
      registration_link,
      application_deadline,
      eligibility_requirements,
      stipend_or_prize
    } = req.body;

    if (!title || !description || !category_id || !organization_name || !registration_link || !application_deadline) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, category, organization, registration link, and deadline are required.'
      });
    }

    const branchesJson = JSON.stringify(Array.isArray(eligible_branches) ? eligible_branches : ['ALL']);
    const yearsJson = JSON.stringify(Array.isArray(eligible_academic_years) ? eligible_academic_years : ['ALL']);
    const skillsJson = JSON.stringify(Array.isArray(required_skills) ? required_skills : (required_skills ? String(required_skills).split(',').map(s => s.trim()) : []));

    const [result] = await db.query(
      `INSERT INTO opportunities 
       (title, description, category_id, opportunity_type, organization_name, eligible_branches, eligible_academic_years, required_skills, mode, location, registration_link, application_deadline, eligibility_requirements, stipend_or_prize, posted_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        description.trim(),
        parseInt(category_id, 10),
        opportunity_type || 'Opportunity',
        organization_name.trim(),
        branchesJson,
        yearsJson,
        skillsJson,
        mode,
        location,
        registration_link.trim(),
        application_deadline,
        eligibility_requirements || 'Standard student eligibility applies.',
        stipend_or_prize || 'Certificate & Perks',
        req.user.id
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Opportunity created successfully.',
      opportunityId: result.insertId
    });
  } catch (error) {
    console.error('[CreateOpportunity Error]', error);
    res.status(500).json({ success: false, message: 'Failed to create opportunity: ' + error.message });
  }
}

/**
 * Admin: Update opportunity
 */
async function updateOpportunity(req, res) {
  try {
    const oppId = parseInt(req.params.id, 10);
    const {
      title,
      description,
      category_id,
      opportunity_type,
      organization_name,
      eligible_branches,
      eligible_academic_years,
      required_skills,
      mode,
      location,
      registration_link,
      application_deadline,
      eligibility_requirements,
      stipend_or_prize,
      is_active
    } = req.body;

    const branchesJson = eligible_branches ? JSON.stringify(eligible_branches) : null;
    const yearsJson = eligible_academic_years ? JSON.stringify(eligible_academic_years) : null;
    const skillsJson = required_skills ? JSON.stringify(Array.isArray(required_skills) ? required_skills : String(required_skills).split(',').map(s => s.trim())) : null;

    await db.query(
      `UPDATE opportunities SET 
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        category_id = COALESCE(?, category_id),
        opportunity_type = COALESCE(?, opportunity_type),
        organization_name = COALESCE(?, organization_name),
        eligible_branches = COALESCE(?, eligible_branches),
        eligible_academic_years = COALESCE(?, eligible_academic_years),
        required_skills = COALESCE(?, required_skills),
        mode = COALESCE(?, mode),
        location = COALESCE(?, location),
        registration_link = COALESCE(?, registration_link),
        application_deadline = COALESCE(?, application_deadline),
        eligibility_requirements = COALESCE(?, eligibility_requirements),
        stipend_or_prize = COALESCE(?, stipend_or_prize),
        is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [
        title || null,
        description || null,
        category_id ? parseInt(category_id, 10) : null,
        opportunity_type || null,
        organization_name || null,
        branchesJson,
        yearsJson,
        skillsJson,
        mode || null,
        location || null,
        registration_link || null,
        application_deadline || null,
        eligibility_requirements || null,
        stipend_or_prize || null,
        is_active !== undefined ? is_active : null,
        oppId
      ]
    );

    res.json({ success: true, message: 'Opportunity updated successfully.' });
  } catch (error) {
    console.error('[UpdateOpportunity Error]', error);
    res.status(500).json({ success: false, message: 'Failed to update opportunity: ' + error.message });
  }
}

/**
 * Admin: Delete opportunity
 */
async function deleteOpportunity(req, res) {
  try {
    const oppId = parseInt(req.params.id, 10);
    await db.query('DELETE FROM opportunities WHERE id = ?', [oppId]);
    res.json({ success: true, message: 'Opportunity deleted successfully.' });
  } catch (error) {
    console.error('[DeleteOpportunity Error]', error);
    res.status(500).json({ success: false, message: 'Failed to delete opportunity: ' + error.message });
  }
}

module.exports = {
  getAllOpportunities,
  getRecommendedOpportunities,
  getOpportunityById,
  saveOpportunity,
  unsaveOpportunity,
  getSavedOpportunities,
  getOpportunityCategories,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity
};
