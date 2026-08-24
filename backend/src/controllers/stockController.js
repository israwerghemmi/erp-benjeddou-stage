const { journaliserAction } = require('../utils/journaliser');
const { Op } = require('sequelize');

exports.listerEntrepots = async (req, res) => {
  try {
    const entrepots = await req.tenantModels.Entrepot.findAll();
    res.json(entrepots);
  } catch (error) {
    console.error('Erreur listage entrepôts :', error);
    res.status(500).json({ message: 'Erreur.', error: error.message });
  }
};

exports.creerEntrepot = async (req, res) => {
  try {
    const { nom, adresse, responsable } = req.body;
    if (!nom) return res.status(400).json({ message: 'Le nom de l\'entrepôt est requis.' });

    const entrepot = await req.tenantModels.Entrepot.create({ nom, adresse, responsable });
    res.status(201).json(entrepot);
  } catch (error) {
    console.error('Erreur création entrepôt :', error);
    res.status(500).json({ message: 'Erreur.', error: error.message });
  }
};

exports.enregistrerMouvement = async (req, res) => {
  try {
    const { Produit, MouvementStock } = req.tenantModels;
    const { produit_id, entrepot_id, type, quantite, motif } = req.body;

    if (!produit_id || !type || !quantite) {
      return res.status(400).json({ message: 'produit_id, type et quantite sont requis.' });
    }
    if (!['entree', 'sortie', 'transfert', 'ajustement'].includes(type)) {
      return res.status(400).json({ message: 'Type de mouvement invalide.' });
    }

    const produit = await Produit.findByPk(produit_id);
    if (!produit) return res.status(404).json({ message: 'Produit introuvable.' });

    if (['sortie', 'transfert'].includes(type) && produit.quantite_stock < quantite) {
      return res.status(400).json({ message: `Stock insuffisant. Disponible : ${produit.quantite_stock}.` });
    }

    const mouvement = await MouvementStock.create({
      produit_id, entrepot_id, type, quantite, motif,
    });

    const delta = ['entree', 'ajustement'].includes(type) ? quantite : -quantite;
    produit.quantite_stock += delta;
    await produit.save();

    await journaliserAction(req, 'mouvement_stock', { produit_id, type, quantite });

    const alerte = produit.quantite_stock <= produit.seuil_alerte;

    res.status(201).json({ mouvement, quantite_stock: produit.quantite_stock, alerte_rupture: alerte });
  } catch (error) {
    console.error('Erreur mouvement stock :', error);
    res.status(500).json({ message: 'Erreur.', error: error.message });
  }
};

exports.listerMouvements = async (req, res) => {
  try {
    const { MouvementStock, Produit, Entrepot } = req.tenantModels;
    const mouvements = await MouvementStock.findAll({
      include: [Produit, Entrepot],
      order: [['createdAt', 'DESC']],
    });
    res.json(mouvements);
  } catch (error) {
    console.error('Erreur listage mouvements :', error);
    res.status(500).json({ message: 'Erreur.', error: error.message });
  }
};

exports.produitsEnAlerte = async (req, res) => {
  try {
    const { Produit } = req.tenantModels;
    const produits = await Produit.findAll({
      where: { quantite_stock: { [Op.lte]: Produit.sequelize.col('seuil_alerte') } },
    });
    res.json(produits);
  } catch (error) {
    console.error('Erreur produits en alerte :', error);
    res.status(500).json({ message: 'Erreur.', error: error.message });
  }
};