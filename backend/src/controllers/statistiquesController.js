exports.statistiquesVentes = async (req, res) => {
    try {
      const { Commande } = req.tenantModels;
      const commandes = await Commande.findAll();
  
      // Regrouper les ventes par mois (6 derniers mois)
      const ventesParMois = {};
      const maintenant = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = new Date(maintenant.getFullYear(), maintenant.getMonth() - i, 1);
        const cle = date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
        ventesParMois[cle] = 0;
      }
  
      commandes.forEach((c) => {
        const date = new Date(c.date_creation);
        const cle = date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
        if (ventesParMois[cle] !== undefined) {
          ventesParMois[cle] += c.montant_total;
        }
      });
  
      const evolutionVentes = Object.entries(ventesParMois).map(([mois, montant]) => ({ mois, montant }));
  
      res.json({ evolutionVentes });
    } catch (error) {
      res.status(500).json({ message: 'Erreur.', error: error.message });
    }
  };
  
  exports.statistiquesRepartition = async (req, res) => {
    try {
      const { Commande } = req.tenantModels;
      const commandes = await Commande.findAll();
  
      const repartition = { en_cours: 0, livree: 0, annulee: 0 };
      commandes.forEach((c) => { repartition[c.statut] = (repartition[c.statut] || 0) + 1; });
  
      const data = Object.entries(repartition).map(([statut, valeur]) => ({ statut, valeur }));
      res.json({ repartitionStatuts: data });
    } catch (error) {
      res.status(500).json({ message: 'Erreur.', error: error.message });
    }
  };
  
  exports.topProduits = async (req, res) => {
    try {
      const { Produit, Commande } = req.tenantModels;
      const produits = await Produit.findAll({ include: [Commande] });
  
      const classement = produits
        .map((p) => ({ nom: p.nom, ventes: p.Commandes?.length || 0 }))
        .sort((a, b) => b.ventes - a.ventes)
        .slice(0, 5);
  
      res.json({ topProduits: classement });
    } catch (error) {
      res.status(500).json({ message: 'Erreur.', error: error.message });
    }
  };