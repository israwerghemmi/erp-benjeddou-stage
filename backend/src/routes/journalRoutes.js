const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const tenantMiddleware = require('../middlewares/tenantMiddleware');
const { lister } = require('../controllers/journalController');

router.use(authMiddleware, tenantMiddleware);
router.get('/', lister);

module.exports = router;