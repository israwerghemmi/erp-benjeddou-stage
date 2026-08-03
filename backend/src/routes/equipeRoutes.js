const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const tenantMiddleware = require('../middlewares/tenantMiddleware');
const { inviter, lister, desactiver, supprimer } = require('../controllers/equipeController');

router.use(authMiddleware, tenantMiddleware);

router.post('/inviter', inviter);
router.get('/', lister);
router.patch('/:id/desactiver', desactiver);
router.delete('/:id', supprimer);

module.exports = router;