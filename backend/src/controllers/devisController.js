exports.creer = async (req, res) => {
  try {
    const { numero, client_id, produits } = req.body;
    // produits attendu : [{ produit_id, quantite, prix_unitaire }, ...]

    const montant_total = produits.reduce((sum, p) => sum + (p.quantite * p.prix_unitaire), 0);

    const devis = await req.tenantModels.Devis.create({ numero, client_id, montant_total });

    // Associer les produits via la table de liaison
    for (const p of produits) {
      await devis.addProduit(p.produit_id, {
        through: { quantite: p.quantite, prix_unitaire: p.prix_unitaire },
      });
    }

    const devisComplet = await req.tenantModels.Devis.findByPk(devis.id, {
      include: [req.tenantModels.Produit, req.tenantModels.ClientCommercial],
    });

    res.status(201).json(devisComplet);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création du devis.', error: error.message });
  }
};

exports.listerTous = async (req, res) => {
  try {
    const devis = await req.tenantModels.Devis.findAll({
      include: [req.tenantModels.Produit, req.tenantModels.ClientCommercial],
    });
    res.json(devis);
  } catch (error) {
    res.status(500).json({ message: 'Erreur.', error: error.message });
  }
};

exports.obtenirUn = async (req, res) => {
  try {
    const devis = await req.tenantModels.Devis.findByPk(req.params.id, {
      include: [req.tenantModels.Produit, req.tenantModels.ClientCommercial],
    });
    if (!devis) return res.status(404).json({ message: 'Devis introuvable.' });
    res.json(devis);
  } catch (error) {
    res.status(500).json({ message: 'Erreur.', error: error.message });
  }
};

exports.modifierStatut = async (req, res) => {
  try {
    const devis = await req.tenantModels.Devis.findByPk(req.params.id);
    if (!devis) return res.status(404).json({ message: 'Devis introuvable.' });
    devis.statut = req.body.statut; // en_attente | accepte | refuse
    await devis.save();
    res.json(devis);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la modification.', error: error.message });
  }
};

exports.supprimer = async (req, res) => {
  try {
    const devis = await req.tenantModels.Devis.findByPk(req.params.id);
    if (!devis) return res.status(404).json({ message: 'Devis introuvable.' });
    await devis.destroy();
    res.json({ message: 'Devis supprimé.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression.', error: error.message });
  }
};