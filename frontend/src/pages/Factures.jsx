import { useEffect, useState } from 'react';
import api from '../services/api';

const statutBadge = (statut) => {
  if (statut === 'payee') return 'erp-badge erp-badge-success';
  if (statut === 'annulee') return 'erp-badge erp-badge-danger';
  return 'erp-badge erp-badge-warning';
};

export default function Factures() {
  const [factures, setFactures] = useState([]);
  const [commandes, setCommandes] = useState([]);
  const [commandeSelectionnee, setCommandeSelectionnee] = useState('');
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');

  const charger = async () => {
    try {
      const [facturesRes, commandesRes] = await Promise.all([
        api.get('/factures'),
        api.get('/commandes'),
      ]);
      setFactures(facturesRes.data);
      setCommandes(commandesRes.data);
    } catch (err) {
      setErreur('Impossible de charger les factures.');
    }
  };

  useEffect(() => { charger(); }, []);

  const genererFacture = async (e) => {
    e.preventDefault();
    setErreur('');
    setSucces('');
    try {
      await api.post(`/factures/generer/${commandeSelectionnee}`);
      setSucces('Facture générée avec succès.');
      setCommandeSelectionnee('');
      charger();
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de la génération.');
    }
  };

  const exporterExcel = async () => {
    try {
      const response = await api.get('/factures/export/excel', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'historique_factures.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setErreur('Erreur lors de l\'export Excel.');
    }
  };

  const telechargerPdf = async (id, numero) => {
    try {
      const response = await api.get(`/factures/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${numero}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setErreur('Erreur lors du téléchargement du PDF.');
    }
  };

  const commandesSansFacture = commandes.filter(
    (c) => !factures.some((f) => f.commande_id === c.id)
  );

  return (
    <div className="erp-page">
      <div className="erp-container erp-container-md">
        <header className="erp-page-header">
          <h1>Factures</h1>
          <p>Génération et téléchargement des factures PDF</p>
        </header>

        {erreur && <div className="erp-alert erp-alert-error">{erreur}</div>}
        {succes && <div className="erp-alert erp-alert-success">{succes}</div>}

        <form onSubmit={genererFacture} className="erp-card erp-card-padded erp-form-row" style={{ marginBottom: '1.5rem' }}>
          <select
            value={commandeSelectionnee}
            onChange={(e) => setCommandeSelectionnee(e.target.value)}
            className="erp-select"
            style={{ flex: 1 }}
            required
          >
            <option value="">Choisir une commande à facturer</option>
            {commandesSansFacture.map((c) => (
              <option key={c.id} value={c.id}>{c.numero} — {c.montant_total} DT</option>
            ))}
          </select>
          <button type="submit" className="erp-btn erp-btn-accent">
            Générer la facture
          </button>
        </form>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
          <button onClick={exporterExcel} className="erp-btn erp-btn-secondary">
            Exporter en Excel
          </button>
        </div>

        <div className="erp-table-wrap">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Numéro</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Montant TTC</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {factures.map((f) => (
                <tr key={f.id}>
                  <td>{f.numero}</td>
                  <td>{f.date_emission}</td>
                  <td><span className={statutBadge(f.statut)}>{f.statut}</span></td>
                  <td>{f.montant_ttc} DT</td>
                  <td>
                    <button
                      onClick={() => telechargerPdf(f.id, f.numero)}
                      className="erp-btn-link erp-btn-link-primary"
                    >
                      Télécharger PDF
                    </button>
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