const bcrypt = require('bcryptjs');
const { Utilisateur } = require('../models');
const { getTenantConnection } = require('../config/tenantManager');
const { journaliserAction } = require('../utils/journaliser');
const validerMotDePasse = require('../utils/validerMotDePasse');

exports.inviter = async (req, res) => {
  try {
    const { nom, email, mot_de_passe, role_id, departement_id } = req.body;

    if (req.user.role !== 'admin_compte') {
      return res.status(403).json({ message: 'Seul l\'administrateur peut ajouter un collaborateur.' });
    }

    const { valide, erreurs } = validerMotDePasse(mot_de_passe);
    if (!valide) {
      return res.status(400).json({ message: 'Mot de passe non conforme.', erreurs });
    }

    const existant = await Utilisateur.findOne({ where: { email } });
    if (existant) {
      return res.status(400).json({ message: 'Un utilisateur existe déjà avec cet email.' });
    }

    const motDePasseHash = await bcrypt.hash(mot_de_passe, 10);
    const nouvelUtilisateur = await Utilisateur.create({
      nom, email,
      mot_de_passe: motDePasseHash,
      role: 'utilisateur',
      compte_id: req.user.compte_id,
    });

    await req.tenantModels.UtilisateurProfil.create({
      utilisateur_id: nouvelUtilisateur.id,
      departement_id: departement_id || null,
      role_id: role_id || null,
    });

    await journaliserAction(req, 'creation_collaborateur', { utilisateur_id: nouvelUtilisateur.id, nom, email });

    res.status(201).json({
      message: 'Collaborateur ajouté avec succès.',
      utilisateur: { id: nouvelUtilisateur.id, nom, email },
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'ajout du collaborateur.', error: error.message });
  }
};

exports.lister = async (req, res) => {
  try {
    const membres = await Utilisateur.findAll({
      where: { compte_id: req.user.compte_id },
      attributes: ['id', 'nom', 'email', 'role', 'derniere_connexion'],
    });

    const { UtilisateurProfil, Role, Departement } = req.tenantModels;
    const profils = await UtilisateurProfil.findAll({ include: [Role, Departement] });

    const membresAvecProfil = membres.map((m) => {
      const profil = profils.find((p) => p.utilisateur_id === m.id);
      return {
        ...m.toJSON(),
        role_nom: profil?.Role?.nom || null,
        departement_nom: profil?.Departement?.nom || null,
      };
    });

    res.json(membresAvecProfil);
  } catch (error) {
    res.status(500).json({ message: 'Erreur.', error: error.message });
  }
};
exports.desactiver = async (req, res) => {
    try {
      if (req.user.role !== 'admin_compte') {
        return res.status(403).json({ message: 'Seul l\'administrateur peut gérer les accès.' });
      }
      const collaborateur = await Utilisateur.findOne({
        where: { id: req.params.id, compte_id: req.user.compte_id },
      });
      if (!collaborateur) return res.status(404).json({ message: 'Collaborateur introuvable.' });
  
      collaborateur.actif = !collaborateur.actif;
      collaborateur.session_token_actif = null; // force la déconnexion immédiate si désactivé
      await collaborateur.save();
  
      await journaliserAction(req, collaborateur.actif ? 'reactivation_collaborateur' : 'desactivation_collaborateur', {
        utilisateur_id: collaborateur.id,
      });
  
      res.json({ message: `Collaborateur ${collaborateur.actif ? 'réactivé' : 'désactivé'}.`, actif: collaborateur.actif });
    } catch (error) {
      res.status(500).json({ message: 'Erreur.', error: error.message });
    }
  };
  
  exports.supprimer = async (req, res) => {
    try {
      if (req.user.role !== 'admin_compte') {
        return res.status(403).json({ message: 'Seul l\'administrateur peut gérer les accès.' });
      }
      const collaborateur = await Utilisateur.findOne({
        where: { id: req.params.id, compte_id: req.user.compte_id },
      });
      if (!collaborateur) return res.status(404).json({ message: 'Collaborateur introuvable.' });
  
      await journaliserAction(req, 'suppression_collaborateur', { utilisateur_id: collaborateur.id, email: collaborateur.email });
      await collaborateur.destroy();
  
      res.json({ message: 'Collaborateur supprimé.' });
    } catch (error) {
      res.status(500).json({ message: 'Erreur.', error: error.message });
    }
  };