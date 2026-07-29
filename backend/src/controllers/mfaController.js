const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const { Utilisateur } = require('../models');

// Étape 1 : générer un secret et son QR Code
exports.genererSecret = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findByPk(req.user.utilisateur_id);
    if (!utilisateur) return res.status(404).json({ message: 'Utilisateur introuvable.' });

    const secret = speakeasy.generateSecret({
      name: `ERP Benjeddou (${utilisateur.email})`,
    });

    utilisateur.mfa_secret = secret.base32;
    await utilisateur.save();

    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    res.json({ qrCodeUrl, secret: secret.base32 });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la génération du secret MFA.', error: error.message });
  }
};

// Étape 2 : vérifier le code et activer le MFA
exports.activerMfa = async (req, res) => {
  try {
    const { code } = req.body;
    const utilisateur = await Utilisateur.findByPk(req.user.utilisateur_id);

    const verifie = speakeasy.totp.verify({
      secret: utilisateur.mfa_secret,
      encoding: 'base32',
      token: code,
      window: 1,
    });

    if (!verifie) {
      return res.status(400).json({ message: 'Code invalide.' });
    }

    utilisateur.mfa_active = true;
    await utilisateur.save();

    res.json({ message: 'MFA activé avec succès.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'activation du MFA.', error: error.message });
  }
};

// Étape 3 : vérifier le code lors de la connexion (utilisé dans authController)
exports.verifierCodeMfa = (secretBase32, code) => {
  return speakeasy.totp.verify({
    secret: secretBase32,
    encoding: 'base32',
    token: code,
    window: 1,
  });
};