const nodemailer = require('nodemailer');

const transporteur = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function envoyerEmail({ destinataire, sujet, contenuHtml }) {
  try {
    const info = await transporteur.sendMail({
      from: '"ERP Benjeddou" <notifications@erp-benjeddou.com>',
      to: destinataire,
      subject: sujet,
      html: contenuHtml,
    });
    console.log('Email envoyé :', info.messageId);
    return info;
  } catch (error) {
    console.error('Erreur envoi email :', error.message);
    throw error;
  }
}

module.exports = envoyerEmail;