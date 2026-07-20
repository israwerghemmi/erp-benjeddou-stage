const bcrypt = require('bcryptjs');
const { Utilisateur, Compte } = require('../models');
const { getTenantConnection } = require('../config/tenantManager');
const sequelize = require('../config/db');

async function seed() {
  await sequelize.authenticate();

  // ⚠️ Remplace ces deux valeurs avant de lancer le script
  const EMAIL_COMPTE_EXISTANT = 'SARL.vision@test.com'; // le compte auquel rattacher ce nouvel utilisateur
  const ID_ROLE = '74084824-dd3d-4e46-91b4-8b9a647f22c6'; // l'id du rôle "Consultant Seul" créé à l'étape 1

  const adminExistant = await Utilisateur.findOne({ where: { email: EMAIL_COMPTE_EXISTANT }, include: Compte });
  if (!adminExistant) {
    console.log('Compte admin introuvable.');
    process.exit(1);
  }

  const emailTest = 'consultant.test@vision.com';
  const motDePasseHash = await bcrypt.hash('Consultant123!', 10);

  const nouvelUtilisateur = await Utilisateur.create({
    nom: 'Consultant Test',
    email: emailTest,
    mot_de_passe: motDePasseHash,
    role: 'utilisateur', // rôle de haut niveau : simple utilisateur, PAS admin_compte
    compte_id: adminExistant.compte_id,
  });

  const { models: tenantModels } = await getTenantConnection(adminExistant.Compte.db_name);
  const departement = await tenantModels.Departement.findOne();

  await tenantModels.UtilisateurProfil.create({
    utilisateur_id: nouvelUtilisateur.id,
    departement_id: departement ? departement.id : null,
    role_id: "74084824-dd3d-4e46-91b4-8b9a647f22c6",
  });

  console.log(`✅ Utilisateur test créé : ${emailTest} / Consultant123!`);
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });