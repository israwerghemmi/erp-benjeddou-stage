import { useEffect, useState } from 'react';
import api from '../services/api';

export default function ComptesEnAttente() {
  const [comptes, setComptes] = useState([]);
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');

  const charger = async () => {
    try {
      const res = await api.get('/comptes/en-attente');
      setComptes(res.data);
    } catch (err) {
      setErreur(err.response?.data?.message || 'Impossible de charger les comptes en attente.');
    }
  };

  useEffect(() => { charger(); }, []);

  const validerCompte = async (id) => {
    try {
      await api.patch(`/comptes/${id}/valider`);
      setSucces('Compte validé avec succès.');
      charger();
    } catch (err) {
      setErreur('Erreur lors de la validation.');
    }
  };

  return (
    <div className="erp-page">
      <div className="erp-container erp-container-md">
        <header className="erp-page-header">
          <h1>Comptes en attente</h1>
          <p>Validation des nouvelles inscriptions entreprise</p>
        </header>

        {erreur && <div className="erp-alert erp-alert-error">{erreur}</div>}
        {succes && <div className="erp-alert erp-alert-success">{succes}</div>}

        {comptes.length === 0 && !erreur && (
          <div className="erp-card erp-card-padded" style={{ textAlign: 'center', color: 'var(--color-ink-muted)' }}>
            Aucun compte en attente de validation.
          </div>
        )}

        {comptes.length > 0 && (
          <div className="erp-table-wrap">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Entreprise</th>
                  <th>Email</th>
                  <th>Type</th>
                  <th>Abonnement</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {comptes.map((c) => (
                  <tr key={c.id}>
                    <td>{c.nom_entreprise}</td>
                    <td>{c.email}</td>
                    <td><span className="erp-badge erp-badge-neutral">{c.type_compte}</span></td>
                    <td>{c.abonnement}</td>
                    <td>
                      <button onClick={() => validerCompte(c.id)} className="erp-btn erp-btn-success erp-btn-sm">
                        Valider
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
