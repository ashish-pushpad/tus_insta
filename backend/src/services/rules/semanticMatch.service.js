import { logger } from '../../utils/logger.js';

/**
 * Semantic similarity matching engine.
 *
 * Strategy (layered, no external API required):
 *
 *  1. Direct substring check — fast path, zero cost.
 *  2. Stemming normalisation — strips common English suffixes so
 *     "pricing" matches "price", "buying" matches "buy", etc.
 *  3. TF-IDF cosine similarity — builds term-frequency vectors for
 *     the comment and each keyword phrase then measures the angle
 *     between them.  A score ≥ COSINE_THRESHOLD counts as a match.
 *  4. Synonym expansion — a lightweight synonym map that covers the
 *     most common e-commerce / social-media intent families.  The map
 *     is keyed by stem so every new keyword benefits automatically.
 *
 * Advantages over the old approach:
 *  - Works for *any* user-defined keyword, not just the 3 hard-coded ones.
 *  - Handles plurals, verb forms, and multi-word phrases.
 *  - Purely in-process — no embedding API call, no extra latency.
 */

// ─── Configuration ────────────────────────────────────────────────────────────

const COSINE_THRESHOLD = 0.35; // tuned for social media comment length

// Common English stop-words to ignore when building term vectors
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'it', 'this', 'that', 'i', 'me',
  'my', 'you', 'your', 'we', 'do', 'does', 'did', 'will', 'would',
  'can', 'could', 'should', 'are', 'was', 'were', 'be', 'been', 'have',
  'has', 'had', 'not', 'no', 'so', 'if', 'as', 'up', 'out', 'there',
  'what', 'how', 'when', 'where', 'who', 'which', 'their', 'they',
  'just', 'get', 'got', 'also', 'its', 'very', 'more', 'much',
]);

/**
 * Synonym expansion map.  Keys are stems (after normalizeStem).
 * Adding entries here benefits every rule that contains the stem.
 */
const SYNONYM_MAP = {
  // pricing / cost intent
  price:   ['cost', 'rate', 'pricing', 'charge', 'fee', 'tariff', 'valeur', 'quanto'],
  cost:    ['price', 'rate', 'pricing', 'charge', 'expense', 'fee'],
  cheap:   ['afford', 'budget', 'discount', 'deal', 'inexpensive', 'sale', 'offer'],
  expensive: ['pricey', 'costly', 'overpriced'],

  // purchase / availability intent
  buy:     ['purchase', 'order', 'shop', 'acquire', 'checkout', 'cart', 'add'],
  order:   ['buy', 'purchase', 'booking', 'reserve', 'book'],
  avail:   ['available', 'availability', 'stock', 'in stock', 'have', 'sell', 'get'],

  // link / location intent
  link:    ['url', 'website', 'site', 'web', 'page', 'address', 'find'],
  where:   ['location', 'place', 'site', 'address', 'find', 'shop'],

  // shipping / delivery intent
  ship:    ['shipping', 'deliver', 'delivery', 'dispatch', 'send', 'arrive', 'arrive'],
  deliver: ['delivery', 'ship', 'shipping', 'arrive', 'arrival', 'track'],

  // product info intent
  info:    ['information', 'detail', 'details', 'more', 'tell', 'know', 'about', 'spec'],
  detail:  ['details', 'information', 'spec', 'specs', 'description', 'describe'],

  // collaboration / partnership intent
  collab:  ['collaboration', 'partner', 'partnership', 'work', 'together', 'sponsor'],

  // contact intent
  contact: ['reach', 'dm', 'message', 'email', 'call', 'talk', 'speak'],
};

// ─── Text normalisation ────────────────────────────────────────────────────────

/**
 * Very lightweight English stemmer covering the most common suffix rules.
 * Not Porter-full but fast and dependency-free.
 */
