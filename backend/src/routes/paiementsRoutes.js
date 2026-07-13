const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const tenantMiddleware = require('../middlewares/tenantMiddleware');
const paiementsController = require('../controllers/paiementsController');

router.use(authMiddleware, tenantMiddleware);

router.post('/', paiementsController.creer);
router.get('/', paiementsController.listerTous);
router.delete('/:id', paiementsController.supprimer);

module.exports = router;