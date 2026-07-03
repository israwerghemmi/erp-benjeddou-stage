const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Produit = sequelize.define('Produit', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  compte_id: { type: DataTypes.UUID, allowNull: false },
  nom: { type: DataTypes.STRING, allowNull: false },
  reference: { type: DataTypes.STRING, unique: true },
  prix: { type: DataTypes.FLOAT, allowNull: false },
  quantite_stock: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'produits', timestamps: true });

module.exports = Produit;