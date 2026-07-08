const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const tenantMiddleware = require('../middlewares/tenantMiddleware');
const devisController = require('../controllers/devisController');

router.use(authMiddleware, tenantMiddleware);

router.post('/', devisController.creer);
router.get('/', devisController.listerTous);
router.get('/:id', devisController.obtenirUn);
router.patch('/:id/statut', devisController.modifierStatut);
router.delete('/:id', devisController.supprimer);

module.exports = router;