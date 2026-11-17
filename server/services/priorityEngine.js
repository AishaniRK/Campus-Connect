/**
 * Priority Classification Engine
 * Analyzes issue context, severity keywords, location scope,
 * and affected reports to compute rule-based priority.
 */

const HIGH_PRIORITY_KEYWORDS = [
  'outage', 'blackout', 'hazard', 'fire', 'shock', 'spark', 'electric shock',
  'short circuit', 'major leakage', 'burst', 'flood', 'flooding', 'emergency',
  'entire lab', 'whole class', 'whole lab', 'all computers', 'server down',
  'critical', 'dangerous', 'burning', 'smoke', 'gas leak', 'complete failure',
  'unusable', 'down for all'
];

const MEDIUM_PRIORITY_KEYWORDS = [
  'projector', 'malfunctioning', 'multiple fans', 'fan not working', 'ac not working',
  'not cooling', 'display', 'screen', 'speaker', 'audio', 'mic', 'camera',
  'ups beeping', 'slow internet', 'flickering', 'clogged', 'sink overflow',
  'switch broken', 'socket not working', 'single computer'
];

const LOW_PRIORITY_KEYWORDS = [
  'chair', 'desk', 'bench', 'furniture', 'door handle', 'window', 'curtain',
  'whiteboard', 'paint', 'scratch', 'loose', 'minor', 'non-urgent', 'creaking',
  'cosmetic', 'dusty'
];

/**
 * Evaluates complaint priority based on rules
 * @param {string} title
 * @param {string} description
 * @param {string} categoryCodeOrName
 * @param {number} affectedCount
 * @returns {Object} { priority: 'HIGH' | 'MEDIUM' | 'LOW', reason: string }
 */
function evaluatePriority(title, description, categoryCodeOrName = '', affectedCount = 1) {
  const fullText = `${title} ${description}`.toLowerCase();

  // Rule 1: High student impact (crowd report)
  if (affectedCount >= 3) {
    return {
      priority: 'HIGH',
      reason: `Widespread issue impacting ${affectedCount} reported students in the same location.`
    };
  }

  // Rule 2: High severity hazard or complete outage keywords
  for (const kw of HIGH_PRIORITY_KEYWORDS) {
    if (fullText.includes(kw)) {
      return {
        priority: 'HIGH',
        reason: `Matched critical hazard/outage indicator: "${kw}".`
      };
    }
  }

  // Rule 3: Category default overrides
  const normCategory = (categoryCodeOrName || '').toLowerCase();
  if (normCategory.includes('network') && (fullText.includes('down') || fullText.includes('disconnected') || fullText.includes('lab'))) {
    return {
      priority: 'HIGH',
      reason: 'Laboratory network connectivity interruption affecting student coursework.'
    };
  }

  // Rule 4: Medium severity keywords
  for (const kw of MEDIUM_PRIORITY_KEYWORDS) {
    if (fullText.includes(kw)) {
      return {
        priority: 'MEDIUM',
        reason: `Matched classroom instruction equipment indicator: "${kw}".`
      };
    }
  }

  // Rule 5: Low severity keywords
  for (const kw of LOW_PRIORITY_KEYWORDS) {
    if (fullText.includes(kw)) {
      return {
        priority: 'LOW',
        reason: `Matched routine infrastructure maintenance indicator: "${kw}".`
      };
    }
  }

  // Default to MEDIUM if unspecified
  return {
    priority: 'MEDIUM',
    reason: 'Standard campus maintenance priority.'
  };
}

module.exports = {
  evaluatePriority,
  HIGH_PRIORITY_KEYWORDS,
  MEDIUM_PRIORITY_KEYWORDS,
  LOW_PRIORITY_KEYWORDS
};

