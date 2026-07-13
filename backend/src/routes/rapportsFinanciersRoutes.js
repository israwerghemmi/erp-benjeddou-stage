const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const tenantMiddleware = require('../middlewares/tenantMiddleware');
const { synthese } = require('../controllers/rapportsFinanciersController');

router.use(authMiddleware, tenantMiddleware);

router.get('/synthese', synthese);

module.exports = router;