const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const tenantMiddleware = require('../middlewares/tenantMiddleware');
const recettesController = require('../controllers/recettesController');

router.use(authMiddleware, tenantMiddleware);

router.post('/', recettesController.creer);
router.get('/', recettesController.listerTous);
router.delete('/:id', recettesController.supprimer);

module.exports = router;