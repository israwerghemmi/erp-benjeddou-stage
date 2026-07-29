const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { login } = require('../controllers/authController');

const limiterLogin = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 tentatives max par IP sur cette fenêtre
  message: { message: 'Trop de tentatives de connexion depuis cette adresse. Réessayez plus tard.' },
});

router.post('/login', limiterLogin, login);

module.exports = router;