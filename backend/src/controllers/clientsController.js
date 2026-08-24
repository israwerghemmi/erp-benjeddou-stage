const { journaliserAction } = require('../utils/journaliser');
const { validerEmail, validerTelephone, validerChampsRequis } = require('../utils/validerFormulaire');
exports.creer = async (req, res) => {
  try {
    const { nom, email, telephone, adresse } = req.body;
    const manquants = validerChampsRequis(req.body, ['nom']);
    if (manquants.length > 0) {
      return res.status(400).json({ message: `Champs requis manquants : ${manquants.join(', ')}` });
    }
    if (email && !validerEmail(email)) {
      return res.status(400).json({ message: 'Format d\'email invalide.' });
    }
    if (telephone && !validerTelephone(telephone)) {
      return res.status(400).json({ message: 'Format de téléphone invalide.' });
    }
    const client = await req.tenantModels.ClientCommercial.create({ nom, email, telephone, adresse });
    await journaliserAction(req, 'creation_client', { client_id: client.id, nom: client.nom });
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
    await journaliserAction(req, 'modification_client', { client_id: client.id });
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
    await journaliserAction(req, 'suppression_client', { client_id: req.params.id, nom: client.nom });
    res.json({ message: 'Client supprimé.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression.', error: error.message });
  }
};