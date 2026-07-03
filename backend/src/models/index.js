const sequelize = require('../config/db');
const Compte = require('./Compte');
const Utilisateur = require('./Utilisateur');
const ClientCommercial = require('./ClientCommercial');
const Fournisseur = require('./Fournisseur');
const Produit = require('./Produit');
const Devis = require('./Devis');
const Commande = require('./Commande');

// Un Compte a plusieurs Utilisateurs
Compte.hasMany(Utilisateur, { foreignKey: 'compte_id' });
Utilisateur.belongsTo(Compte, { foreignKey: 'compte_id' });

// Isolation multi-tenant : chaque entité métier appartient à un Compte
Compte.hasMany(ClientCommercial, { foreignKey: 'compte_id' });
ClientCommercial.belongsTo(Compte, { foreignKey: 'compte_id' });

Compte.hasMany(Fournisseur, { foreignKey: 'compte_id' });
Fournisseur.belongsTo(Compte, { foreignKey: 'compte_id' });

Compte.hasMany(Produit, { foreignKey: 'compte_id' });
Produit.belongsTo(Compte, { foreignKey: 'compte_id' });

Compte.hasMany(Devis, { foreignKey: 'compte_id' });
Devis.belongsTo(Compte, { foreignKey: 'compte_id' });

Compte.hasMany(Commande, { foreignKey: 'compte_id' });
Commande.belongsTo(Compte, { foreignKey: 'compte_id' });

// Relations métier existantes (Client → Devis/Commande, etc.)
ClientCommercial.hasMany(Devis, { foreignKey: 'client_id' });
Devis.belongsTo(ClientCommercial, { foreignKey: 'client_id' });

ClientCommercial.hasMany(Commande, { foreignKey: 'client_id' });
Commande.belongsTo(ClientCommercial, { foreignKey: 'client_id' });

Fournisseur.hasMany(Produit, { foreignKey: 'fournisseur_id' });
Produit.belongsTo(Fournisseur, { foreignKey: 'fournisseur_id' });

Devis.belongsToMany(Produit, { through: 'devis_produit', foreignKey: 'devis_id' });
Produit.belongsToMany(Devis, { through: 'devis_produit', foreignKey: 'produit_id' });

Commande.belongsToMany(Produit, { through: 'commande_produit', foreignKey: 'commande_id' });
Produit.belongsToMany(Commande, { through: 'commande_produit', foreignKey: 'produit_id' });

module.exports = { sequelize, Compte, Utilisateur, ClientCommercial, Fournisseur, Produit, Devis, Commande };