const { Op } = require('sequelize');

exports.rechercheGlobale = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: 'Le terme de recherche doit contenir au moins 2 caractères.' });
    }

    const terme = `%${q.trim()}%`;
    const { ClientCommercial, Fournisseur, Produit, Devis, Commande, Facture } = req.tenantModels;

    const [clients, fournisseurs, produits, devis, commandes, factures] = await Promise.all([
      ClientCommercial.findAll({
        where: {
          [Op.or]: [
            { nom: { [Op.iLike]: terme } },
            { email: { [Op.iLike]: terme } },
            { telephone: { [Op.iLike]: terme } },
          ],
        },
        limit: 10,
      }),
      Fournisseur.findAll({
        where: {
          [Op.or]: [
            { nom: { [Op.iLike]: terme } },
            { email: { [Op.iLike]: terme } },
            { telephone: { [Op.iLike]: terme } },
          ],
        },
        limit: 10,
      }),
      Produit.findAll({
        where: {
          [Op.or]: [
            { nom: { [Op.iLike]: terme } },
            { reference: { [Op.iLike]: terme } },
          ],
        },
        limit: 10,
      }),
      Devis.findAll({ where: { numero: { [Op.iLike]: terme } }, limit: 10 }),
      Commande.findAll({ where: { numero: { [Op.iLike]: terme } }, limit: 10 }),
      Facture.findAll({ where: { numero: { [Op.iLike]: terme } }, limit: 10 }),
    ]);

    res.json({
      clients: clients.map((c) => ({ id: c.id, type: 'client', titre: c.nom, sousTitre: c.email || c.telephone })),
      fournisseurs: fournisseurs.map((f) => ({ id: f.id, type: 'fournisseur', titre: f.nom, sousTitre: f.email || f.telephone })),
      produits: produits.map((p) => ({ id: p.id, type: 'produit', titre: p.nom, sousTitre: p.reference })),
      devis: devis.map((d) => ({ id: d.id, type: 'devis', titre: d.numero, sousTitre: `${d.montant_total} DT` })),
      commandes: commandes.map((c) => ({ id: c.id, type: 'commande', titre: c.numero, sousTitre: `${c.montant_total} DT` })),
      factures: factures.map((f) => ({ id: f.id, type: 'facture', titre: f.numero, sousTitre: `${f.montant_ttc} DT` })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la recherche.', error: error.message });
  }
};