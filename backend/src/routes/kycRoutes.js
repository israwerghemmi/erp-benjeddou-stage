const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const tenantMiddleware = require('../middlewares/tenantMiddleware');
const uploadKyc = require('../config/uploadKyc');
const { soumettreDocument, listerEnAttente, validerOuRejeter } = require('../controllers/kycController');

router.use(authMiddleware, tenantMiddleware);
router.post('/:id/document', uploadKyc.single('document'), soumettreDocument);
router.get('/en-attente', listerEnAttente);
router.put('/:id/decision', validerOuRejeter);

module.exports = router;