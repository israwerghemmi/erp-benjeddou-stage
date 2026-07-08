const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const tenantMiddleware = require('../middlewares/tenantMiddleware');
const commandeController = require('../controllers/commandeController');

router.use(authMiddleware, tenantMiddleware);

router.post('/', commandeController.creer);
router.get('/', commandeController.listerTous);
router.get('/:id', commandeController.obtenirUn);
router.patch('/:id/statut', commandeController.modifierStatut);
router.delete('/:id', commandeController.supprimer);

module.exports = router;