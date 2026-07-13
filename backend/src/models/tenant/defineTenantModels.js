const { DataTypes } = require('sequelize');

module.exports = function defineTenantModels(sequelize) {
  const Departement = sequelize.define('Departement', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nom: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING },
  }, { tableName: 'departements', timestamps: true });

  const Role = sequelize.define('Role', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nom: { type: DataTypes.STRING, allowNull: false },
    permissions: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  }, { tableName: 'roles', timestamps: true });

  const UtilisateurProfil = sequelize.define('UtilisateurProfil', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    utilisateur_id: { type: DataTypes.UUID, allowNull: false }, // référence l'Utilisateur du master (pas de FK inter-bases)
    departement_id: { type: DataTypes.UUID, allowNull: true },
    role_id: { type: DataTypes.UUID, allowNull: true },
  }, { tableName: 'utilisateurs_profils', timestamps: true });

  const ClientCommercial = sequelize.define('ClientCommercial', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nom: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING },
    telephone: { type: DataTypes.STRING },
    adresse: { type: DataTypes.STRING },
  }, { tableName: 'clients_commerciaux', timestamps: true });

  const Fournisseur = sequelize.define('Fournisseur', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nom: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING },
    telephone: { type: DataTypes.STRING },
  }, { tableName: 'fournisseurs', timestamps: true });

  const Produit = sequelize.define('Produit', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nom: { type: DataTypes.STRING, allowNull: false },
    reference: { type: DataTypes.STRING },
    prix: { type: DataTypes.FLOAT, allowNull: false },
    quantite_stock: { type: DataTypes.INTEGER, defaultValue: 0 },
  }, { tableName: 'produits', timestamps: true });

  const Devis = sequelize.define('Devis', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    numero: { type: DataTypes.STRING, allowNull: false },
    date_creation: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
    statut: { type: DataTypes.ENUM('en_attente', 'accepte', 'refuse'), defaultValue: 'en_attente' },
    montant_total: { type: DataTypes.FLOAT, defaultValue: 0 },
  }, { tableName: 'devis', timestamps: true });

  const Commande = sequelize.define('Commande', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    numero: { type: DataTypes.STRING, allowNull: false },
    date_creation: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
    statut: { type: DataTypes.ENUM('en_cours', 'livree', 'annulee'), defaultValue: 'en_cours' },
    montant_total: { type: DataTypes.FLOAT, defaultValue: 0 },
  }, { tableName: 'commandes', timestamps: true });
  const Paiement = sequelize.define('Paiement', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    reference: { type: DataTypes.STRING, allowNull: false },
    montant: { type: DataTypes.FLOAT, allowNull: false },
    mode_paiement: { type: DataTypes.ENUM('especes', 'cheque', 'virement', 'carte'), defaultValue: 'especes' },
    date_paiement: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
    commande_id: { type: DataTypes.UUID, allowNull: true },
  }, { tableName: 'paiements', timestamps: true });
  
  const Depense = sequelize.define('Depense', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    libelle: { type: DataTypes.STRING, allowNull: false },
    montant: { type: DataTypes.FLOAT, allowNull: false },
    categorie: { type: DataTypes.STRING },
    date_depense: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  }, { tableName: 'depenses', timestamps: true });
  
  const Recette = sequelize.define('Recette', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    libelle: { type: DataTypes.STRING, allowNull: false },
    montant: { type: DataTypes.FLOAT, allowNull: false },
    categorie: { type: DataTypes.STRING },
    date_recette: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  }, { tableName: 'recettes', timestamps: true });

  Departement.hasMany(UtilisateurProfil, { foreignKey: 'departement_id' });
  UtilisateurProfil.belongsTo(Departement, { foreignKey: 'departement_id' });

  Role.hasMany(UtilisateurProfil, { foreignKey: 'role_id' });
  UtilisateurProfil.belongsTo(Role, { foreignKey: 'role_id' });

  ClientCommercial.hasMany(Devis, { foreignKey: 'client_id' });
  Devis.belongsTo(ClientCommercial, { foreignKey: 'client_id' });

  ClientCommercial.hasMany(Commande, { foreignKey: 'client_id' });
  Commande.belongsTo(ClientCommercial, { foreignKey: 'client_id' });

  Fournisseur.hasMany(Produit, { foreignKey: 'fournisseur_id' });
  Produit.belongsTo(Fournisseur, { foreignKey: 'fournisseur_id' });

  Devis.belongsToMany(Produit, { through: 'devis_produit', foreignKey: 'devis_id' });
  Produit.belongsToMany(Devis, { through: 'devis_produit', foreignKey: 'produit_id' });

  Commande.belongsToMany(Produit, { through: 'commande_produit', foreignKey: 'commande_id' });
  Produit.belongsToMany(Commande, { through: 'commande_produit', foreignKey: 'produit_id' });

  Commande.hasMany(Paiement, { foreignKey: 'commande_id' });
  Paiement.belongsTo(Commande, { foreignKey: 'commande_id' });

  return { Departement, Role, UtilisateurProfil, ClientCommercial, Fournisseur, Produit, Devis, Commande, Paiement, Depense, Recette };
};