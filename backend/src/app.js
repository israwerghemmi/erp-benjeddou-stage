const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { sequelize } = require('./models');
const { clearTenantCache } = require('./config/tenantManager');

// 🆕 AJOUT — juste après les imports existants
const helmet = require('helmet');
const sanitizeMiddleware = require('./middlewares/sanitize');
const { apiLimiter, sensitiveLimiter } = require('./middlewares/rateLimiter');

const app = express();
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
};

// 🆕 AJOUT — avant cors(), en tout premier middleware
app.use(helmet());

app.use(cors(corsOptions));
app.use(express.json());

// 🆕 AJOUT — juste après express.json(), car sanitize a besoin du body déjà parsé
app.use(sanitizeMiddleware);

// 🆕 AJOUT — limiteur global sur toute l'API, avant le montage des routes
app.use('/api', apiLimiter);

const comptesRoutes = require('./routes/comptesRoutes');
const authRoutes = require('./routes/authRoutes');
const testRoutes = require('./routes/testRoutes');
const departementsRoutes = require('./routes/departementsRoutes');
const clientsRoutes = require('./routes/clientsRoutes');
const produitsRoutes = require('./routes/produitsRoutes');
const fournisseursRoutes = require('./routes/fournisseursRoutes');
const devisRoutes = require('./routes/devisRoutes');
const commandesRoutes = require('./routes/commandesRoutes');
const rolesRoutes = require('./routes/rolesRoutes');
const paiementsRoutes = require('./routes/paiementsRoutes');
const depensesRoutes = require('./routes/depensesRoutes');
const recettesRoutes = require('./routes/recettesRoutes');
const rapportsFinanciersRoutes = require('./routes/rapportsFinanciersRoutes');
const exportRoutes = require('./routes/exportRoutes');
const facturesRoutes = require('./routes/facturesRoutes');
const paiementEnLigneRoutes = require('./routes/paiementEnLigneRoutes');
const journalRoutes = require('./routes/journalRoutes');
const mfaRoutes = require('./routes/mfaRoutes');
const equipeRoutes = require('./routes/equipeRoutes');
const sauvegardeRoutes = require('./routes/sauvegardeRoutes');
const rechercheRoutes = require('./routes/rechercheRoutes');
const statistiquesRoutes = require('./routes/statistiquesRoutes');
const kycRoutes = require('./routes/kycRoutes');
const stockRoutes = require('./routes/stockRoutes');
const documentRoutes = require('./routes/documentRoutes');
const documentsCommerciauxRoutes = require('./routes/documentsCommerciauxRoutes');
app.use('/api/documents-commerciaux', documentsCommerciauxRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/statistiques', statistiquesRoutes);
app.use('/api/recherche', rechercheRoutes);

// 🆕 AJOUT — limiteur strict, à placer AVANT le app.use(route) correspondant
app.use('/api/sauvegarde', sensitiveLimiter);
app.use('/api/sauvegarde', sauvegardeRoutes);

// 🆕 AJOUT
app.use('/api/equipe', sensitiveLimiter);
app.use('/api/equipe', equipeRoutes);

// 🆕 AJOUT
app.use('/api/mfa', sensitiveLimiter);
app.use('/api/mfa', mfaRoutes);

// 🆕 AJOUT
app.use('/api/journal', sensitiveLimiter);
app.use('/api/journal', journalRoutes);

// 🆕 AJOUT
app.use('/api/paiement-en-ligne', sensitiveLimiter);
app.use('/api/paiement-en-ligne', paiementEnLigneRoutes);

// 🆕 AJOUT
app.use('/api/export', sensitiveLimiter);
app.use('/api/export', exportRoutes);

app.use('/api/factures', facturesRoutes);
app.use('/api/paiements', paiementsRoutes);
app.use('/api/depenses', depensesRoutes);
app.use('/api/recettes', recettesRoutes);
app.use('/api/rapports-financiers', rapportsFinanciersRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/devis', devisRoutes);
app.use('/api/commandes', commandesRoutes);
app.use('/api/produits', produitsRoutes);
app.use('/api/fournisseurs', fournisseursRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/departements', departementsRoutes);
app.use('/api/test', testRoutes);
app.use('/api/comptes', comptesRoutes);
app.use('/api/auth', authRoutes);
app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running' });
});

const PORT = process.env.PORT || 5000;
clearTenantCache();

sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ Tables synchronisées avec PostgreSQL');
    app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));
  })
  .catch((err) => console.error('❌ Erreur de synchronisation :', err));