const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const tenantMiddleware = require('../middlewares/tenantMiddleware');
const stockController = require('../controllers/stockController');

router.use(authMiddleware, tenantMiddleware);

router.get('/entrepots', stockController.listerEntrepots);
router.post('/entrepots', stockController.creerEntrepot);
router.post('/mouvements', stockController.enregistrerMouvement);
router.get('/mouvements', stockController.listerMouvements);
router.get('/alertes', stockController.produitsEnAlerte);

module.exports = router;