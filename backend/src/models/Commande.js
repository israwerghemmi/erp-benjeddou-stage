const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Commande = sequelize.define('Commande', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  compte_id: { type: DataTypes.UUID, allowNull: false },
  numero: { type: DataTypes.STRING, unique: true, allowNull: false },
  date_creation: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  statut: { type: DataTypes.ENUM('en_cours', 'livree', 'annulee'), defaultValue: 'en_cours' },
  montant_total: { type: DataTypes.FLOAT, defaultValue: 0 },
}, { tableName: 'commandes', timestamps: true });

module.exports = Commande;