const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType } = require('docx');
const path = require('path');
const montantEnLettres = require('../utils/montantEnLettres');
const envoyerEmail = require('../utils/envoyerEmail');
const genererQrCodeFacture = require('../utils/genererQrCode');
const { getTenantConnection } = require('../config/tenantManager');

const ENTREPRISE = {
  nom: 'Société Benjeddou Technologie Service',
  activite: 'Vente de matériel informatique & électronique',
  adresse: '123, Avenue Habib Bourguiba, 1000 Tunis, Tunisie',
  telephone: '+216 71 123 456',
  email: 'contact@benjeddou-tech.tn',
  matriculeFiscal: '1234567X',
  rib: '007 640 0002211300031789 15 2',
  iban: 'MA64 0076 4000 0221 1300 0317 8915 2',
  swift: 'BCMAMAMC',
};

const TVA_TAUX = 0.19;
const COULEUR_PRINCIPALE = '#0a2a5e';
const COULEUR_ACCENT = '#e8842c';

exports.genererDepuisCommande = async (req, res) => {
  try {
    const { Commande, ClientCommercial, Produit, Facture } = req.tenantModels;
    const commande = await Commande.findByPk(req.params.commandeId, {
      include: [ClientCommercial, Produit],
    });
    const montant_en_lettres = montantEnLettres(commande.montant_total);

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
      montant_en_lettres,
      statut: 'emise',
    });
    if (commande.ClientCommercial?.email) {
      envoyerEmail({
        destinataire: commande.ClientCommercial.email,
        sujet: `Facture ${numero}`,
        contenuHtml: `<p>Bonjour, votre facture ${numero} d'un montant de ${commande.montant_total} DT est disponible.</p>`,
      }).catch((e) => console.error('Email non envoyé:', e.message));
    }

    res.status(201).json({ message: 'Facture générée avec succès.', facture });
  } catch (error) {
    console.error('Erreur génération facture :', error);
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
    console.error('Erreur listage factures :', error);
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

    const client = facture.Commande?.ClientCommercial;
    const produits = facture.Commande?.Produits || [];

    const qrCodeBuffer = await genererQrCodeFacture(
      facture.numero,
      req.user.db_name,
      process.env.FRONTEND_URL || 'http://localhost:5173'
    );

    const doc = new PDFDocument({ size: 'A4', margin: 0 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${facture.numero}.pdf`);
    doc.pipe(res);

    const largeurPage = doc.page.width;

    // --- En-tête (corrigé : titre, numéro/date et QR code dans trois zones séparées) ---
    doc.rect(0, 0, largeurPage, 110).fill(COULEUR_PRINCIPALE);
    doc.fillColor('#ffffff').fontSize(14).font('Helvetica-Bold').text(ENTREPRISE.nom, 40, 25, { width: 300 });
    doc.fontSize(9).font('Helvetica').text(ENTREPRISE.activite, 40, 47, { width: 300 });
    doc.text(ENTREPRISE.adresse, 40, 61, { width: 300 });

    doc.fontSize(18).font('Helvetica-Bold').text('FACTURE', 340, 22, { width: 140, align: 'right' });
    doc.fontSize(9).font('Helvetica').text(`N° ${facture.numero}`, 340, 46, { width: 140, align: 'right' });
    doc.text(`Date : ${new Date(facture.date_emission || facture.createdAt).toLocaleString('fr-FR')}`, 340, 60, { width: 140, align: 'right' });

    doc.rect(largeurPage - 90, 18, 70, 70).fill('#ffffff');
    doc.image(qrCodeBuffer, largeurPage - 85, 23, { width: 60 });

    let y = 130;

    // --- Émetteur / Destinataire ---
    doc.fillColor('#000').fontSize(11).font('Helvetica-Bold').text('Émetteur', 40, y);
    doc.fillColor('#000').fontSize(11).font('Helvetica-Bold').text('Destinataire', 320, y);
    y += 16;
    doc.fontSize(9).font('Helvetica');
    doc.text(ENTREPRISE.nom, 40, y, { width: 250 });
    doc.text(client?.nom || '-', 320, y, { width: 220 });
    y += 12;
    doc.text(ENTREPRISE.adresse, 40, y, { width: 250 });
    if (client?.adresse) doc.text(client.adresse, 320, y, { width: 220 });
    y += 12;
    doc.text(`Tél : ${ENTREPRISE.telephone}`, 40, y, { width: 250 });
    if (client?.telephone) doc.text(`Tél : ${client.telephone}`, 320, y, { width: 220 });
    y += 12;
    doc.text(`Matricule Fiscal : ${ENTREPRISE.matriculeFiscal}`, 40, y, { width: 250 });
    if (client?.email) doc.text(client.email, 320, y, { width: 220 });

    y += 30;

    // --- Tableau produits ---
    const colonnes = [
      { label: 'Désignation', x: 40, width: 200 },
      { label: 'Qté', x: 240, width: 50 },
      { label: 'Prix HT', x: 290, width: 80 },
      { label: 'TVA (19%)', x: 370, width: 70 },
      { label: 'Total TTC', x: 440, width: 100 },
    ];

    doc.rect(40, y, largeurPage - 80, 22).fill(COULEUR_PRINCIPALE);
    colonnes.forEach((col) => {
      doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold').text(col.label, col.x + 4, y + 6, { width: col.width - 8 });
    });
    y += 22;

    let totalHT = 0;
    produits.forEach((p) => {
      const qte = p.commande_produit?.quantite || 1;
      const prixU = Number(p.commande_produit?.prix_unitaire || p.prix || 0);
      const ligneHT = qte * prixU;
      const ligneTVA = ligneHT * TVA_TAUX;
      const ligneTTC = ligneHT + ligneTVA;
      totalHT += ligneHT;

      doc.fillColor('#000').fontSize(9).font('Helvetica');
      doc.text(p.nom, colonnes[0].x + 4, y + 5, { width: colonnes[0].width - 8 });
      doc.text(String(qte), colonnes[1].x + 4, y + 5, { width: colonnes[1].width - 8 });
      doc.text(`${prixU.toFixed(3)} DT`, colonnes[2].x + 4, y + 5, { width: colonnes[2].width - 8 });
      doc.text(`${ligneTVA.toFixed(3)} DT`, colonnes[3].x + 4, y + 5, { width: colonnes[3].width - 8 });
      doc.fillColor(COULEUR_ACCENT).font('Helvetica-Bold').text(`${ligneTTC.toFixed(3)} DT`, colonnes[4].x + 4, y + 5, { width: colonnes[4].width - 8 });

      doc.moveTo(40, y + 20).lineTo(largeurPage - 40, y + 20).strokeColor('#e5e7eb').stroke();
      y += 24;
    });

    y += 10;

  // --- Calcul du total réel à partir des lignes affichées (source de vérité du document) ---
  const totalTVA = totalHT * TVA_TAUX;
  const totalTTCCalcule = totalHT + totalTVA;
  const montantEnLettresCalcule = montantEnLettres(totalTTCCalcule);

  // Alerte silencieuse en logs si le montant stocké diverge du total réel des lignes
  if (Math.abs(totalTTCCalcule - Number(facture.montant_ttc)) > 0.01) {
    console.warn(
      `⚠️ Incohérence facture ${facture.numero} : montant_ttc stocké = ${facture.montant_ttc} DT, total réel des lignes = ${totalTTCCalcule.toFixed(3)} DT.`
    );
  }

    // --- Cachet et signature ---
    const cheminCachet = path.join(__dirname, '..', 'assets', 'cachet_societe.png');
    const cheminSignature = path.join(__dirname, '..', 'assets', 'signature_directeur.png');
    try {
      doc.image(cheminCachet, largeurPage - 220, y, { width: 90 });
    } catch (e) {
      console.error('❌ Échec chargement cachet :', cheminCachet, '—', e.message);
    }
    try {
      doc.image(cheminSignature, largeurPage - 120, y + 10, { width: 90 });
    } catch (e) {
      console.error('❌ Échec chargement signature :', cheminSignature, '—', e.message);
    }
    doc.fillColor('#000').fontSize(8).font('Helvetica').text('Cachet & Signature', largeurPage - 220, y + 85, { width: 190, align: 'center' });

    // --- Coordonnées bancaires ---
    y += 110;
    doc.fontSize(8).font('Helvetica-Bold').text('Coordonnées bancaires', 40, y);
    doc.font('Helvetica').fontSize(8);
    doc.text(`RIB : ${ENTREPRISE.rib}`, 40, y + 12);
    doc.text(`IBAN : ${ENTREPRISE.iban}`, 40, y + 24);
    doc.text(`SWIFT : ${ENTREPRISE.swift}`, 40, y + 36);

    doc.fontSize(8).fillColor('#6b7280').text('Merci pour votre confiance !', 0, doc.page.height - 40, { align: 'center' });

    doc.end();
  } catch (error) {
    console.error('Erreur génération PDF facture :', error);
    res.status(500).json({ message: 'Erreur lors de la génération du PDF.', error: error.message });
  }
};

exports.verifierFacture = async (req, res) => {
  try {
    const { dbName, numero } = req.params;
    const { models } = await getTenantConnection(dbName);
    const facture = await models.Facture.findOne({ where: { numero } });

    if (!facture) {
      return res.status(404).json({ valide: false, message: 'Facture introuvable ou identifiant invalide.' });
    }

    res.json({
      valide: true,
      numero: facture.numero,
      montant: facture.montant_ttc,
      date: facture.date_emission,
      statut: facture.statut,
    });
  } catch (error) {
    console.error('Erreur vérification facture :', error);
    res.status(500).json({ valide: false, message: 'Erreur lors de la vérification.' });
  }
};

exports.supprimer = async (req, res) => {
  try {
    const facture = await req.tenantModels.Facture.findByPk(req.params.id);
    if (!facture) return res.status(404).json({ message: 'Facture introuvable.' });
    await facture.destroy();
    res.json({ message: 'Facture supprimée.' });
  } catch (error) {
    console.error('Erreur suppression facture :', error);
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

    const totalRow = sheet.addRow({ numero: '', date_emission: '', client: '', commande: '', statut: 'TOTAL', montant: factures.reduce((s, f) => s + f.montant_ttc, 0) });
    totalRow.font = { bold: true };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=historique_factures.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Erreur export Excel factures :', error);
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
    console.error('Erreur export Word facture :', error);
    res.status(500).json({ message: 'Erreur lors de l\'export Word.', error: error.message });
  }
};