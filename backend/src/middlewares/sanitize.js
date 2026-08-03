const xss = require('xss');

/**
 * Nettoie récursivement les chaînes de caractères d'un objet
 * pour retirer tout code HTML/JS potentiellement malveillant.
 */
function sanitizeObject(obj) {
  if (typeof obj === 'string') {
    return xss(obj, { whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: ['script'] });
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  if (obj && typeof obj === 'object') {
    const clean = {};
    for (const key in obj) {
      clean[key] = sanitizeObject(obj[key]);
    }
    return clean;
  }
  return obj;
}

module.exports = function sanitizeMiddleware(req, res, next) {
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);
  next();
};