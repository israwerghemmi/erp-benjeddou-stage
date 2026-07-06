const { getTenantConnection } = require('../config/tenantManager');

module.exports = async (req, res, next) => {
  try {
    if (!req.user?.db_name) {
      return res.status(403).json({ message: 'Aucun environnement associé à cet utilisateur.' });
    }
    const { models } = await getTenantConnection(req.user.db_name);
    req.tenantModels = models;
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Erreur de connexion à l\'environnement client.', error: error.message });
  }
};