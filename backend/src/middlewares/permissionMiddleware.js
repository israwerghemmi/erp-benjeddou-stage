/**
 * Vérifie que l'utilisateur connecté a la permission requise sur un module donné.
 * Usage : permissionMiddleware('clients', 'creation')
 */
function permissionMiddleware(module, actionRequise) {
    return async (req, res, next) => {
      try {
        // L'administrateur du compte a toujours tous les droits
        if (req.user.role === 'admin_compte' || req.user.role === 'admin_plateforme') {
          return next();
        }
  
        const { UtilisateurProfil, Role } = req.tenantModels;
        const profil = await UtilisateurProfil.findOne({
          where: { utilisateur_id: req.user.utilisateur_id },
          include: [Role],
        });
  
        if (!profil || !profil.Role) {
          return res.status(403).json({ message: 'Aucun rôle attribué. Accès refusé.' });
        }
  
        const permissionsModule = profil.Role.permissions[module] || profil.Role.permissions['tous_modules'];
  
        if (!permissionsModule || !permissionsModule.includes(actionRequise)) {
          return res.status(403).json({
            message: `Permission refusée : action "${actionRequise}" non autorisée sur le module "${module}".`,
          });
        }
  
        next();
      } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la vérification des permissions.', error: error.message });
      }
    };
  }
  
  module.exports = permissionMiddleware;