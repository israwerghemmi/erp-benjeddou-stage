const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const tenantMiddleware = require('../middlewares/tenantMiddleware');
const produitsController = require('../controllers/produitsController');

router.use(authMiddleware, tenantMiddleware);

router.post('/', produitsController.creer);
router.get('/', produitsController.listerTous);
router.get('/:id', produitsController.obtenirUn);
router.put('/:id', produitsController.modifier);
router.delete('/:id', produitsController.supprimer);

module.exports = router;