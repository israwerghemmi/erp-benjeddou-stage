function validerMotDePasse(motDePasse) {
    const erreurs = [];
  
    if (!motDePasse || motDePasse.length < 12) {
      erreurs.push('Le mot de passe doit contenir au moins 12 caractères.');
    }
    if (!/[A-Z]/.test(motDePasse)) {
      erreurs.push('Le mot de passe doit contenir au moins une lettre majuscule.');
    }
    if (!/[a-z]/.test(motDePasse)) {
      erreurs.push('Le mot de passe doit contenir au moins une lettre minuscule.');
    }
    if (!/[0-9]/.test(motDePasse)) {
      erreurs.push('Le mot de passe doit contenir au moins un chiffre.');
    }
    if (!/[^A-Za-z0-9]/.test(motDePasse)) {
      erreurs.push('Le mot de passe doit contenir au moins un caractère spécial.');
    }
  
    return { valide: erreurs.length === 0, erreurs };
  }
  
  module.exports = validerMotDePasse;