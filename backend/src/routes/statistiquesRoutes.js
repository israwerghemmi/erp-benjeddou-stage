const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const tenantMiddleware = require('../middlewares/tenantMiddleware');
const { statistiquesVentes, statistiquesRepartition, topProduits } = require('../controllers/statistiquesController');

router.use(authMiddleware, tenantMiddleware);
router.get('/ventes', statistiquesVentes);
router.get('/repartition', statistiquesRepartition);
router.get('/top-produits', topProduits);

module.exports = router;