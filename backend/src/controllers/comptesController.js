const bcrypt = require('bcryptjs');
const { Compte, Utilisateur } = require('../models');
const { provisionTenant } = require('../config/tenantManager');

exports.inscription = async (req, res) => {
  try {
    const { nom_entreprise, email, telephone, type_compte, nom_utilisateur, mot_de_passe } = req.body;

    const compteExistant = await Compte.findOne({ where: { email } });
    if (compteExistant) {
      return res.status(400).json({ message: 'Un compte existe déjà avec cet email.' });
    }

    const compte = await Compte.create({
      nom_entreprise, email, telephone,
      type_compte: type_compte || 'entreprise',
      statut: 'en_attente',
      abonnement: 'trial',
      trial_utilisations_restantes: 30,
    });

    // Génération d'un nom de base unique et sûr (sans tirets)
    const dbName = `tenant_${compte.id.replace(/-/g, '')}`;
    compte.db_name = dbName;
    await compte.save();

    const motDePasseHash = await bcrypt.hash(mot_de_passe, 10);
    const utilisateur = await Utilisateur.create({
      nom: nom_utilisateur, email,
      mot_de_passe: motDePasseHash,
      role: 'admin_compte',
      compte_id: compte.id,
    });

    // Création physique de la base dédiée + tables tenant
    const { models: tenantModels } = await provisionTenant(dbName);

    // Initialisation : département par défaut + rôle admin avec toutes les permissions
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
      message: 'Inscription réussie. Environnement dédié créé. Compte en attente de validation.',
      compte: { id: compte.id, nom_entreprise: compte.nom_entreprise, statut: compte.statut, db_name: dbName },
      utilisateur: { id: utilisateur.id, nom: utilisateur.nom, email: utilisateur.email },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur lors de l\'inscription.', error: error.message });
  }
};