const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const tenantMiddleware = require('../middlewares/tenantMiddleware');
const fournisseursController = require('../controllers/fournisseursController');

router.use(authMiddleware, tenantMiddleware);

router.post('/', fournisseursController.creer);
router.get('/', fournisseursController.listerTous);
router.get('/:id', fournisseursController.obtenirUn);
router.put('/:id', fournisseursController.modifier);
router.delete('/:id', fournisseursController.supprimer);

module.exports = router;