const normalizeStem = (word) => {
  if (word.length <= 3) return word;

  // Order matters — longer suffixes first
  const suffixes = [
    ['nesses', ''],   // happiness → happi
    ['fulness', ''],
    ['iveness', ''],
    ['ations', 'ate'],
    ['ation', 'ate'],
    ['ising', 'ise'],
    ['izing', 'ize'],
    ['iness', 'y'],
    ['ating', 'ate'],
    ['ening', 'en'],
    ['ingly', ''],
    ['ments', ''],
    ['ment', ''],
    ['ness', ''],
    ['less', ''],
    ['ings', ''],
    ['tion', 'te'],
    ['sion', 'se'],
    ['ive', ''],
    ['ing', ''],
    ['ies', 'y'],
    ['ied', 'y'],
    ['ers', 'er'],
    ['est', ''],
    ['ful', ''],
    ['ing', ''],
    ['ed', ''],
    ['es', ''],
    ['er', ''],
    ['ly', ''],
    ['s', ''],
  ];

  for (const [suffix, replacement] of suffixes) {
    if (word.endsWith(suffix) && word.length - suffix.length >= 3) {
      return word.slice(0, word.length - suffix.length) + replacement;
    }
  }
  return word;
};

/**
 * Tokenise a string into normalised stems, filtering stop-words.
 */
const tokenize = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')   // strip punctuation
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t))
    .map(normalizeStem);
};

// ─── Synonym expansion ────────────────────────────────────────────────────────

/**
 * Expands a token array by appending synonyms for any token that
 * appears as a key in SYNONYM_MAP (after stemming the synonym map keys).
 */
const expandWithSynonyms = (tokens) => {
  const expanded = [...tokens];
  for (const token of tokens) {
    const syns = SYNONYM_MAP[token] || [];
    for (const syn of syns) {
      const synTokens = tokenize(syn);
      expanded.push(...synTokens);
    }
  }
  return expanded;
};

// ─── TF-IDF cosine similarity ─────────────────────────────────────────────────

/**
 * Builds a term-frequency map from a token array.
 */
const buildTF = (tokens) => {
  const tf = new Map();
  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }
  return tf;
};

/**
 * Computes cosine similarity between two TF maps.
 * Returns a value in [0, 1].
 */
const cosineSimilarity = (tfA, tfB) => {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (const [term, freq] of tfA) {
    normA += freq * freq;
    if (tfB.has(term)) {
      dot += freq * tfB.get(term);
    }
  }
  for (const [, freq] of tfB) {
    normB += freq * freq;
  }

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns true if the comment semantically matches any of the keywords.
 *
 * @param {string} commentText   - The raw comment from Instagram.
 * @param {string[]} keywords    - Rule keywords defined by the user.
 * @returns {Promise<boolean>}
 */
export const checkSemanticMatch = async (commentText = '', keywords = []) => {
  if (!commentText || !keywords || keywords.length === 0) return false;

  const normalizedComment = commentText.toLowerCase().trim();

  for (const keyword of keywords) {
    const normKw = String(keyword).toLowerCase().trim();
    if (!normKw) continue;

    // ── 1. Fast path: direct substring ───────────────────────────────────
    if (normalizedComment.includes(normKw)) {
      logger.debug({ keyword: normKw }, 'Semantic match: direct substring hit');
      return true;
    }

    // ── 2. Stemming normalisation comparison ─────────────────────────────
    const commentTokens  = tokenize(normalizedComment);
    const keywordTokens  = tokenize(normKw);

    const commentStems  = commentTokens.map(normalizeStem);
    const keywordStems  = keywordTokens.map(normalizeStem);

    const stemHit = keywordStems.some((ks) => commentStems.includes(ks));
    if (stemHit) {
      logger.debug({ keyword: normKw }, 'Semantic match: stem hit');
      return true;
    }

    // ── 3. Synonym expansion + cosine similarity ─────────────────────────
    const commentExpanded = expandWithSynonyms(commentStems);
    const keywordExpanded = expandWithSynonyms(keywordStems);

    const tfComment  = buildTF(commentExpanded);
    const tfKeyword  = buildTF(keywordExpanded);

    const score = cosineSimilarity(tfComment, tfKeyword);
    logger.debug({ keyword: normKw, score, threshold: COSINE_THRESHOLD }, 'Semantic cosine score');

    if (score >= COSINE_THRESHOLD) {
      logger.debug({ keyword: normKw, score }, 'Semantic match: cosine threshold met');
      return true;
    }
  }

  return false;
};
