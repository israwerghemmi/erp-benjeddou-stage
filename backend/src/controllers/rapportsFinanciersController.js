exports.synthese = async (req, res) => {
    try {
      const { Paiement, Depense, Recette } = req.tenantModels;
  
      const paiements = await Paiement.findAll();
      const depenses = await Depense.findAll();
      const recettes = await Recette.findAll();
  
      const totalPaiements = paiements.reduce((sum, p) => sum + p.montant, 0);
      const totalDepenses = depenses.reduce((sum, d) => sum + d.montant, 0);
      const totalRecettes = recettes.reduce((sum, r) => sum + r.montant, 0);
      const solde = totalRecettes + totalPaiements - totalDepenses;
  
      res.json({
        totalPaiements,
        totalDepenses,
        totalRecettes,
        solde,
        nombrePaiements: paiements.length,
        nombreDepenses: depenses.length,
        nombreRecettes: recettes.length,
      });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors du calcul du rapport.', error: error.message });
    }
  };