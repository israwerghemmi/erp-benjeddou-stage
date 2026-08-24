const multer = require('multer');
const path = require('path');
const fs = require('fs');

const DOSSIER_DOCS = path.join(__dirname, '..', '..', 'uploads', 'documents');
if (!fs.existsSync(DOSSIER_DOCS)) fs.mkdirSync(DOSSIER_DOCS, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, DOSSIER_DOCS),
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    cb(null, `doc_${Date.now()}${extension}`);
  },
});

const filtreFichier = (req, file, cb) => {
  const typesAutorises = [
    'image/jpeg', 'image/png', 'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  if (typesAutorises.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Format non autorisé.'));
};

module.exports = multer({ storage, fileFilter: filtreFichier, limits: { fileSize: 10 * 1024 * 1024 } });