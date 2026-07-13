exports.creer = async (req, res) => {
    try {
      const { libelle, montant, categorie } = req.body;
      const recette = await req.tenantModels.Recette.create({ libelle, montant, categorie });
      res.status(201).json(recette);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la création de la recette.', error: error.message });
    }
  };
  
  exports.listerTous = async (req, res) => {
    try {
      const recettes = await req.tenantModels.Recette.findAll({ order: [['date_recette', 'DESC']] });
      res.json(recettes);
    } catch (error) {
      res.status(500).json({ message: 'Erreur.', error: error.message });
    }
  };
  
  exports.supprimer = async (req, res) => {
    try {
      const recette = await req.tenantModels.Recette.findByPk(req.params.id);
      if (!recette) return res.status(404).json({ message: 'Recette introuvable.' });
      await recette.destroy();
      res.json({ message: 'Recette supprimée.' });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la suppression.', error: error.message });
    }
  };