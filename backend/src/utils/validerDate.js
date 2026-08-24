function validerDate(dateStr, options = {}) {
    if (!dateStr) return { valide: !options.requis === false, erreur: options.requis ? 'La date est requise.' : null };
  
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return { valide: false, erreur: 'Format de date invalide.' };
    }
  
    if (options.pasAvantAujourdhui && date < new Date().setHours(0, 0, 0, 0)) {
      return { valide: false, erreur: 'La date ne peut pas être antérieure à aujourd\'hui.' };
    }
  
    return { valide: true, erreur: null };
  }
  
  module.exports = validerDate;