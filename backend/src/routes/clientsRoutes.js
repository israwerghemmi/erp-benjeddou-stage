const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const tenantMiddleware = require('../middlewares/tenantMiddleware');
const clientsController = require('../controllers/clientsController');

// Les deux middlewares s'appliquent à toutes les routes de ce fichier
router.use(authMiddleware, tenantMiddleware);

router.post('/', clientsController.creer);
router.get('/', clientsController.listerTous);
router.get('/:id', clientsController.obtenirUn);
router.put('/:id', clientsController.modifier);
router.delete('/:id', clientsController.supprimer);

module.exports = router;