const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Fournisseur = sequelize.define('Fournisseur', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  compte_id: { type: DataTypes.UUID, allowNull: false },
  nom: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true },
  telephone: { type: DataTypes.STRING },
}, { tableName: 'fournisseurs', timestamps: true });

module.exports = Fournisseur;