/**
 * Utility functions for text normalization, tokenization,
 * and text similarity calculation (Jaccard + Cosine-like term overlap).
 */

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'can\'t', 'cannot', 'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing',
  'don\'t', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t',
  'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers',
  'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if',
  'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s', 'me', 'more', 'most',
  'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought',
  'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'she\'d', 'she\'ll', 'she\'s',
  'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs',
  'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re',
  'they\'ve', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t',
  'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s',
  'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t',
  'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself',
  'yourselves', 'please', 'kindly', 'urgent', 'help', 'issue', 'problem'
]);

/**
 * Normalizes text: lowercase, strip punctuation, remove stopwords
 */
function tokenize(text) {
  if (!text || typeof text !== 'string') return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));
}

/**
 * Calculates Jaccard similarity coefficient between two texts (0.0 to 1.0)
 */
function calculateJaccardSimilarity(textA, textB) {
  const tokensA = new Set(tokenize(textA));
  const tokensB = new Set(tokenize(textB));

  if (tokensA.size === 0 || tokensB.size === 0) return 0.0;

  let intersectionCount = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) {
      intersectionCount++;
    }
  }

  const unionCount = new Set([...tokensA, ...tokensB]).size;
  return unionCount === 0 ? 0.0 : intersectionCount / unionCount;
}

/**
 * Normalizes room/location string for fuzzy matching (e.g. "Lab 4" == "lab-4" == "Computer Lab 4")
 */
function normalizeLocationString(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/room|classroom|hall|block|wing|floor/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Determines whether two locations match exactly or fuzzily
 */
function areLocationsMatching(loc1, loc2, room1, room2) {
  const nLoc1 = normalizeLocationString(loc1);
  const nLoc2 = normalizeLocationString(loc2);
  const nRoom1 = normalizeLocationString(room1);
  const nRoom2 = normalizeLocationString(room2);

  const locMatch = nLoc1.includes(nLoc2) || nLoc2.includes(nLoc1) || nLoc1 === nLoc2;
  const roomMatch = nRoom1.includes(nRoom2) || nRoom2.includes(nRoom1) || nRoom1 === nRoom2;

  return {
    isSameBuilding: locMatch,
    isSameRoom: roomMatch,
    isExactMatch: locMatch && roomMatch
  };
}

module.exports = {
  tokenize,
  calculateJaccardSimilarity,
  normalizeLocationString,
  areLocationsMatching
};

