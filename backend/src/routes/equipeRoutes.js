const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const tenantMiddleware = require('../middlewares/tenantMiddleware');
const { inviter, lister } = require('../controllers/equipeController');

router.use(authMiddleware, tenantMiddleware);

router.post('/inviter', inviter);
router.get('/', lister);

module.exports = router;