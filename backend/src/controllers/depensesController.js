exports.creer = async (req, res) => {
    try {
      const { libelle, montant, categorie } = req.body;
      const depense = await req.tenantModels.Depense.create({ libelle, montant, categorie });
      res.status(201).json(depense);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la création de la dépense.', error: error.message });
    }
  };
  
  exports.listerTous = async (req, res) => {
    try {
      const depenses = await req.tenantModels.Depense.findAll({ order: [['date_depense', 'DESC']] });
      res.json(depenses);
    } catch (error) {
      res.status(500).json({ message: 'Erreur.', error: error.message });
    }
  };
  
  exports.supprimer = async (req, res) => {
    try {
      const depense = await req.tenantModels.Depense.findByPk(req.params.id);
      if (!depense) return res.status(404).json({ message: 'Dépense introuvable.' });
      await depense.destroy();
      res.json({ message: 'Dépense supprimée.' });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la suppression.', error: error.message });
    }
  };