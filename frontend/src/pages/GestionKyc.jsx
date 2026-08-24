import { useEffect, useState } from 'react';
import api from '../services/api';
import BadgeKyc from '../components/BadgeKyc';
export default function GestionKyc() {
  const [clients, setClients] = useState([]);
  const [erreur, setErreur] = useState('');
  const [commentaires, setCommentaires] = useState({});

  const charger = async () => {
    try {
      const res = await api.get('/kyc/en-attente');
      setClients(res.data);
    } catch (err) {
      setErreur('Impossible de charger les demandes en attente.');
    }
  };

  useEffect(() => { charger(); }, []);

  const decider = async (clientId, decision) => {
    try {
      await api.put(`/kyc/${clientId}/decision`, {
        decision,
        commentaire: commentaires[clientId] || '',
      });
      setClients((prev) => prev.filter((c) => c.id !== clientId));
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de la décision.');
    }
  };

  return (
    <div className="erp-page">
      <div className="erp-container erp-container-md">
        <header className="erp-page-header">
          <h1>Vérification d'identité (KYC)</h1>
          <p>Demandes en attente de validation</p>
        </header>

        {erreur && <div className="erp-alert erp-alert-error">{erreur}</div>}

        {clients.length === 0 ? (
          <p className="erp-hint">Aucune demande en attente.</p>
        ) : (
          <div className="erp-table-wrap">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Statut</th>
                  <th>Document</th>
                  <th>Commentaire (si rejet)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.id}>
                    <td>{c.nom}</td>
                    <td><BadgeKyc statut={c.statut_kyc} /></td>
                    <td>
                      <a href={`http://localhost:5000${c.document_identite_url}`} target="_blank" rel="noreferrer">
                        Voir le document
                      </a>
                    </td>
                    <td>
                      <input
                        type="text"
                        placeholder="Motif du rejet (optionnel)"
                        className="erp-input erp-input-sm"
                        value={commentaires[c.id] || ''}
                        onChange={(e) => setCommentaires((prev) => ({ ...prev, [c.id]: e.target.value }))}
                      />
                    </td>
                    <td className="erp-actions-cell">
                      <button onClick={() => decider(c.id, 'verifie')} className="erp-btn erp-btn-success erp-btn-sm">
                        Valider
                      </button>
                      <button onClick={() => decider(c.id, 'rejete')} className="erp-btn erp-btn-danger erp-btn-sm">
                        Rejeter
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}