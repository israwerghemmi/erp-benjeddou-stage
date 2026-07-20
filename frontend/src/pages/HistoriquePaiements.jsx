import { useEffect, useState } from 'react';
import api from '../services/api';

const statutBadge = (statut) => {
  if (statut === 'reussi') return 'erp-badge erp-badge-success';
  if (statut === 'echoue') return 'erp-badge erp-badge-danger';
  return 'erp-badge erp-badge-warning';
};

export default function HistoriquePaiements() {
  const [paiements, setPaiements] = useState([]);
  const [erreur, setErreur] = useState('');

  const charger = async () => {
    try {
      const res = await api.get('/paiement-en-ligne/historique');
      setPaiements(res.data);
    } catch (err) {
      setErreur('Impossible de charger l\'historique des paiements.');
    }
  };

  useEffect(() => { charger(); }, []);

  return (
    <div className="erp-page">
      <div className="erp-container erp-container-md">
        <header className="erp-page-header">
          <h1>Historique des paiements en ligne</h1>
          <p>Suivi des tentatives de paiement Stripe</p>
        </header>

        {erreur && <div className="erp-alert erp-alert-error">{erreur}</div>}

        <div className="erp-table-wrap">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Commande</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {paiements.map((p) => (
                <tr key={p.id}>
                  <td>{p.Commande?.numero || '-'}</td>
                  <td>{p.montant} DT</td>
                  <td><span className={statutBadge(p.statut)}>{p.statut}</span></td>
                  <td>{new Date(p.createdAt).toLocaleString('fr-FR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}