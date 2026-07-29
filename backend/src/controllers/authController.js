const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Utilisateur, Compte } = require('../models');
const { getTenantConnection } = require('../config/tenantManager');
const journaliser = require('../utils/journaliser');
const { UAParser } = require('ua-parser-js');
const speakeasy = require('speakeasy');

function calculerDureeVerrouillage(nombreEchecs) {
  const paliers = [5, 15, 60, 240, 1440]; // en minutes : 5min, 15min, 1h, 4h, 24h
  const index = Math.min(Math.floor(nombreEchecs / 5) - 1, paliers.length - 1);
  return index >= 0 ? paliers[index] : 0;
}
exports.login = async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;

    const utilisateur = await Utilisateur.findOne({ where: { email }, include: Compte });
    if (!utilisateur) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }
    // Vérifier si le compte est actuellement verrouillé
    if (utilisateur.verrouille_jusqu_a && new Date() < utilisateur.verrouille_jusqu_a) {
      const minutesRestantes = Math.ceil((utilisateur.verrouille_jusqu_a - new Date()) / 60000);
      return res.status(423).json({
        message: `Compte temporairement verrouillé suite à plusieurs tentatives échouées. Réessayez dans ${minutesRestantes} minute(s).`,
      });
    }

    const motDePasseValide = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);
if (!motDePasseValide) {
  utilisateur.tentatives_echouees += 1;

  if (utilisateur.tentatives_echouees % 5 === 0) {
    const dureeMinutes = calculerDureeVerrouillage(utilisateur.tentatives_echouees);
    utilisateur.verrouille_jusqu_a = new Date(Date.now() + dureeMinutes * 60000);
  }
  // Vérification MFA si activé sur ce compte
if (utilisateur.mfa_active) {
  const { code_mfa } = req.body;

  if (!code_mfa) {
    return res.status(206).json({
      message: 'Code MFA requis pour terminer la connexion.',
      mfa_requis: true,
    });
  }

  const codeValide = speakeasy.totp.verify({
    secret: utilisateur.mfa_secret,
    encoding: 'base32',
    token: code_mfa,
    window: 1,
  });

  if (!codeValide) {
    return res.status(401).json({ message: 'Code MFA invalide.' });
  }
}

  await utilisateur.save();
  return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
}
    // Connexion réussie : réinitialiser le compteur
    utilisateur.tentatives_echouees = 0;
    utilisateur.verrouille_jusqu_a = null;


    if (utilisateur.Compte.statut === 'refuse') {
      return res.status(403).json({ message: 'Votre compte a été refusé. Contactez le support.' });
    }
    

    let messageTrial = null;

    if (utilisateur.Compte.abonnement === 'trial') {
      if (utilisateur.Compte.statut === 'expire' || utilisateur.Compte.trial_utilisations_restantes <= 0) {
        utilisateur.Compte.statut = 'expire';
        await utilisateur.Compte.save();
        return res.status(403).json({
          message: 'Votre période d\'essai est terminée (30 connexions atteintes). Veuillez souscrire à un abonnement pour continuer. Vos données restent conservées et exportables.',
          statut: 'expire',
          compte_id: utilisateur.compte_id,
        });
      }
      utilisateur.Compte.trial_utilisations_restantes -= 1;
      await utilisateur.Compte.save();
      messageTrial = `Il vous reste ${utilisateur.Compte.trial_utilisations_restantes} utilisation(s) avant expiration de votre période d'essai.`;
    }

    utilisateur.derniere_connexion = new Date();
    await utilisateur.save();

    const token = jwt.sign(
      { utilisateur_id: utilisateur.id, compte_id: utilisateur.compte_id, db_name: utilisateur.Compte.db_name, role: utilisateur.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    utilisateur.session_token_actif = token;
    await utilisateur.save();
    try {
      const parser = new UAParser(req.headers['user-agent']);
      const resultatUA = parser.getResult();
    
      const { models: tenantModels } = await getTenantConnection(utilisateur.Compte.db_name);
      await journaliser(tenantModels, {
        utilisateur_id: utilisateur.id,
        utilisateur_nom: utilisateur.nom,
        action: 'connexion',
        adresse_ip: req.ip,
        details: {
          navigateur: `${resultatUA.browser.name || 'Inconnu'} ${resultatUA.browser.version || ''}`.trim(),
          systeme_exploitation: `${resultatUA.os.name || 'Inconnu'} ${resultatUA.os.version || ''}`.trim(),
          type_appareil: resultatUA.device.type || 'ordinateur',
        },
      });
    } catch (e) {
      console.error('Erreur journalisation connexion:', e.message);
    }

    return res.json({
      message: 'Connexion réussie.',
      messageTrial,
      token,
      utilisateur: { id: utilisateur.id, nom: utilisateur.nom, email: utilisateur.email, role: utilisateur.role },
      compte: {
        id: utilisateur.Compte.id, nom_entreprise: utilisateur.Compte.nom_entreprise,
        statut: utilisateur.Compte.statut, abonnement: utilisateur.Compte.abonnement,
        trial_utilisations_restantes: utilisateur.Compte.trial_utilisations_restantes,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur lors de la connexion.', error: error.message });
  }
};

