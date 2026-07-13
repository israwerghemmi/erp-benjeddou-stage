const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const tenantMiddleware = require('../middlewares/tenantMiddleware');
const depensesController = require('../controllers/depensesController');

router.use(authMiddleware, tenantMiddleware);

router.post('/', depensesController.creer);
router.get('/', depensesController.listerTous);
router.delete('/:id', depensesController.supprimer);

module.exports = router;