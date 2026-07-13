const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Compte = sequelize.define('Compte', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  nom_entreprise: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  telephone: { type: DataTypes.STRING, unique: true },
  type_compte: { type: DataTypes.ENUM('particulier', 'entreprise'), defaultValue: 'entreprise' },
  statut: {
    type: DataTypes.ENUM('en_attente', 'valide', 'actif', 'refuse', 'expire'),
    defaultValue: 'en_attente',
  },
  abonnement: {
    type: DataTypes.ENUM('trial', 'mensuel', 'trimestriel', 'annuel'),
    defaultValue: 'trial',
  },
  trial_utilisations_restantes: { type: DataTypes.INTEGER, defaultValue: 30, allowNull: true },
  date_activation: { type: DataTypes.DATE, allowNull: true },
  db_name: { type: DataTypes.STRING, allowNull: true, unique: true },
}, { tableName: 'comptes', timestamps: true });

module.exports = Compte;