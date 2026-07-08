const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { sequelize } = require('./models');

const app = express();
app.use(cors());
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

sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ Tables synchronisées avec PostgreSQL');
    app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));
  })
  .catch((err) => console.error('❌ Erreur de synchronisation :', err));