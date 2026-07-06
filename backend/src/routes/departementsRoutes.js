const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const tenantMiddleware = require('../middlewares/tenantMiddleware');

router.get('/', authMiddleware, tenantMiddleware, async (req, res) => {
  try {
    const departements = await req.tenantModels.Departement.findAll();
    res.json(departements);
  } catch (error) {
    res.status(500).json({ message: 'Erreur.', error: error.message });
  }
});

module.exports = router;