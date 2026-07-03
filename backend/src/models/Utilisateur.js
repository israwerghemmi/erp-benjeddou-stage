const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Utilisateur = sequelize.define('Utilisateur', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  nom: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  mot_de_passe: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('admin_plateforme', 'admin_compte', 'utilisateur'), defaultValue: 'utilisateur' },
  derniere_connexion: { type: DataTypes.DATE, allowNull: true },
}, { tableName: 'utilisateurs', timestamps: true });

module.exports = Utilisateur;