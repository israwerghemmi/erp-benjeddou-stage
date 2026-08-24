function validerEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  
  function validerTelephone(telephone) {
    return /^[0-9+\s-]{8,15}$/.test(telephone);
  }
  
  function validerChampsRequis(donnees, champsRequis) {
    const manquants = champsRequis.filter((champ) => !donnees[champ] || String(donnees[champ]).trim() === '');
    return manquants;
  }
  
  function validerMontantPositif(montant) {
    return typeof montant === 'number' && montant > 0;
  }
  
  module.exports = { validerEmail, validerTelephone, validerChampsRequis, validerMontantPositif };