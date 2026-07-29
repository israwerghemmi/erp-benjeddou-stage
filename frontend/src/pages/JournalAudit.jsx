import { useEffect, useState } from 'react';
import api from '../services/api';

export default function JournalAudit() {
  const [entrees, setEntrees] = useState([]);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    const charger = async () => {
      try {
        const res = await api.get('/journal');
        setEntrees(res.data);
      } catch (err) {
        setErreur('Impossible de charger le journal d\'audit.');
      }
    };
    charger();
  }, []);

  return (
    <div className="erp-page">
      <div className="erp-container erp-container-md">
        <header className="erp-page-header">
          <h1>Journal d'audit</h1>
          <p>Historique des connexions et actions sensibles</p>
        </header>

        {erreur && <div className="erp-alert erp-alert-error">{erreur}</div>}

        <div className="erp-table-wrap">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Action</th>
                <th>Détails</th>
                <th>Appareil</th>
                <th>IP</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {entrees.map((e) => (
                <tr key={e.id}>
                  <td>{e.utilisateur_nom || '-'}</td>
                  <td>{e.action}</td>
                  <td style={{ fontSize: '0.8rem', color: '#666' }}>
                    {e.details ? JSON.stringify(
                      Object.fromEntries(
                        Object.entries(e.details).filter(([k]) => !['navigateur', 'systeme_exploitation', 'type_appareil'].includes(k))
                      )
                    ) : '-'}
                  </td>
                  <td style={{ fontSize: '0.8rem' }}>
                    {e.details?.navigateur ? `${e.details.navigateur} / ${e.details.systeme_exploitation}` : '-'}
                  </td>
                  <td>{e.adresse_ip}</td>
                  <td>{new Date(e.createdAt).toLocaleString('fr-FR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}