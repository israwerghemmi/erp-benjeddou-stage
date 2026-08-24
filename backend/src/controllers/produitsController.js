const { journaliserAction } = require('../utils/journaliser');
const { validerEmail, validerTelephone, validerChampsRequis, validerMontantPositif } = require('../utils/validerFormulaire');
exports.creer = async (req, res) => {
  try {
    const { nom, reference, prix, quantite_stock, fournisseur_id } = req.body;
    const manquants = validerChampsRequis(req.body, ['nom', 'reference', 'prix', 'quantite_stock']);
    if (manquants.length > 0) {
      return res.status(400).json({ message: `Champs requis manquants : ${manquants.join(', ')}` });
    }
    if (prix && !validerMontantPositif(prix)) {
      return res.status(400).json({ message: 'Le prix doit être un nombre positif.' });
    }
    if (quantite_stock && !validerMontantPositif(quantite_stock)) {
      return res.status(400).json({ message: 'La quantité en stock doit être un nombre positif.' });
    }
    const produit = await req.tenantModels.Produit.create({ nom, reference, prix, quantite_stock, fournisseur_id });
    await journaliserAction(req, 'creation_produit', { produit_id: produit.id, nom: produit.nom });
    res.status(201).json(produit);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création du produit.', error: error.message });
  }
};
  
  exports.listerTous = async (req, res) => {
    try {
      const produits = await req.tenantModels.Produit.findAll();
      res.json(produits);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des produits.', error: error.message });
    }
  };
  
  exports.obtenirUn = async (req, res) => {
    try {
      const produit = await req.tenantModels.Produit.findByPk(req.params.id);
      if (!produit) return res.status(404).json({ message: 'Produit introuvable.' });
      res.json(produit);
    } catch (error) {
      res.status(500).json({ message: 'Erreur.', error: error.message });
    }
  };
  
  exports.modifier = async (req, res) => {
    try {
      const produit = await req.tenantModels.Produit.findByPk(req.params.id);
      if (!produit) return res.status(404).json({ message: 'Produit introuvable.' });
      await produit.update(req.body);
      await journaliserAction(req, 'modification_produit', { produit_id: produit.id });
      res.json(produit);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la modification.', error: error.message });
    }
  };
  
  exports.supprimer = async (req, res) => {
    try {
      const produit = await req.tenantModels.Produit.findByPk(req.params.id);
      if (!produit) return res.status(404).json({ message: 'Produit introuvable.' });
      await produit.destroy();
      await journaliserAction(req, 'suppression_produit', { produit_id: req.params.id, nom: produit.nom });
      res.json({ message: 'Produit supprimé.' });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la suppression.', error: error.message });
    }
  };