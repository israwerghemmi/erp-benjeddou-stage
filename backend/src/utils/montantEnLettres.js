const UNITES = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
    'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  
  const DIZAINES = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];
  
  function convertirDizaines(n) {
    if (n < 20) return UNITES[n];
  
    const dizaine = Math.floor(n / 10);
    const unite = n % 10;
  
    if (dizaine === 7 || dizaine === 9) {
      return DIZAINES[dizaine - 1] + '-' + UNITES[10 + unite];
    }
  
    if (unite === 0) return DIZAINES[dizaine];
    if (unite === 1 && dizaine !== 8) return DIZAINES[dizaine] + '-et-un';
  
    return DIZAINES[dizaine] + '-' + UNITES[unite];
  }
  
  function convertirCentaines(n) {
    const centaine = Math.floor(n / 100);
    const reste = n % 100;
  
    let texte = '';
    if (centaine > 0) {
      texte += (centaine === 1 ? 'cent' : UNITES[centaine] + ' cent');
      if (centaine > 1 && reste === 0) texte += 's';
    }
    if (reste > 0) {
      texte += (texte ? ' ' : '') + convertirDizaines(reste);
    }
    return texte;
  }
  
  function convertirNombre(nombre) {
    if (nombre === 0) return 'zéro';
  
    const tranches = [
      { valeur: 1000000000, mot: 'milliard' },
      { valeur: 1000000, mot: 'million' },
      { valeur: 1000, mot: 'mille' },
    ];
  
    let reste = nombre;
    let parties = [];
  
    for (const { valeur, mot } of tranches) {
      const quotient = Math.floor(reste / valeur);
      if (quotient > 0) {
        if (mot === 'mille' && quotient === 1) {
          parties.push('mille');
        } else {
          const prefixe = convertirCentaines(quotient);
          const suffixe = mot + (quotient > 1 && mot !== 'mille' ? 's' : '');
          parties.push(prefixe + ' ' + suffixe);
        }
        reste %= valeur;
      }
    }
  
    if (reste > 0 || parties.length === 0) {
      parties.push(convertirCentaines(reste));
    }
  
    return parties.join(' ').trim();
  }
  
  function montantEnLettres(montant) {
    const partieEntiere = Math.floor(montant);
    const millimes = Math.round((montant - partieEntiere) * 1000);
  
    let texte = convertirNombre(partieEntiere) + (partieEntiere === 1 ? ' dinar' : ' dinars');
  
    if (millimes > 0) {
      texte += ' et ' + convertirNombre(millimes) + (millimes === 1 ? ' millime' : ' millimes');
    }
  
    return texte.charAt(0).toUpperCase() + texte.slice(1);
  }
  
  module.exports = montantEnLettres;