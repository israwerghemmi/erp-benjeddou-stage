import { useEffect, useState } from 'react';
import api from '../services/api';
import UploadDocument from '../components/UploadDocument';
import BadgeTypeDocument from '../components/BadgeTypeDocument';

export default function GestionDocumentaire() {
  const [documents, setDocuments] = useState([]);
  const [filtreType, setFiltreType] = useState('');
  const [afficherArchives, setAfficherArchives] = useState(false);
  const [erreur, setErreur] = useState('');

  const charger = async () => {
    try {
      const params = {};
      if (filtreType) params.type = filtreType;
      params.archive = afficherArchives;

      const res = await api.get('/documents', { params });
      setDocuments(res.data);
    } catch (err) {
      setErreur('Impossible de charger les documents.');
    }
  };

  useEffect(() => { charger(); }, [filtreType, afficherArchives]);

  const archiverDocument = async (id) => {
    try {
      await api.put(`/documents/${id}/archiver`);
      charger();
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de l\'archivage.');
    }
  };

  const supprimerDocument = async (id) => {
    if (!window.confirm('Supprimer ce document ?')) return;
    try {
      await api.delete(`/documents/${id}`);
      charger();
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de la suppression.');
    }
  };

  return (
    <div className="erp-page">
      <div className="erp-container erp-container-md">
        <header className="erp-page-header">
          <h1>Gestion documentaire</h1>
          <p>Documents professionnels et archivage numérique</p>
        </header>

        {erreur && <div className="erp-alert erp-alert-error">{erreur}</div>}

        <div style={{ marginBottom: '1.5rem' }}>
          <UploadDocument onSuccess={charger} />
        </div>

        <div className="erp-filters-row" style={{ marginBottom: '1rem' }}>
          <select value={filtreType} onChange={(e) => setFiltreType(e.target.value)} className="erp-input erp-input-sm">
            <option value="">Tous les types</option>
            <option value="devis">Devis</option>
            <option value="facture">Facture</option>
            <option value="bon_livraison">Bon de livraison</option>
            <option value="bon_reception">Bon de réception</option>
            <option value="contrat">Contrat</option>
            <option value="autre">Autre</option>
          </select>

          <label className="erp-checkbox-label">
            <input
              type="checkbox"
              checked={afficherArchives}
              onChange={(e) => setAfficherArchives(e.target.checked)}
            />
            Afficher les archivés
          </label>
        </div>

        <div className="erp-table-wrap">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Type</th>
                <th>Taille</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((d) => (
                <tr key={d.id}>
                  <td>
                    <a href={`http://localhost:5000${d.fichier_url}`} target="_blank" rel="noreferrer">
                      {d.nom}
                    </a>
                  </td>
                  <td><BadgeTypeDocument type={d.type} /></td>
                  <td>{d.taille_ko ? `${d.taille_ko} Ko` : '-'}</td>
                  <td>{new Date(d.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td>
                    <div className="erp-table-actions">
                      {!d.archive && (
                        <button onClick={() => archiverDocument(d.id)} className="erp-btn-link erp-btn-link-primary">
                          Archiver
                        </button>
                      )}
                      <button onClick={() => supprimerDocument(d.id)} className="erp-btn-link erp-btn-link-danger">
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}