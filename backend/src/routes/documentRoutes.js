const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const tenantMiddleware = require('../middlewares/tenantMiddleware');
const uploadDocument = require('../config/uploadDocument');
const documentController = require('../controllers/documentController');

router.use(authMiddleware, tenantMiddleware);

router.post('/', uploadDocument.single('fichier'), documentController.uploader);
router.get('/', documentController.lister);
router.put('/:id/archiver', documentController.archiver);
router.delete('/:id', documentController.supprimer);

module.exports = router;