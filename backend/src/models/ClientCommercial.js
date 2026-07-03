const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ClientCommercial = sequelize.define('ClientCommercial', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  compte_id: { type: DataTypes.UUID, allowNull: false }, 
  nom: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  telephone: { type: DataTypes.STRING },
  adresse: { type: DataTypes.STRING },
}, { tableName: 'clients_commerciaux', timestamps: true });

module.exports = ClientCommercial;