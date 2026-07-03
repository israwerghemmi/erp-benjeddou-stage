const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Utilisateur, Compte } = require('../models');

exports.login = async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;

    const utilisateur = await Utilisateur.findOne({ where: { email }, include: Compte });
    if (!utilisateur) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    const motDePasseValide = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);
    if (!motDePasseValide) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    if (utilisateur.Compte.statut === 'refuse') {
      return res.status(403).json({ message: 'Votre compte a été refusé. Contactez le support.' });
    }

    // Mise à jour de la traçabilité de connexion
    utilisateur.derniere_connexion = new Date();
    await utilisateur.save();

    const token = jwt.sign(
      { utilisateur_id: utilisateur.id, compte_id: utilisateur.compte_id, role: utilisateur.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      message: 'Connexion réussie.',
      token,
      utilisateur: { id: utilisateur.id, nom: utilisateur.nom, email: utilisateur.email, role: utilisateur.role },
      compte: { id: utilisateur.Compte.id, nom_entreprise: utilisateur.Compte.nom_entreprise, statut: utilisateur.Compte.statut },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur lors de la connexion.', error: error.message });
  }
};