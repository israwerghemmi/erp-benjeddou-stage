const rateLimit = require('express-rate-limit');

// Limiteur global : toutes les routes API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requêtes / IP / 15min
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de requêtes. Réessayez plus tard.' },
});

// Limiteur strict : routes sensibles (auth, mfa, paiement, sauvegarde, export)
const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // 20 requêtes / IP / 15min
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de tentatives sur une action sensible. Réessayez plus tard.' },
});

// Limiteur écriture : création/modification (POST/PUT/DELETE) sur modules métier
const writeLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'GET', // seulement écritures
  message: { message: 'Trop d\'opérations d\'écriture. Réessayez plus tard.' },
});

module.exports = { apiLimiter, sensitiveLimiter, writeLimiter };