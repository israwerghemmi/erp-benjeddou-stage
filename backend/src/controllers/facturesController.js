const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType } = require('docx');

exports.genererDepuisCommande = async (req, res) => {
  try {
    const { Commande, ClientCommercial, Produit, Facture } = req.tenantModels;
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
exports.exporterExcel = async (req, res) => {
  try {
    const { Facture, Commande, ClientCommercial } = req.tenantModels;
    const factures = await Facture.findAll({
      include: [{ model: Commande, include: [ClientCommercial] }],
      order: [['date_emission', 'DESC']],
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Factures');

    sheet.columns = [
      { header: 'Numéro', key: 'numero', width: 22 },
      { header: 'Date émission', key: 'date_emission', width: 15 },
      { header: 'Client', key: 'client', width: 25 },
      { header: 'Commande', key: 'commande', width: 15 },
      { header: 'Statut', key: 'statut', width: 12 },
      { header: 'Montant TTC (DT)', key: 'montant', width: 18 },
    ];

    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } };
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    factures.forEach((f) => {
      sheet.addRow({
        numero: f.numero,
        date_emission: f.date_emission,
        client: f.Commande?.ClientCommercial?.nom || '-',
        commande: f.Commande?.numero || '-',
        statut: f.statut,
        montant: f.montant_ttc,
      });
    });

    // Ligne de total
    const totalRow = sheet.addRow({ numero: '', date_emission: '', client: '', commande: '', statut: 'TOTAL', montant: factures.reduce((s, f) => s + f.montant_ttc, 0) });
    totalRow.font = { bold: true };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=historique_factures.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'export Excel.', error: error.message });
  }
};
exports.exporterWord = async (req, res) => {
  try {
    const { Facture, Commande, ClientCommercial, Produit } = req.tenantModels;
    const facture = await Facture.findByPk(req.params.id, {
      include: [{ model: Commande, include: [ClientCommercial, Produit] }],
    });

    if (!facture) return res.status(404).json({ message: 'Facture introuvable.' });

    const client = facture.Commande?.ClientCommercial;
    const produits = facture.Commande?.Produits || [];

    const lignesProduits = produits.map((p) => {
      const qte = p.commande_produit?.quantite || 1;
      const prixU = p.commande_produit?.prix_unitaire || p.prix;
      return new TableRow({
        children: [
          new TableCell({ children: [new Paragraph(p.nom)] }),
          new TableCell({ children: [new Paragraph(String(qte))] }),
          new TableCell({ children: [new Paragraph(`${prixU} DT`)] }),
        ],
      });
    });

    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({ text: 'FACTURE', heading: 'Title', alignment: AlignmentType.CENTER }),
          new Paragraph({ text: `Numéro : ${facture.numero}` }),
          new Paragraph({ text: `Date d'émission : ${facture.date_emission}` }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: 'Client :', heading: 'Heading2' }),
          new Paragraph({ text: client?.nom || '-' }),
          new Paragraph({ text: client?.email || '' }),
          new Paragraph({ text: '' }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('Produit')] }),
                  new TableCell({ children: [new Paragraph('Quantité')] }),
                  new TableCell({ children: [new Paragraph('Prix unitaire')] }),
                ],
              }),
              ...lignesProduits,
            ],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: `Montant total TTC : ${facture.montant_ttc} DT`, alignment: AlignmentType.RIGHT }),
        ],
      }],
    });

    const buffer = await Packer.toBuffer(doc);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename=${facture.numero}.docx`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'export Word.', error: error.message });
  }
};