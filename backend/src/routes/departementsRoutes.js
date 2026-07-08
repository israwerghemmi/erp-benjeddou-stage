const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const tenantMiddleware = require('../middlewares/tenantMiddleware');
const departementsController = require('../controllers/departementsController');

router.use(authMiddleware, tenantMiddleware);

router.post('/', departementsController.creer);
router.get('/', departementsController.listerTous);

module.exports = router;