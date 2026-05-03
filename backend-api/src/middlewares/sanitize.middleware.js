const { sendError } = require('../utils/response');

// ─── Characters to strip / patterns to reject ─────────────────────────────────
const SQL_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|TRUNCATE|REPLACE)\b)/i,
  /(--|\bOR\b\s+\d+\s*=\s*\d+|\bOR\b\s+['"])/i
];

const XSS_PATTERNS = [
  /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  /javascript\s*:/gi,
  /on\w+\s*=\s*["'][^"']*["']/gi
];

// Recursively clean a value
const sanitizeValue = (value) => {
  if (typeof value !== 'string') return value;

  // Strip leading/trailing whitespace
  let cleaned = value.trim();

  // Remove null bytes
  cleaned = cleaned.replace(/\0/g, '');

  // Strip basic XSS vectors
  cleaned = cleaned.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
  cleaned = cleaned.replace(/javascript\s*:/gi, '');
  cleaned = cleaned.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

  return cleaned;
};

const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const result = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (typeof val === 'string') {
      result[key] = sanitizeValue(val);
    } else if (typeof val === 'object' && !Array.isArray(val)) {
      result[key] = sanitizeObject(val);
    } else {
      result[key] = val;
    }
  }
  return result;
};

// Check for SQL injection patterns
const hasSqlInjection = (value) => {
  if (typeof value !== 'string') return false;
  return SQL_PATTERNS.some(pattern => pattern.test(value));
};

const checkObjectForSql = (obj) => {
  if (!obj || typeof obj !== 'object') return false;
  return Object.values(obj).some(val => {
    if (typeof val === 'string') return hasSqlInjection(val);
    if (typeof val === 'object') return checkObjectForSql(val);
    return false;
  });
};

// ─── Middleware ────────────────────────────────────────────────────────────────
const sanitizeInput = (req, res, next) => {
  // 1. Check for SQL injection in body/query - DISABLED due to high false positives in story content.
  // Prisma handles SQL injection protection via parameterized queries.
  /*
  if (checkObjectForSql(req.body) || checkObjectForSql(req.query)) {
    return sendError(res, 'Invalid characters detected in request', null, 400);
  }
  */

  // 2. Sanitize body and query strings
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
};

module.exports = { sanitizeInput };
