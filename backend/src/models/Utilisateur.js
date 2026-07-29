const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Utilisateur = sequelize.define('Utilisateur', {
  session_token_actif: { type: DataTypes.TEXT, allowNull: true },
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  compte_id: { type: DataTypes.UUID, allowNull: false },
  nom: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  mot_de_passe: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('admin_plateforme', 'admin_compte', 'utilisateur'), defaultValue: 'utilisateur' },
  derniere_connexion: { type: DataTypes.DATE, allowNull: true },
  tentatives_echouees: { type: DataTypes.INTEGER, defaultValue: 0 },
  verrouille_jusqu_a: { type: DataTypes.DATE, allowNull: true },
  mfa_secret: { type: DataTypes.STRING, allowNull: true },
  mfa_active: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'utilisateurs', timestamps: true });


module.exports = Utilisateur;