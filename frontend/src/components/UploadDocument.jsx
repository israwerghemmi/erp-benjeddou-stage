import { useState } from 'react';
import api from '../services/api';

const TYPES_DOCUMENT = [
  { value: 'devis', label: 'Devis' },
  { value: 'facture', label: 'Facture' },
  { value: 'bon_livraison', label: 'Bon de livraison' },
  { value: 'bon_reception', label: 'Bon de réception' },
  { value: 'contrat', label: 'Contrat' },
  { value: 'autre', label: 'Autre' },
];

export default function UploadDocument({ onSuccess, entiteLieeType, entiteLieeId }) {
  const [fichier, setFichier] = useState(null);
  const [nom, setNom] = useState('');
  const [type, setType] = useState('autre');
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState('');

  const soumettre = async () => {
    if (!fichier) {
      setErreur('Sélectionnez un fichier avant de soumettre.');
      return;
    }
    setErreur('');
    setEnvoi(true);
    try {
      const formData = new FormData();
      formData.append('fichier', fichier);
      formData.append('nom', nom || fichier.name);
      formData.append('type', type);
      if (entiteLieeType) formData.append('entite_liee_type', entiteLieeType);
      if (entiteLieeId) formData.append('entite_liee_id', entiteLieeId);

      const res = await api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onSuccess?.(res.data);
      setFichier(null);
      setNom('');
      setType('autre');
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de l\'envoi du document.');
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="erp-card erp-card-padded erp-form-grid">
      {erreur && <div className="erp-alert erp-alert-error">{erreur}</div>}

      <input
        type="text"
        placeholder="Nom du document (optionnel)"
        value={nom}
        onChange={(e) => setNom(e.target.value)}
        className="erp-input"
      />

      <select value={type} onChange={(e) => setType(e.target.value)} className="erp-input">
        {TYPES_DOCUMENT.map((t) => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>

      <input
        type="file"
        accept="image/jpeg,image/png,application/pdf,.doc,.docx"
        onChange={(e) => setFichier(e.target.files[0] || null)}
        className="erp-input"
      />

      <button onClick={soumettre} disabled={envoi} className="erp-btn erp-btn-primary" style={{ gridColumn: '1 / -1' }}>
        {envoi ? 'Envoi en cours...' : 'Téléverser le document'}
      </button>
    </div>
  );
}