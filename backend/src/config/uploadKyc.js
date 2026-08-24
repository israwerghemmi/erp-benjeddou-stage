const multer = require('multer');
const path = require('path');
const fs = require('fs');

const DOSSIER_KYC = path.join(__dirname, '..', '..', 'uploads', 'kyc');
if (!fs.existsSync(DOSSIER_KYC)) fs.mkdirSync(DOSSIER_KYC, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, DOSSIER_KYC),
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    cb(null, `kyc_${req.params.id}_${Date.now()}${extension}`);
  },
});

const filtreFichier = (req, file, cb) => {
  const typesAutorises = ['image/jpeg', 'image/png', 'application/pdf'];
  if (typesAutorises.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Format non autorisé. Formats acceptés : JPG, PNG, PDF.'));
};

module.exports = multer({
  storage,
  fileFilter: filtreFichier,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo max
});