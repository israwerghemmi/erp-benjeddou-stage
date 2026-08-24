const QRCode = require('qrcode');

async function genererQrCodeFacture(numeroFacture, dbName, urlBase) {
  const urlVerification = `${urlBase}/verifier-facture/${dbName}/${numeroFacture}`;
  return QRCode.toBuffer(urlVerification, { errorCorrectionLevel: 'M', margin: 1, width: 200 });
}

module.exports = genererQrCodeFacture;