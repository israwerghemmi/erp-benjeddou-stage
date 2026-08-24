const genererPdfDocument = require('../utils/genererPdfDocument');
const { journaliserAction } = require('../utils/journaliser');

exports.genererBonLivraison = async (req, res) => {
  try {
    const { Commande, ClientCommercial, Produit } = req.tenantModels;
    const commande = await Commande.findByPk(req.params.commandeId, { include: [ClientCommercial, Produit] });
    if (!commande) return res.status(404).json({ message: 'Commande introuvable.' });

    const lignes = (commande.Produits || []).map((p) => ({
      nom: p.nom,
      quantite: p.commande_produit?.quantite || 1,
      prixUnitaire: p.commande_produit?.prix_unitaire || p.prix,
    }));

    await journaliserAction(req, 'generation_bon_livraison', { commande_id: commande.id });

    await genererPdfDocument({
      typeDocument: 'bon_livraison',
      numero: `BL-${commande.numero}`,
      client: commande.ClientCommercial,
      lignes,
      dbNameTenant: req.user.db_name,
    }, res);
  } catch (error) {
    console.error('Erreur génération bon de livraison :', error);
    res.status(500).json({ message: 'Erreur.', error: error.message });
  }
};

exports.genererBonSortie = async (req, res) => {
  try {
    const { Commande, ClientCommercial, Produit } = req.tenantModels;
    const commande = await Commande.findByPk(req.params.commandeId, { include: [ClientCommercial, Produit] });
    if (!commande) return res.status(404).json({ message: 'Commande introuvable.' });

    const lignes = (commande.Produits || []).map((p) => ({
      nom: p.nom,
      quantite: p.commande_produit?.quantite || 1,
      prixUnitaire: p.commande_produit?.prix_unitaire || p.prix,
    }));

    await journaliserAction(req, 'generation_bon_sortie', { commande_id: commande.id });

    await genererPdfDocument({
      typeDocument: 'bon_sortie',
      numero: `BS-${commande.numero}`,
      client: commande.ClientCommercial,
      lignes,
      dbNameTenant: req.user.db_name,
    }, res);
  } catch (error) {
    console.error('Erreur génération bon de sortie :', error);
    res.status(500).json({ message: 'Erreur.', error: error.message });
  }
};

exports.genererRecuPaiement = async (req, res) => {
    try {
      const { Paiement, Commande, ClientCommercial } = req.tenantModels;
      const paiement = await Paiement.findByPk(req.params.paiementId, {
        include: [{ model: Commande, include: [ClientCommercial] }],
      });
      if (!paiement) return res.status(404).json({ message: 'Paiement introuvable.' });
  
      await journaliserAction(req, 'generation_recu_paiement', { paiement_id: paiement.id });
  
      await genererPdfDocument({
        typeDocument: 'recu_paiement',
        numero: `RECU-${paiement.reference}`,
        client: paiement.Commande?.ClientCommercial,
        lignes: [{ nom: `Paiement (${paiement.mode_paiement})`, quantite: 1, prixUnitaire: paiement.montant }],
        mentionSpeciale: `Reçu confirmant le paiement de ${paiement.montant} DT par ${paiement.mode_paiement}, en date du ${new Date(paiement.date_paiement).toLocaleDateString('fr-FR')}.`,
        dbNameTenant: req.user.db_name,
      }, res);
    } catch (error) {
      console.error('Erreur génération reçu de paiement :', error);
      res.status(500).json({ message: 'Erreur.', error: error.message });
    }
  };

exports.genererFactureProforma = async (req, res) => {
  try {
    const { Devis, ClientCommercial, Produit } = req.tenantModels;
    const devis = await Devis.findByPk(req.params.devisId, { include: [ClientCommercial, Produit] });
    if (!devis) return res.status(404).json({ message: 'Devis introuvable.' });

    const lignes = (devis.Produits || []).map((p) => ({
      nom: p.nom,
      quantite: p.devis_produit?.quantite || 1,
      prixUnitaire: p.devis_produit?.prix_unitaire || p.prix,
    }));

    await journaliserAction(req, 'generation_facture_proforma', { devis_id: devis.id });

    await genererPdfDocument({
      typeDocument: 'facture_proforma',
      numero: `PROFORMA-${devis.numero}`,
      client: devis.ClientCommercial,
      lignes,
      mentionSpeciale: 'Ce document est une facture pro forma à titre indicatif, sans valeur comptable ni fiscale.',
      dbNameTenant: req.user.db_name,
    }, res);
  } catch (error) {
    console.error('Erreur génération facture pro forma :', error);
    res.status(500).json({ message: 'Erreur.', error: error.message });
  }
};

exports.genererFactureAvoir = async (req, res) => {
  try {
    const { Facture, Commande, ClientCommercial } = req.tenantModels;
    const { motif, montant } = req.body;

    if (!motif || !montant) {
      return res.status(400).json({ message: 'Le motif et le montant de l\'avoir sont requis.' });
    }

    const facture = await Facture.findByPk(req.params.factureId, {
      include: [{ model: Commande, include: [ClientCommercial] }],
    });
    if (!facture) return res.status(404).json({ message: 'Facture introuvable.' });

    await journaliserAction(req, 'generation_facture_avoir', { facture_id: facture.id, montant });

    await genererPdfDocument({
      typeDocument: 'facture_avoir',
      numero: `AVOIR-${facture.numero}`,
      client: facture.Commande?.ClientCommercial,
      lignes: [{ nom: `Avoir sur facture ${facture.numero}`, quantite: 1, prixUnitaire: Number(montant) }],
      mentionSpeciale: `Motif de l'avoir : ${motif}`,
      dbNameTenant: req.user.db_name,
    }, res);
  } catch (error) {
    console.error('Erreur génération facture d\'avoir :', error);
    res.status(500).json({ message: 'Erreur.', error: error.message });
  }
};