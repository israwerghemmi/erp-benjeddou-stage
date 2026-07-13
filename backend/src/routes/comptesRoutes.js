const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { inscription, listerEnAttente, valider } = require('../controllers/comptesController');

router.post('/inscription', inscription);
router.get('/en-attente', authMiddleware, listerEnAttente);
router.patch('/:id/valider', authMiddleware, valider);

module.exports = router;