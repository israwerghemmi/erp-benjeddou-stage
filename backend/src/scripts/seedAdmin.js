const bcrypt = require('bcryptjs');
const { Utilisateur, Compte } = require('../models');
const sequelize = require('../config/db');

async function seedAdmin() {
  await sequelize.authenticate();

  const email = 'admin.plateforme@benjeddou.com';
  const motDePasseHash = await bcrypt.hash('AdminPlateforme2026!', 10);

  const existant = await Utilisateur.findOne({ where: { email } });
  if (existant) {
    console.log('Admin plateforme déjà existant.');
    process.exit(0);
  }

  // Compte technique associé (nécessaire car Utilisateur est lié à un Compte)
  const compteAdmin = await Compte.create({
    nom_entreprise: 'BENJEDDOU - Administration Plateforme',
    email: 'plateforme@benjeddou.com',
    statut: 'actif',
    abonnement: 'annuel',
  });

  await Utilisateur.create({
    nom: 'Administrateur Plateforme',
    email,
    mot_de_passe: motDePasseHash,
    role: 'admin_plateforme',
    compte_id: compteAdmin.id,
  });

  console.log('✅ Admin plateforme créé : admin.plateforme@benjeddou.com / AdminPlateforme2026!');
  process.exit(0);
}

seedAdmin().catch((err) => { console.error(err); process.exit(1); });