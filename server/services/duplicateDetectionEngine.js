const { calculateJaccardSimilarity, areLocationsMatching, tokenize } = require('../utils/textSimilarity');

/**
 * Duplicate Complaint Detection Engine
 * Evaluates candidate unresolved complaints against a newly submitted complaint
 * using multi-factor matching: Location + Room + Category + Semantic Text Similarity.
 */

const UNRESOLVED_STATUSES = ['Submitted', 'Under Review', 'Assigned', 'In Progress'];

/**
 * Detects whether a newly submitted complaint is a duplicate of an existing unresolved incident.
 * 
 * @param {Object} newComplaint - { title, description, campus_location, room_number, category_id }
 * @param {Array} existingComplaints - List of all complaints from database/store
 * @returns {Object} Duplicate analysis result
 */
function checkForDuplicateComplaint(newComplaint, existingComplaints = []) {
  const { title, description, campus_location, room_number, category_id } = newComplaint;

  // Filter candidates: only active unresolved master complaints within last 14 days
  const fourteenDaysAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
  const candidates = existingComplaints.filter(c => {
    // Exclude resolved or rejected
    if (!UNRESOLVED_STATUSES.includes(c.status)) return false;
    // Exclude already marked secondary duplicates
    if (c.parent_complaint_id !== null && c.parent_complaint_id !== undefined) return false;
    // Exclude very old complaints if created_at is available
    if (c.created_at && new Date(c.created_at).getTime() < fourteenDaysAgo) return false;
    return true;
  });

  if (candidates.length === 0) {
    return {
      isDuplicate: false,
      masterComplaint: null,
      similarityScore: 0,
      matchReasons: []
    };
  }

  let bestMatch = null;
  let highestScore = 0;
  let bestReasons = [];

  for (const candidate of candidates) {
    let score = 0;
    const reasons = [];

    // 1. Location & Room Match
    const locMatch = areLocationsMatching(
      campus_location || '',
      candidate.campus_location || '',
      room_number || '',
      candidate.room_number || ''
    );

    // If locations are completely different, do not consider as duplicate
    if (!locMatch.isSameBuilding && !locMatch.isSameRoom) {
      continue;
    }

    if (locMatch.isSameBuilding) {
      score += 25;
      reasons.push(`Same campus building/area (${candidate.campus_location})`);
    }

    if (locMatch.isSameRoom) {
      score += 35;
      reasons.push(`Exact room or laboratory match (${candidate.room_number})`);
    }

    // 2. Category Match
    if (Number(candidate.category_id) === Number(category_id) && category_id) {
      score += 20;
      reasons.push('Identical issue category');
    }

    // 3. Text Similarity on Title and Description
    const textA = `${title} ${description}`;
    const textB = `${candidate.title} ${candidate.description}`;
    const jaccard = calculateJaccardSimilarity(textA, textB);
    const textPoints = Math.round(jaccard * 20);
    score += textPoints;

    // Check shared key tokens
    const tokensA = new Set(tokenize(textA));
    const tokensB = new Set(tokenize(textB));
    const sharedTokens = [...tokensA].filter(t => tokensB.has(t));

    if (sharedTokens.length > 0) {
      reasons.push(`Shared symptom keywords: "${sharedTokens.slice(0, 4).join(', ')}"`);
    }

    // Cap score at 100
    const finalScore = Math.min(100, score);

    if (finalScore > highestScore) {
      highestScore = finalScore;
      bestMatch = candidate;
      bestReasons = reasons;
    }
  }

  // Threshold: >= 65 points is considered a duplicate incident
  const isDuplicate = highestScore >= 65 && bestMatch !== null;

  return {
    isDuplicate,
    masterComplaint: bestMatch,
    similarityScore: highestScore,
    matchReasons: bestReasons
  };
}

module.exports = {
  checkForDuplicateComplaint,
  UNRESOLVED_STATUSES
};

