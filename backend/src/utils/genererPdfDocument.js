const PDFDocument = require('pdfkit');
const path = require('path');
const genererQrCodeFacture = require('./genererQrCode');

const ENTREPRISE = {
  nom: 'Société Benjeddou Technologie Service',
  activite: 'Vente de matériel informatique & électronique',
  adresse: '123, Avenue Habib Bourguiba, 1000 Tunis, Tunisie',
  telephone: '+216 71 123 456',
  matriculeFiscal: '1234567X',
};

const COULEUR_PRINCIPALE = '#0a2a5e';
const COULEUR_ACCENT = '#e8842c';

const TITRES = {
  bon_livraison: 'BON DE LIVRAISON',
  bon_preparation: 'BON DE PRÉPARATION',
  bon_sortie: 'BON DE SORTIE',
  recu_paiement: 'REÇU DE PAIEMENT',
  facture_proforma: 'FACTURE PRO FORMA',
  facture_avoir: 'FACTURE D\'AVOIR',
};

/**
 * Générateur générique de document commercial.
 * @param {object} params
 * @param {'bon_livraison'|'bon_preparation'|'bon_sortie'|'recu_paiement'|'facture_proforma'|'facture_avoir'} params.typeDocument
 * @param {string} params.numero
 * @param {object} params.client - { nom, adresse, telephone, email }
 * @param {Array} params.lignes - [{ nom, quantite, prixUnitaire }]
 * @param {string} [params.mentionSpeciale] - texte libre (ex: motif d'avoir)
 * @param {string} params.dbNameTenant - pour le QR code de vérification
 * @param {object} res - réponse Express (stream direct)
 */
async function genererPdfDocument({ typeDocument, numero, client, lignes = [], mentionSpeciale, dbNameTenant }, res) {
  const titre = TITRES[typeDocument] || 'DOCUMENT';
  const qrCodeBuffer = dbNameTenant
    ? await genererQrCodeFacture(numero, dbNameTenant, process.env.FRONTEND_URL || 'http://localhost:5173')
    : null;

  const doc = new PDFDocument({ size: 'A4', margin: 0 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${numero}.pdf`);
  doc.pipe(res);

  const largeurPage = doc.page.width;

  // En-tête
  doc.rect(0, 0, largeurPage, 110).fill(COULEUR_PRINCIPALE);

  // --- Bloc gauche : nom de la société, activité, adresse ---
  const largeurGauche = 280;
  doc.fillColor('#ffffff').fontSize(13).font('Helvetica-Bold');
  const hauteurNom = doc.heightOfString(ENTREPRISE.nom, { width: largeurGauche });
  doc.text(ENTREPRISE.nom, 40, 20, { width: largeurGauche });

  let yGauche = 20 + hauteurNom + 4;
  doc.fontSize(9).font('Helvetica');
  doc.text(ENTREPRISE.activite, 40, yGauche, { width: largeurGauche });
  yGauche += 12;
  doc.text(ENTREPRISE.adresse, 40, yGauche, { width: largeurGauche });

  // --- Bloc droit : titre du document, numéro, date ---
  const largeurDroite = 140;
  doc.fillColor('#ffffff').fontSize(14).font('Helvetica-Bold');
  const hauteurTitre = doc.heightOfString(titre, { width: largeurDroite, align: 'right' });
  doc.text(titre, 340, 20, { width: largeurDroite, align: 'right' });

  let yDroite = 20 + hauteurTitre + 4;
  doc.fontSize(9).font('Helvetica');
  doc.text(`N° ${numero}`, 340, yDroite, { width: largeurDroite, align: 'right' });
  yDroite += 12;
  doc.text(`Date : ${new Date().toLocaleString('fr-FR')}`, 340, yDroite, { width: largeurDroite, align: 'right' });

  if (qrCodeBuffer) {
    doc.rect(largeurPage - 90, 18, 70, 70).fill('#ffffff');
    doc.image(qrCodeBuffer, largeurPage - 85, 23, { width: 60 });
  }

  let y = 130;

  // Destinataire
  doc.fillColor('#000').fontSize(11).font('Helvetica-Bold').text('Destinataire', 40, y);
  y += 16;
  doc.fontSize(9).font('Helvetica');
  doc.text(client?.nom || '-', 40, y, { width: 400 });
  y += 12;
  if (client?.adresse) { doc.text(client.adresse, 40, y, { width: 400 }); y += 12; }
  if (client?.telephone) { doc.text(`Tél : ${client.telephone}`, 40, y, { width: 400 }); y += 12; }

  y += 20;

  // Tableau des lignes (si applicable — un reçu de paiement n'en a pas forcément)
  if (lignes.length > 0) {
    const colonnes = [
      { label: 'Désignation', x: 40, width: 280 },
      { label: 'Qté', x: 320, width: 60 },
      { label: 'Prix unitaire', x: 380, width: 100 },
      { label: 'Total', x: 480, width: 60 },
    ];

    doc.rect(40, y, largeurPage - 80, 22).fill(COULEUR_PRINCIPALE);
    colonnes.forEach((col) => {
      doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold').text(col.label, col.x + 4, y + 6, { width: col.width - 8 });
    });
    y += 22;

    lignes.forEach((ligne) => {
      const total = (ligne.quantite || 1) * (ligne.prixUnitaire || 0);
      doc.fillColor('#000').fontSize(9).font('Helvetica');
      doc.text(ligne.nom, colonnes[0].x + 4, y + 5, { width: colonnes[0].width - 8 });
      doc.text(String(ligne.quantite || 1), colonnes[1].x + 4, y + 5, { width: colonnes[1].width - 8 });
      doc.text(`${(ligne.prixUnitaire || 0).toFixed(3)} DT`, colonnes[2].x + 4, y + 5, { width: colonnes[2].width - 8 });
      doc.fillColor(COULEUR_ACCENT).font('Helvetica-Bold').text(`${total.toFixed(3)} DT`, colonnes[3].x + 4, y + 5, { width: colonnes[3].width - 8 });
      doc.moveTo(40, y + 20).lineTo(largeurPage - 40, y + 20).strokeColor('#e5e7eb').stroke();
      y += 24;
    });
    y += 10;
  }

  // Mention spéciale (motif d'avoir, note de livraison, etc.)
  if (mentionSpeciale) {
    doc.rect(40, y, largeurPage - 80, 40).fill('#f3f4f6');
    doc.fillColor('#000').fontSize(9).font('Helvetica').text(mentionSpeciale, 50, y + 12, { width: largeurPage - 100 });
    y += 55;
  }

  doc.fontSize(8).fillColor('#6b7280').text('Document généré automatiquement.', 0, doc.page.height - 40, { align: 'center' });

  doc.end();
}

module.exports = genererPdfDocument;