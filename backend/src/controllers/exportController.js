const { getTenantConnection } = require('../config/tenantManager');
const { Compte } = require('../models');

exports.exporterDonnees = async (req, res) => {
  try {
    const compte = await Compte.findByPk(req.user.compte_id);
    if (!compte || !compte.db_name) {
      return res.status(404).json({ message: 'Compte ou base introuvable.' });
    }

    const { models } = await getTenantConnection(compte.db_name);
    const { ClientCommercial, Produit, Fournisseur, Devis, Commande } = models;

    const donnees = {
      entreprise: compte.nom_entreprise,
      date_export: new Date(),
      clients: await ClientCommercial.findAll(),
      produits: await Produit.findAll(),
      fournisseurs: await Fournisseur.findAll(),
      devis: await Devis.findAll(),
      commandes: await Commande.findAll(),
    };

    res.setHeader('Content-Disposition', 'attachment; filename=export_donnees.json');
    res.json(donnees);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'export.', error: error.message });
  }
};