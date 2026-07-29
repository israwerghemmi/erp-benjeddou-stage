const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { sequelize } = require('./models');
const { clearTenantCache } = require('./config/tenantManager');

const app = express();
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
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
app.use('/api/equipe', equipeRoutes);
app.use('/api/mfa', mfaRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/paiement-en-ligne', paiementEnLigneRoutes);

app.use('/api/factures', facturesRoutes);
app.use('/api/export', exportRoutes);
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