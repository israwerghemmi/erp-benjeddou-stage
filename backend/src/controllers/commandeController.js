const { journaliserAction } = require('../utils/journaliser');
exports.creer = async (req, res) => {
    try {
      const { numero, client_id, produits } = req.body;
      // produits attendu : [{ produit_id, quantite, prix_unitaire }, ...]
  
      const montant_total = produits.reduce((sum, p) => sum + (p.quantite * p.prix_unitaire), 0);
  
      const commande = await req.tenantModels.Commande.create({ numero, client_id, montant_total });
  
      for (const p of produits) {
        await commande.addProduit(p.produit_id, {
          through: { quantite: p.quantite, prix_unitaire: p.prix_unitaire },
        });
      }
  
      const commandeComplete = await req.tenantModels.Commande.findByPk(commande.id, {
        include: [req.tenantModels.Produit, req.tenantModels.ClientCommercial],
      });
      await journaliserAction(req, 'creation_commande', { commande_id: commande.id, numero: commande.numero });
      res.status(201).json(commandeComplete);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la création de la commande.', error: error.message });
    }
  };
  
  exports.listerTous = async (req, res) => {
    try {
      const commandes = await req.tenantModels.Commande.findAll({
        include: [req.tenantModels.Produit, req.tenantModels.ClientCommercial],
      });
      res.json(commandes);
    } catch (error) {
      res.status(500).json({ message: 'Erreur.', error: error.message });
    }
  };
  
  exports.obtenirUn = async (req, res) => {
    try {
      const commande = await req.tenantModels.Commande.findByPk(req.params.id, {
        include: [req.tenantModels.Produit, req.tenantModels.ClientCommercial],
      });
      if (!commande) return res.status(404).json({ message: 'Commande introuvable.' });
      res.json(commande);
    } catch (error) {
      res.status(500).json({ message: 'Erreur.', error: error.message });
    }
  };
  
  exports.modifierStatut = async (req, res) => {
    try {
      const commande = await req.tenantModels.Commande.findByPk(req.params.id);
      if (!commande) return res.status(404).json({ message: 'Commande introuvable.' });
      commande.statut = req.body.statut; // en_cours | livree | annulee
      await commande.save();
      res.json(commande);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la modification.', error: error.message });
    }
  };
  
  exports.supprimer = async (req, res) => {
    try {
      const commande = await req.tenantModels.Commande.findByPk(req.params.id);
      if (!commande) return res.status(404).json({ message: 'Commande introuvable.' });
      await commande.destroy();
      res.json({ message: 'Commande supprimée.' });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la suppression.', error: error.message });
    }
  };