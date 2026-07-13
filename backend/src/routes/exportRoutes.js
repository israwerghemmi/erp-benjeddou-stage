const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { exporterDonnees } = require('../controllers/exportController');

router.get('/', authMiddleware, exporterDonnees);

module.exports = router;