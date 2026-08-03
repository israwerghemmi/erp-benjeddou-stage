const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { creerSauvegarde } = require('../controllers/sauvegardeController');

router.get('/', authMiddleware, creerSauvegarde);

module.exports = router;