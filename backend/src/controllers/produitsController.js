exports.creer = async (req, res) => {
    try {
      const { nom, reference, prix, quantite_stock, fournisseur_id } = req.body;
      const produit = await req.tenantModels.Produit.create({ nom, reference, prix, quantite_stock, fournisseur_id });
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
      res.json({ message: 'Produit supprimé.' });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la suppression.', error: error.message });
    }
  };