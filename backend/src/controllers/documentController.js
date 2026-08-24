const { journaliserAction } = require('../utils/journaliser');
const fs = require('fs');
const path = require('path');

exports.uploader = async (req, res) => {
  try {
    const { Document } = req.tenantModels;
    const { nom, type, entite_liee_type, entite_liee_id } = req.body;

    if (!req.file) return res.status(400).json({ message: 'Aucun fichier fourni.' });

    const document = await Document.create({
      nom: nom || req.file.originalname,
      type: type || 'autre',
      fichier_url: `/uploads/documents/${req.file.filename}`,
      taille_ko: Math.round(req.file.size / 1024),
      entite_liee_type: entite_liee_type || null,
      entite_liee_id: entite_liee_id || null,
    });

    await journaliserAction(req, 'upload_document', { document_id: document.id, type: document.type });

    res.status(201).json(document);
  } catch (error) {
    console.error('Erreur upload document :', error);
    res.status(500).json({ message: 'Erreur lors de l\'upload.', error: error.message });
  }
};

exports.lister = async (req, res) => {
  try {
    const { Document } = req.tenantModels;
    const { type, archive } = req.query;
    const where = {};
    if (type) where.type = type;
    if (archive !== undefined) where.archive = archive === 'true';

    const documents = await Document.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json(documents);
  } catch (error) {
    console.error('Erreur listage documents :', error);
    res.status(500).json({ message: 'Erreur.', error: error.message });
  }
};

exports.archiver = async (req, res) => {
  try {
    const { Document } = req.tenantModels;
    const document = await Document.findByPk(req.params.id);
    if (!document) return res.status(404).json({ message: 'Document introuvable.' });

    document.archive = true;
    await document.save();
    await journaliserAction(req, 'archivage_document', { document_id: document.id });

    res.json(document);
  } catch (error) {
    console.error('Erreur archivage document :', error);
    res.status(500).json({ message: 'Erreur.', error: error.message });
  }
};

exports.supprimer = async (req, res) => {
  try {
    const { Document } = req.tenantModels;
    const document = await Document.findByPk(req.params.id);
    if (!document) return res.status(404).json({ message: 'Document introuvable.' });

    const cheminFichier = path.join(__dirname, '..', '..', document.fichier_url);
    if (fs.existsSync(cheminFichier)) fs.unlinkSync(cheminFichier);

    await document.destroy();
    await journaliserAction(req, 'suppression_document', { document_id: req.params.id });

    res.json({ message: 'Document supprimé.' });
  } catch (error) {
    console.error('Erreur suppression document :', error);
    res.status(500).json({ message: 'Erreur.', error: error.message });
  }
};