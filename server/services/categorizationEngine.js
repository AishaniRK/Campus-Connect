const { tokenize } = require('../utils/textSimilarity');

/**
 * Categorizes a complaint based on its title and description using keyword dictionaries.
 * Allows dynamic keyword lists from the database.
 * 
 * @param {string} title - Complaint title
 * @param {string} description - Complaint description
 * @param {Array} categories - Array of issue category rows from database
 * @returns {Object} { categoryId, categoryName, confidenceScore, isConfident, matchedKeywords }
 */
function categorizeComplaint(title, description, categories) {
  const titleTokens = tokenize(title);
  const descTokens = tokenize(description);

  // Fallback if no categories provided
  if (!categories || categories.length === 0) {
    return {
      categoryId: null,
      categoryName: 'Unclassified',
      confidenceScore: 0.0,
      isConfident: false,
      matchedKeywords: []
    };
  }

  // Find unclassified category record if available
  const unclassifiedCat = categories.find(c => (c.code || '').toUpperCase() === 'UNCLASSIFIED') || { id: null, name: 'Unclassified' };

  let bestMatch = null;
  let highestScore = 0;
  let bestKeywords = [];

  for (const cat of categories) {
    if ((cat.code || '').toUpperCase() === 'UNCLASSIFIED') continue;

    let keywords = cat.keywords || [];
    if (typeof keywords === 'string') {
      try { keywords = JSON.parse(keywords); } catch (e) { keywords = []; }
    }

    if (!Array.isArray(keywords) || keywords.length === 0) continue;

    let catScore = 0;
    const matched = [];

    const normKeywords = keywords.map(k => k.toLowerCase().trim());

    // Check title tokens (weight 3x)
    for (const token of titleTokens) {
      for (const kw of normKeywords) {
        if (token === kw || (kw.length > 3 && token.includes(kw))) {
          catScore += 3;
          if (!matched.includes(kw)) matched.push(kw);
        }
      }
    }

    // Check description tokens (weight 1x)
    for (const token of descTokens) {
      for (const kw of normKeywords) {
        if (token === kw || (kw.length > 3 && token.includes(kw))) {
          catScore += 1;
          if (!matched.includes(kw)) matched.push(kw);
        }
      }
    }

    if (catScore > highestScore) {
      highestScore = catScore;
      bestMatch = cat;
      bestKeywords = matched;
    }
  }

  // Confidence threshold: at least score 2 (meaning 1 title keyword or 2 description keywords)
  const isConfident = highestScore >= 2 && bestMatch !== null;

  if (!isConfident || !bestMatch) {
    return {
      categoryId: unclassifiedCat.id,
      categoryName: unclassifiedCat.name || 'Unclassified',
      confidenceScore: 0.25,
      isConfident: false,
      matchedKeywords: []
    };
  }

  // Calculate normalized confidence score between 0.70 and 0.98
  const confidenceScore = Math.min(0.98, 0.70 + (highestScore * 0.05));

  return {
    categoryId: bestMatch.id,
    categoryName: bestMatch.name,
    confidenceScore: parseFloat(confidenceScore.toFixed(2)),
    isConfident: true,
    matchedKeywords: bestKeywords
  };
}

module.exports = {
  categorizeComplaint
};

