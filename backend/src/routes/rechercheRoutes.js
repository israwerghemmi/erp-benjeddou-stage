const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const tenantMiddleware = require('../middlewares/tenantMiddleware');
const { rechercheGlobale } = require('../controllers/rechercheController');

router.use(authMiddleware, tenantMiddleware);
router.get('/', rechercheGlobale);

module.exports = router;