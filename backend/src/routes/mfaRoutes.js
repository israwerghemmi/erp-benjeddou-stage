const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { genererSecret, activerMfa } = require('../controllers/mfaController');

router.post('/generer', authMiddleware, genererSecret);
router.post('/activer', authMiddleware, activerMfa);

module.exports = router;