const PDFDocument = require('pdfkit');

exports.genererDepuisCommande = async (req, res) => {
  try {
    const { Commande, ClientCommercial, Produit, Facture } = req.tenantModels;

    console.log('Commande:', typeof Commande);
    console.log('ClientCommercial:', typeof ClientCommercial);
    console.log('Produit:', typeof Produit);
    console.log('Facture:', typeof Facture);
    console.log('Tous les modèles disponibles:', Object.keys(req.tenantModels));

    const commande = await Commande.findByPk(req.params.commandeId, {
      include: [ClientCommercial, Produit],
    });

    if (!commande) return res.status(404).json({ message: 'Commande introuvable.' });

    const factureExistante = await Facture.findOne({ where: { commande_id: commande.id } });
    if (factureExistante) {
      return res.status(400).json({ message: 'Une facture existe déjà pour cette commande.', facture: factureExistante });
    }

    const numero = `FACT-${Date.now()}`;
    const facture = await Facture.create({
      numero,
      commande_id: commande.id,
      montant_ttc: commande.montant_total,
      statut: 'emise',
    });

    res.status(201).json({ message: 'Facture générée avec succès.', facture });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la génération de la facture.', error: error.message });
  }
};

exports.listerToutes = async (req, res) => {
  try {
    const { Facture, Commande, ClientCommercial } = req.tenantModels;
    const factures = await Facture.findAll({
      include: [{ model: Commande, include: [ClientCommercial] }],
      order: [['date_emission', 'DESC']],
    });
    res.json(factures);
  } catch (error) {
    res.status(500).json({ message: 'Erreur.', error: error.message });
  }
};

exports.telechargerPdf = async (req, res) => {
  try {
    const { Facture, Commande, ClientCommercial, Produit } = req.tenantModels;
    const facture = await Facture.findByPk(req.params.id, {
      include: [{ model: Commande, include: [ClientCommercial, Produit] }],
    });

    if (!facture) return res.status(404).json({ message: 'Facture introuvable.' });

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${facture.numero}.pdf`);
    doc.pipe(res);

    doc.fontSize(20).text('FACTURE', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Numéro : ${facture.numero}`);
    doc.text(`Date d'émission : ${facture.date_emission}`);
    doc.moveDown();

    const client = facture.Commande?.ClientCommercial;
    if (client) {
      doc.fontSize(12).text('Client :', { underline: true });
      doc.fontSize(10).text(client.nom);
      if (client.email) doc.text(client.email);
      if (client.adresse) doc.text(client.adresse);
      doc.moveDown();
    }

    doc.fontSize(12).text('Détail :', { underline: true });
    doc.moveDown(0.5);
    const produits = facture.Commande?.Produits || [];
    produits.forEach((p) => {
      const qte = p.commande_produit?.quantite || 1;
      const prixU = p.commande_produit?.prix_unitaire || p.prix;
      doc.fontSize(10).text(`${p.nom}  x${qte}  —  ${prixU} DT`);
    });

    doc.moveDown();
    doc.fontSize(12).text(`Montant total TTC : ${facture.montant_ttc} DT`, { align: 'right' });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la génération du PDF.', error: error.message });
  }
};

exports.supprimer = async (req, res) => {
  try {
    const facture = await req.tenantModels.Facture.findByPk(req.params.id);
    if (!facture) return res.status(404).json({ message: 'Facture introuvable.' });
    await facture.destroy();
    res.json({ message: 'Facture supprimée.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression.', error: error.message });
  }
};