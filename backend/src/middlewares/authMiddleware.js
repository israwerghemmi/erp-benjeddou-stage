const jwt = require('jsonwebtoken');
const { Utilisateur } = require('../models');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer')) {
    return res.status(401).json({ message: 'Token manquant.' });
  }

  const token = authHeader.replace('Bearer', '').trim();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const utilisateur = await Utilisateur.findByPk(decoded.utilisateur_id);
    if (!utilisateur || utilisateur.session_token_actif !== token) {
      return res.status(401).json({ message: 'Session invalidée : une connexion plus récente a été détectée ailleurs.' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide ou expiré.' });
  }
};