const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const tenantMiddleware = require('../middlewares/tenantMiddleware');
const facturesController = require('../controllers/facturesController');

router.use(authMiddleware, tenantMiddleware);

router.post('/generer/:commandeId', facturesController.genererDepuisCommande);
router.get('/', facturesController.listerToutes);
router.get('/export/excel', facturesController.exporterExcel);
router.get('/:id/word', facturesController.exporterWord);
router.get('/:id/pdf', facturesController.telechargerPdf);
router.delete('/:id', facturesController.supprimer);

module.exports = router;