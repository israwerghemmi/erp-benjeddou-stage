const bcrypt = require('bcryptjs');
const { Compte, Utilisateur } = require('../models');
const { provisionTenant } = require('../config/tenantManager');
const validerMotDePasse = require('../utils/validerMotDePasse');

exports.inscription = async (req, res) => {
  try {
    const { nom_entreprise, email, telephone, type_compte, nom_utilisateur, mot_de_passe, type_abonnement } = req.body;
    const { valide, erreurs } = validerMotDePasse(mot_de_passe);
    if (!valide) {
      return res.status(400).json({ message: 'Mot de passe non conforme.', erreurs });
    }

    const compteExistant = await Compte.findOne({ where: { email } });
    if (compteExistant) {
      return res.status(400).json({ message: 'Un compte existe déjà avec cet email.' });
    }

    const estEssai = type_abonnement !== 'direct'; // par défaut : essai

    const compte = await Compte.create({
      nom_entreprise, email, telephone,
      type_compte: type_compte || 'entreprise',
      statut: 'en_attente',
      abonnement: estEssai ? 'trial' : 'mensuel',
      trial_utilisations_restantes: estEssai ? 30 : null,
    });

    const nomNettoye = nom_entreprise
       .toLowerCase()
       .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // retire les accents
       .replace(/[^a-z0-9]/g, '_')
       .substring(0, 20);
    const identifiantCourt = compte.id.replace(/-/g, '').substring(0, 9).toUpperCase();
    const dbName = `societe_${nomNettoye}_${identifiantCourt}`;
    compte.db_name = dbName;
    await compte.save();

    const motDePasseHash = await bcrypt.hash(mot_de_passe, 10);
    const utilisateur = await Utilisateur.create({
      nom: nom_utilisateur, email,
      mot_de_passe: motDePasseHash,
      role: 'admin_compte',
      compte_id: compte.id,
    });

    const { models: tenantModels } = await provisionTenant(dbName);

    const departement = await tenantModels.Departement.create({ nom: 'Direction Générale' });
    const role = await tenantModels.Role.create({
      nom: 'Administrateur',
      permissions: { tous_modules: ['consultation', 'creation', 'modification', 'suppression'] },
    });
    await tenantModels.UtilisateurProfil.create({
      utilisateur_id: utilisateur.id,
      departement_id: departement.id,
      role_id: role.id,
    });

    return res.status(201).json({
      message: estEssai
        ? 'Inscription réussie. Vous démarrez avec une période d\'essai de 30 connexions.'
        : 'Inscription réussie. Votre compte est en attente de validation pour l\'abonnement.',
      compte: {
        id: compte.id, nom_entreprise: compte.nom_entreprise,
        statut: compte.statut, abonnement: compte.abonnement,
        trial_utilisations_restantes: compte.trial_utilisations_restantes,
      },
      utilisateur: { id: utilisateur.id, nom: utilisateur.nom, email: utilisateur.email },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur lors de l\'inscription.', error: error.message });
  }
};

exports.listerEnAttente = async (req, res) => {
  try {
    if (req.user.role !== 'admin_plateforme') {
      return res.status(403).json({ message: 'Accès réservé à l\'administrateur plateforme.' });
    }
    const comptes = await Compte.findAll({ where: { statut: 'en_attente' } });
    res.json(comptes);
  } catch (error) {
    res.status(500).json({ message: 'Erreur.', error: error.message });
  }
};

exports.valider = async (req, res) => {
  try {
    if (req.user.role !== 'admin_plateforme') {
      return res.status(403).json({ message: 'Accès réservé à l\'administrateur plateforme.' });
    }
    const compte = await Compte.findByPk(req.params.id);
    if (!compte) return res.status(404).json({ message: 'Compte introuvable.' });

    compte.statut = 'actif';
    compte.date_activation = new Date();
    await compte.save();

    res.json({ message: 'Compte validé et activé.', compte });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la validation.', error: error.message });
  }
};