const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const tenantMiddleware = require('../middlewares/tenantMiddleware');
const rolesController = require('../controllers/rolesController');

router.use(authMiddleware, tenantMiddleware);

router.post('/', rolesController.creer);
router.get('/', rolesController.listerTous);

module.exports = router;