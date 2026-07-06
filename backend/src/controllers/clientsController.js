// Toutes les fonctions utilisent req.tenantModels, injecté par tenantMiddleware
// → chaque requête est automatiquement isolée dans la bonne base d'entreprise

exports.creer = async (req, res) => {
    try {
      const { nom, email, telephone, adresse } = req.body;
      const client = await req.tenantModels.ClientCommercial.create({ nom, email, telephone, adresse });
      res.status(201).json(client);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la création du client.', error: error.message });
    }
  };
  
  exports.listerTous = async (req, res) => {
    try {
      const clients = await req.tenantModels.ClientCommercial.findAll();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des clients.', error: error.message });
    }
  };
  
  exports.obtenirUn = async (req, res) => {
    try {
      const client = await req.tenantModels.ClientCommercial.findByPk(req.params.id);
      if (!client) return res.status(404).json({ message: 'Client introuvable.' });
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: 'Erreur.', error: error.message });
    }
  };
  
  exports.modifier = async (req, res) => {
    try {
      const client = await req.tenantModels.ClientCommercial.findByPk(req.params.id);
      if (!client) return res.status(404).json({ message: 'Client introuvable.' });
      await client.update(req.body);
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la modification.', error: error.message });
    }
  };
  
  exports.supprimer = async (req, res) => {
    try {
      const client = await req.tenantModels.ClientCommercial.findByPk(req.params.id);
      if (!client) return res.status(404).json({ message: 'Client introuvable.' });
      await client.destroy();
      res.json({ message: 'Client supprimé.' });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la suppression.', error: error.message });
    }
  };