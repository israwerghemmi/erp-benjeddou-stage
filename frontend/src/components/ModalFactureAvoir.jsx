import { useState } from 'react';
import api from '../services/api';

export default function ModalFactureAvoir({ facture, onFermer }) {
  const [motif, setMotif] = useState('');
  const [montant, setMontant] = useState('');
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  const genererAvoir = async () => {
    if (!motif || !montant) {
      setErreur('Le motif et le montant sont requis.');
      return;
    }
    setEnvoi(true);
    setErreur('');
    try {
      const res = await api.post(
        `/documents-commerciaux/factures/${facture.id}/avoir`,
        { motif, montant: Number(montant) },
        { responseType: 'blob' }
      );
      const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
      const lien = document.createElement('a');
      lien.href = blobUrl;
      lien.download = `AVOIR-${facture.numero}.pdf`;
      lien.click();
      window.URL.revokeObjectURL(blobUrl);
      onFermer();
    } catch (err) {
      setErreur('Erreur lors de la génération de l\'avoir.');
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="erp-modal-overlay">
      <div className="erp-modal">
        <h2>Générer un avoir — {facture.numero}</h2>

        {erreur && <div className="erp-alert erp-alert-error">{erreur}</div>}

        <div className="erp-form-grid">
          <input
            type="text"
            placeholder="Motif de l'avoir"
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            className="erp-input"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Montant de l'avoir (DT)"
            value={montant}
            onChange={(e) => setMontant(e.target.value)}
            className="erp-input"
          />
        </div>

        <div className="erp-modal-actions">
          <button onClick={onFermer} className="erp-btn erp-btn-ghost">Annuler</button>
          <button onClick={genererAvoir} disabled={envoi} className="erp-btn erp-btn-primary">
            {envoi ? 'Génération...' : 'Générer l\'avoir'}
          </button>
        </div>
      </div>
    </div>
  );
}