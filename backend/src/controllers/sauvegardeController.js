const { exec } = require('child_process');
const { Compte } = require('../models');

exports.creerSauvegarde = async (req, res) => {
  try {
    const compte = await Compte.findByPk(req.user.compte_id);
    if (!compte) return res.status(404).json({ message: 'Compte introuvable.' });

    const nomFichier = `sauvegarde_${compte.db_name}_${Date.now()}.sql`;
    const commande = `docker exec erp_postgres pg_dump -U postgres ${compte.db_name}`;

    exec(commande, { maxBuffer: 1024 * 1024 * 50 }, (error, stdout) => {
      if (error) {
        return res.status(500).json({ message: 'Erreur lors de la sauvegarde.', error: error.message });
      }
      res.setHeader('Content-Type', 'application/sql');
      res.setHeader('Content-Disposition', `attachment; filename=${nomFichier}`);
      res.send(stdout);
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur.', error: error.message });
  }
};