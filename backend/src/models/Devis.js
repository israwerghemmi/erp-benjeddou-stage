const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Devis = sequelize.define('Devis', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  compte_id: { type: DataTypes.UUID, allowNull: false }, 
  numero: { type: DataTypes.STRING, unique: true, allowNull: false },
  date_creation: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  statut: { type: DataTypes.ENUM('en_attente', 'accepte', 'refuse'), defaultValue: 'en_attente' },
  montant_total: { type: DataTypes.FLOAT, defaultValue: 0 },
}, { tableName: 'devis', timestamps: true });

module.exports = Devis;