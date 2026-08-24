const { journaliserAction } = require('../utils/journaliser');

exports.soumettreDocument = async (req, res) => {
  try {
    const { ClientCommercial } = req.tenantModels;
    const client = await ClientCommercial.findByPk(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client introuvable.' });

    if (!req.file) {
      return res.status(400).json({ message: 'Aucun document fourni.' });
    }

    client.document_identite_url = `/uploads/kyc/${req.file.filename}`;
    client.statut_kyc = 'en_attente';
    client.kyc_commentaire = null;
    await client.save();

    await journaliserAction(req, 'soumission_kyc', { client_id: client.id });

    res.json({ message: 'Document soumis, en attente de vérification.', client });
  } catch (error) {
    console.error('Erreur soumission KYC :', error);
    res.status(500).json({ message: 'Erreur lors de la soumission du document.', error: error.message });
  }
};

exports.listerEnAttente = async (req, res) => {
  try {
    const { ClientCommercial } = req.tenantModels;
    const clients = await ClientCommercial.findAll({ where: { statut_kyc: 'en_attente' } });
    res.json(clients);
  } catch (error) {
    console.error('Erreur listage KYC :', error);
    res.status(500).json({ message: 'Erreur.', error: error.message });
  }
};

exports.validerOuRejeter = async (req, res) => {
  try {
    const { ClientCommercial } = req.tenantModels;
    const { decision, commentaire } = req.body; // decision: 'verifie' | 'rejete'

    if (!['verifie', 'rejete'].includes(decision)) {
      return res.status(400).json({ message: 'Décision invalide.' });
    }

    const client = await ClientCommercial.findByPk(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client introuvable.' });

    client.statut_kyc = decision;
    client.kyc_commentaire = decision === 'rejete' ? (commentaire || 'Document rejeté.') : null;
    client.kyc_verifie_le = new Date();
    await client.save();

    await journaliserAction(req, 'decision_kyc', { client_id: client.id, decision });

    res.json({ message: `Client ${decision === 'verifie' ? 'vérifié' : 'rejeté'}.`, client });
  } catch (error) {
    console.error('Erreur décision KYC :', error);
    res.status(500).json({ message: 'Erreur lors de la décision.', error: error.message });
  }
};