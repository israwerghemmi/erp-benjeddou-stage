const CryptoJS = require('crypto-js');

const CLE_SECRETE = process.env.CLE_CHIFFREMENT || 'cle-par-defaut-a-changer';

function chiffrer(texte) {
  if (!texte) return null;
  return CryptoJS.AES.encrypt(texte, CLE_SECRETE).toString();
}

function dechiffrer(texteChiffre) {
  if (!texteChiffre) return null;
  const octets = CryptoJS.AES.decrypt(texteChiffre, CLE_SECRETE);
  return octets.toString(CryptoJS.enc.Utf8);
}

module.exports = { chiffrer, dechiffrer };