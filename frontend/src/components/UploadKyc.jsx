import { useState } from 'react';
import api from '../services/api';

export default function UploadKyc({ clientId, statutActuel, onSuccess }) {
  const [fichier, setFichier] = useState(null);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState('');

  const soumettre = async () => {
    if (!fichier) {
      setErreur('Sélectionnez un document avant de soumettre.');
      return;
    }
    setErreur('');
    setEnvoi(true);
    try {
      const formData = new FormData();
      formData.append('document', fichier);
      const res = await api.post(`/kyc/${clientId}/document`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onSuccess?.(res.data.client);
      setFichier(null);
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de l\'envoi du document.');
    } finally {
      setEnvoi(false);
    }
  };

  if (statutActuel === 'verifie') {
    return <p className="erp-hint">Identité déjà vérifiée.</p>;
  }
  if (statutActuel === 'en_attente') {
    return <p className="erp-hint">Document en attente de vérification.</p>;
  }

  return (
    <div className="erp-form-group">
      {erreur && <div className="erp-alert erp-alert-error">{erreur}</div>}
      <input
        type="file"
        accept="image/jpeg,image/png,application/pdf"
        onChange={(e) => setFichier(e.target.files[0] || null)}
        className="erp-input"
      />
      <button onClick={soumettre} disabled={envoi} className="erp-btn erp-btn-primary erp-btn-sm">
        {envoi ? 'Envoi en cours...' : statutActuel === 'rejete' ? 'Soumettre à nouveau' : 'Soumettre le document'}
      </button>
    </div>
  );
}