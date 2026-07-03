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