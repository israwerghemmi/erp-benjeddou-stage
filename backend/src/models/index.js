const sequelize = require('../config/db');
const Compte = require('./Compte');
const Utilisateur = require('./Utilisateur');

Compte.hasMany(Utilisateur, { foreignKey: 'compte_id' });
Utilisateur.belongsTo(Compte, { foreignKey: 'compte_id' });

module.exports = { sequelize, Compte, Utilisateur };