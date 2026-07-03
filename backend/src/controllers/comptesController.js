const bcrypt = require('bcryptjs');
const { Compte, Utilisateur } = require('../models');

exports.inscription = async (req, res) => {
  try {
    const { nom_entreprise, email, telephone, type_compte, nom_utilisateur, mot_de_passe } = req.body;

    // Vérifier si l'email existe déjà (côté Compte ou Utilisateur)
    const compteExistant = await Compte.findOne({ where: { email } });
    if (compteExistant) {
      return res.status(400).json({ message: 'Un compte existe déjà avec cet email.' });
    }

    // 1. Créer le Compte (l'entreprise / tenant)
    const compte = await Compte.create({
      nom_entreprise,
      email,
      telephone,
      type_compte: type_compte || 'entreprise',
      statut: 'en_attente',
      abonnement: 'trial',
      trial_utilisations_restantes: 30,
    });

    // 2. Créer l'Utilisateur admin lié à ce Compte
    const motDePasseHash = await bcrypt.hash(mot_de_passe, 10);
    const utilisateur = await Utilisateur.create({
      nom: nom_utilisateur,
      email,
      mot_de_passe: motDePasseHash,
      role: 'admin_compte',
      compte_id: compte.id,
    });

    return res.status(201).json({
      message: 'Inscription réussie. Votre compte est en attente de validation.',
      compte: { id: compte.id, nom_entreprise: compte.nom_entreprise, statut: compte.statut },
      utilisateur: { id: utilisateur.id, nom: utilisateur.nom, email: utilisateur.email },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur lors de l\'inscription.', error: error.message });
  }
};