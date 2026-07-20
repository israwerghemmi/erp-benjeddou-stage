exports.lister = async (req, res) => {
    try {
      const journal = await req.tenantModels.JournalAudit.findAll({
        order: [['createdAt', 'DESC']],
        limit: 100,
      });
      res.json(journal);
    } catch (error) {
      res.status(500).json({ message: 'Erreur.', error: error.message });
    }
  };