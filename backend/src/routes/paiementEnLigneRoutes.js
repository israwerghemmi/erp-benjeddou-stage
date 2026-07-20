const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const tenantMiddleware = require('../middlewares/tenantMiddleware');
const controller = require('../controllers/paiementEnLigneController');

router.use(authMiddleware, tenantMiddleware);

router.post('/creer-session/:commandeId', controller.creerSession);
router.get('/verifier/:sessionId', controller.verifierSession);
router.get('/historique', controller.historique);

module.exports = router;