const { getTenantConnection } = require('../config/tenantManager');
const { Compte } = require('../models');

module.exports = async (req, res, next) => {
  try {
    if (!req.user?.db_name) {
      return res.status(403).json({ message: 'Aucun environnement associé à cet utilisateur.' });
    }

    const compte = await Compte.findByPk(req.user.compte_id);
    if (compte && compte.statut === 'expire') {
      return res.status(403).json({
        message: 'Votre période d\'essai est expirée. Accès aux fonctionnalités bloqué. Utilisez la fonction d\'export pour récupérer vos données.',
        statut: 'expire',
      });
    }

    const { models } = await getTenantConnection(req.user.db_name);
    req.tenantModels = models;
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Erreur de connexion à l\'environnement client.', error: error.message });
  }
};