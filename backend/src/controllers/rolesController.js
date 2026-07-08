exports.creer = async (req, res) => {
    try {
      const { nom, permissions } = req.body;
      const role = await req.tenantModels.Role.create({ nom, permissions: permissions || {} });
      res.status(201).json(role);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la création du rôle.', error: error.message });
    }
  };
  
  exports.listerTous = async (req, res) => {
    try {
      const roles = await req.tenantModels.Role.findAll();
      res.json(roles);
    } catch (error) {
      res.status(500).json({ message: 'Erreur.', error: error.message });
    }
  };