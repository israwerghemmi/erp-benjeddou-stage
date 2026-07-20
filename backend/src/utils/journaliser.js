async function journaliser(tenantModels, { utilisateur_id, utilisateur_nom, action, details, adresse_ip }) {
  try {
    await tenantModels.JournalAudit.create({ utilisateur_id, utilisateur_nom, action, details, adresse_ip });
  } catch (error) {
    console.error('Erreur lors de la journalisation :', error.message);
  }
}

// Assistant simplifié utilisable directement depuis un contrôleur avec req
async function journaliserAction(req, action, details = null) {
  try {
    await journaliser(req.tenantModels, {
      utilisateur_id: req.user.utilisateur_id,
      utilisateur_nom: req.user.nom || null,
      action,
      details,
      adresse_ip: req.ip,
    });
  } catch (error) {
    console.error('Erreur journalisation action:', error.message);
  }
}

module.exports = journaliser;
module.exports.journaliserAction = journaliserAction;