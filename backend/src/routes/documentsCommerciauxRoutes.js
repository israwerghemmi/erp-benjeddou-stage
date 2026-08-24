const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const tenantMiddleware = require('../middlewares/tenantMiddleware');
const ctrl = require('../controllers/documentsCommerciauxController');

router.use(authMiddleware, tenantMiddleware);

router.get('/commandes/:commandeId/bon-livraison', ctrl.genererBonLivraison);
router.get('/commandes/:commandeId/bon-sortie', ctrl.genererBonSortie);
router.get('/paiements/:paiementId/recu', ctrl.genererRecuPaiement);
router.get('/devis/:devisId/proforma', ctrl.genererFactureProforma);
router.post('/factures/:factureId/avoir', ctrl.genererFactureAvoir);

module.exports = router;