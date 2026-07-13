exports.creer = async (req, res) => {
    try {
      const { reference, montant, mode_paiement, commande_id } = req.body;
      const paiement = await req.tenantModels.Paiement.create({ reference, montant, mode_paiement, commande_id });
      res.status(201).json(paiement);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la création du paiement.', error: error.message });
    }
  };
  
  exports.listerTous = async (req, res) => {
    try {
      const paiements = await req.tenantModels.Paiement.findAll({
        include: [req.tenantModels.Commande],
        order: [['date_paiement', 'DESC']],
      });
      res.json(paiements);
    } catch (error) {
      res.status(500).json({ message: 'Erreur.', error: error.message });
    }
  };
  
  exports.supprimer = async (req, res) => {
    try {
      const paiement = await req.tenantModels.Paiement.findByPk(req.params.id);
      if (!paiement) return res.status(404).json({ message: 'Paiement introuvable.' });
      await paiement.destroy();
      res.json({ message: 'Paiement supprimé.' });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la suppression.', error: error.message });
    }
  };