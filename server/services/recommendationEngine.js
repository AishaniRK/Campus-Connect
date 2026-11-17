/**
 * Recommendation Engine for Campus Opportunities
 * Computes rule-based matching scores, checks mandatory eligibility,
 * and provides clear explanations of why an opportunity is recommended.
 */

function evaluateOpportunityForStudent(opportunity, studentProfile) {
  if (!studentProfile) {
    return {
      matchScore: 0,
      matchPercentage: 0,
      isEligible: true,
      reasons: ['Complete your profile to receive personalized recommendations.'],
      matchingSkills: [],
      missingSkills: []
    };
  }

  const studentBranch = (studentProfile.branch || '').toUpperCase().trim();
  const studentYear = parseInt(studentProfile.academic_year, 10);
  const studentSkills = (studentProfile.skills || []).map(s => s.toLowerCase().trim());
  const studentInterests = (studentProfile.interests || []).map(i => i.toLowerCase().trim());

  // Parse opportunity eligibility
  let eligibleBranches = opportunity.eligible_branches || [];
  if (typeof eligibleBranches === 'string') {
    try { eligibleBranches = JSON.parse(eligibleBranches); } catch (e) { eligibleBranches = [eligibleBranches]; }
  }
  eligibleBranches = eligibleBranches.map(b => String(b).toUpperCase().trim());

  let eligibleYears = opportunity.eligible_academic_years || [];
  if (typeof eligibleYears === 'string') {
    try { eligibleYears = JSON.parse(eligibleYears); } catch (e) { eligibleYears = [eligibleYears]; }
  }
  eligibleYears = eligibleYears.map(y => String(y).trim());

  let requiredSkills = opportunity.required_skills || [];
  if (typeof requiredSkills === 'string') {
    try { requiredSkills = JSON.parse(requiredSkills); } catch (e) { requiredSkills = []; }
  }

  // 1. Mandatory Eligibility Check
  const branchEligible = eligibleBranches.includes('ALL') || eligibleBranches.includes(studentBranch);
  const yearEligible = eligibleYears.includes('ALL') || eligibleYears.map(String).includes(String(studentYear));

  if (!branchEligible || !yearEligible) {
    const ineligibleReasons = [];
    if (!branchEligible) {
      ineligibleReasons.push(`Requires branch in [${eligibleBranches.join(', ')}], you are in ${studentBranch || 'N/A'}`);
    }
    if (!yearEligible) {
      ineligibleReasons.push(`Requires academic year in [${eligibleYears.join(', ')}], you are in Year ${studentYear || 'N/A'}`);
    }

    return {
      matchScore: 0,
      matchPercentage: 0,
      isEligible: false,
      reasons: ineligibleReasons,
      matchingSkills: [],
      missingSkills: requiredSkills
    };
  }

  // 2. Score Calculation (Max 100 points)
  let score = 0;
  const reasons = [];

  // A. Branch Alignment (Max 25 pts)
  if (eligibleBranches.includes(studentBranch)) {
    score += 25;
    reasons.push(`Directly targets your branch: ${studentBranch}`);
  } else if (eligibleBranches.includes('ALL')) {
    score += 18;
    reasons.push(`Open to all departments including ${studentBranch}`);
  }

  // B. Academic Year Alignment (Max 25 pts)
  if (eligibleYears.map(String).includes(String(studentYear))) {
    score += 25;
    reasons.push(`Specifically tailored for Year ${studentYear} students`);
  } else if (eligibleYears.includes('ALL')) {
    score += 18;
    reasons.push(`Open to all academic years`);
  }

  // C. Skills Overlap (Max 35 pts)
  const matchingSkills = [];
  const missingSkills = [];

  for (const reqSkill of requiredSkills) {
    const normalizedReq = reqSkill.toLowerCase().trim();
    const hasSkill = studentSkills.some(s => s.includes(normalizedReq) || normalizedReq.includes(s));
    if (hasSkill) {
      matchingSkills.push(reqSkill);
    } else {
      missingSkills.push(reqSkill);
    }
  }

  if (requiredSkills.length > 0) {
    const skillRatio = matchingSkills.length / requiredSkills.length;
    const skillPoints = Math.round(skillRatio * 35);
    score += skillPoints;

    if (matchingSkills.length > 0) {
      reasons.push(`Matches ${matchingSkills.length} of your skills (${matchingSkills.join(', ')})`);
    }
  } else {
    // If no specific skills required, give default skill points
    score += 25;
    reasons.push('No prerequisites needed for entry');
  }

  // D. Interests & Domain Alignment (Max 15 pts)
  const oppText = `${opportunity.title} ${opportunity.description} ${opportunity.opportunity_type || ''}`.toLowerCase();
  const matchedInterests = [];

  for (const interest of studentInterests) {
    if (oppText.includes(interest)) {
      matchedInterests.push(interest);
    }
  }

  if (matchedInterests.length > 0) {
    const interestPoints = Math.min(15, matchedInterests.length * 8);
    score += interestPoints;
    reasons.push(`Aligns with your interests in ${matchedInterests.slice(0, 3).join(', ')}`);
  }

  // Cap score at 98% (unless perfect 100)
  const finalPercentage = Math.min(100, Math.max(10, score));

  return {
    matchScore: score,
    matchPercentage: finalPercentage,
    isEligible: true,
    reasons,
    matchingSkills,
    missingSkills
  };
}

module.exports = {
  evaluateOpportunityForStudent
};

