const { validerEmail, validerTelephone, validerChampsRequis } = require('../utils/validerFormulaire');
exports.creer = async (req, res) => {
    try {
      const { nom, email, telephone } = req.body;
      const manquants = validerChampsRequis(req.body, ['nom','email','telephone']);
      if (manquants.length > 0) {
        return res.status(400).json({ message: `Champs requis manquants : ${manquants.join(', ')}` });
      }
      if (email && !validerEmail(email)) {
        return res.status(400).json({ message: 'Format d\'email invalide.' });
      }
      if (telephone && !validerTelephone(telephone)) {
        return res.status(400).json({ message: 'Format de téléphone invalide.' });
      }
      const fournisseur = await req.tenantModels.Fournisseur.create({ nom, email, telephone });
      res.status(201).json(fournisseur);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la création du fournisseur.', error: error.message });
    }
  };
  
  exports.listerTous = async (req, res) => {
    try {
      const fournisseurs = await req.tenantModels.Fournisseur.findAll();
      res.json(fournisseurs);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des fournisseurs.', error: error.message });
    }
  };
  
  exports.obtenirUn = async (req, res) => {
    try {
      const fournisseur = await req.tenantModels.Fournisseur.findByPk(req.params.id);
      if (!fournisseur) return res.status(404).json({ message: 'Fournisseur introuvable.' });
      res.json(fournisseur);
    } catch (error) {
      res.status(500).json({ message: 'Erreur.', error: error.message });
    }
  };
  
  exports.modifier = async (req, res) => {
    try {
      const fournisseur = await req.tenantModels.Fournisseur.findByPk(req.params.id);
      if (!fournisseur) return res.status(404).json({ message: 'Fournisseur introuvable.' });
      await fournisseur.update(req.body);
      res.json(fournisseur);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la modification.', error: error.message });
    }
  };
  
  exports.supprimer = async (req, res) => {
    try {
      const fournisseur = await req.tenantModels.Fournisseur.findByPk(req.params.id);
      if (!fournisseur) return res.status(404).json({ message: 'Fournisseur introuvable.' });
      await fournisseur.destroy();
      res.json({ message: 'Fournisseur supprimé.' });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la suppression.', error: error.message });
    }
  };