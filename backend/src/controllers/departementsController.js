exports.creer = async (req, res) => {
    try {
      const { nom, description } = req.body;
      const departement = await req.tenantModels.Departement.create({ nom, description });
      res.status(201).json(departement);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la création du département.', error: error.message });
    }
  };
  
  exports.listerTous = async (req, res) => {
    try {
      const departements = await req.tenantModels.Departement.findAll();
      res.json(departements);
    } catch (error) {
      res.status(500).json({ message: 'Erreur.', error: error.message });
    }
  };