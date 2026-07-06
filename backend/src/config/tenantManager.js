const { Sequelize } = require('sequelize');
const { Client } = require('pg');
require('dotenv').config();
const defineTenantModels = require('../models/tenant/defineTenantModels');

// Cache des connexions actives : évite de rouvrir une connexion à chaque requête
const tenantConnections = new Map();

async function createTenantDatabase(dbName) {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres', // connexion à la base système, seule capable d'en créer une nouvelle
  });
  await client.connect();
  try {
    await client.query(`CREATE DATABASE "${dbName}"`);
    console.log(`✅ Base tenant créée : ${dbName}`);
  } catch (err) {
    if (err.code !== '42P04') throw err; // 42P04 = existe déjà, on ignore
  } finally {
    await client.end();
  }
}

async function getTenantConnection(dbName) {
  if (tenantConnections.has(dbName)) return tenantConnections.get(dbName);

  const sequelize = new Sequelize(dbName, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
  });

  const models = defineTenantModels(sequelize);
  await sequelize.sync({ alter: true });

  const connection = { sequelize, models };
  tenantConnections.set(dbName, connection);
  return connection;
}

async function provisionTenant(dbName) {
  await createTenantDatabase(dbName);
  return getTenantConnection(dbName);
}

module.exports = { getTenantConnection, provisionTenant };