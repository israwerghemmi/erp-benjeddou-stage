import { useEffect, useState } from 'react';
import api from '../services/api';
import ChampDate from '../components/ChampDate';
import { formaterDateAffichage } from '../utils/dateUtils';

const statutBadge = (statut) => {
  if (statut === 'accepte') return 'erp-badge erp-badge-success';
  if (statut === 'refuse') return 'erp-badge erp-badge-danger';
  return 'erp-badge erp-badge-warning';
};

export default function Devis() {
  const [devisListe, setDevisListe] = useState([]);
  const [clients, setClients] = useState([]);
  const [produits, setProduits] = useState([]);
  const [form, setForm] = useState({ numero: '', client_id: '', produit_id: '', quantite: 1, prix_unitaire: '', date_livraison_souhaitee: '' });
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');

  const charger = async () => {
    try {
      const [devisRes, clientsRes, produitsRes] = await Promise.all([
        api.get('/devis'), api.get('/clients'), api.get('/produits'),
      ]);
      setDevisListe(devisRes.data);
      setClients(clientsRes.data);
      setProduits(produitsRes.data);
    } catch (err) {
      setErreur('Impossible de charger les devis.');
    }
  };

  useEffect(() => { charger(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreer = async (e) => {
    e.preventDefault();
    try {
      await api.post('/devis', {
        numero: form.numero,
        client_id: form.client_id,
        produits: [{ produit_id: form.produit_id, quantite: parseInt(form.quantite), prix_unitaire: parseFloat(form.prix_unitaire) }],
      });
      setForm({ numero: '', client_id: '', produit_id: '', quantite: 1, prix_unitaire: '' });
      charger();
    } catch (err) {
      setErreur('Erreur lors de la création du devis.');
    }
  };

  const changerStatut = async (id, statut) => {
    try {
      await api.patch(`/devis/${id}/statut`, { statut });
      charger();
    } catch (err) {
      setErreur('Erreur lors du changement de statut.');
    }
  };

  const convertirEnCommande = async (id) => {
    setErreur('');
    setSucces('');
    try {
      const res = await api.post(`/devis/${id}/convertir`);
      setSucces(`Commande ${res.data.commande.numero} créée avec succès.`);
      charger();
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de la conversion.');
    }
  };

  const telechargerDocument = async (url, nomFichier) => {
    setErreur('');
    try {
      const res = await api.get(url, { responseType: 'blob' });
      const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
      const lien = document.createElement('a');
      lien.href = blobUrl;
      lien.download = nomFichier;
      lien.click();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setErreur('Erreur lors du téléchargement du document.');
    }
  };

  return (
    <div className="erp-page">
      <div className="erp-container erp-container-md">
        <header className="erp-page-header">
          <h1>Devis</h1>
          <p>Création et suivi des devis clients</p>
        </header>

        {erreur && <div className="erp-alert erp-alert-error">{erreur}</div>}
        {succes && <div className="erp-alert erp-alert-success">{succes}</div>}

        <form onSubmit={handleCreer} className="erp-card erp-card-padded erp-form-grid" style={{ marginBottom: '1.5rem' }}>
          <input name="numero" value={form.numero} placeholder="Numéro (ex: DEV-001)" onChange={handleChange}
            className="erp-input" required />
          <select name="client_id" value={form.client_id} onChange={handleChange} className="erp-select" required>
            <option value="">Choisir un client</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
          <select name="produit_id" value={form.produit_id} onChange={handleChange} className="erp-select" required>
            <option value="">Choisir un produit</option>
            {produits.map((p) => <option key={p.id} value={p.id}>{p.nom} ({p.prix} DT)</option>)}
          </select>
          <input name="quantite" type="number" value={form.quantite} placeholder="Quantité" onChange={handleChange}
            className="erp-input" required />
          <input name="prix_unitaire" type="number" step="0.01" value={form.prix_unitaire} placeholder="Prix unitaire" onChange={handleChange}
            className="erp-input" style={{ gridColumn: '1 / -1' }} required />
          <ChampDate
            label="Date de livraison souhaitée"
            name="date_livraison_souhaitee"
            value={form.date_livraison_souhaitee}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
          />
          <button type="submit" className="erp-btn erp-btn-accent" style={{ gridColumn: '1 / -1' }}>
            Créer le devis
          </button>
        </form>

        <div className="erp-table-wrap">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Numéro</th>
                <th>Client</th>
                <th>Statut</th>
                <th>Livraison souhaitée</th>
                <th>Montant</th>
                <th>Action</th>
                <th>Documents</th>
              </tr>
            </thead>
            <tbody>
              {devisListe.map((d) => (
                <tr key={d.id}>
                  <td>{d.numero}</td>
                  <td>{d.ClientCommercial?.nom || '-'}</td>
                  <td><span className={statutBadge(d.statut)}>{d.statut}</span></td>
                  <td>{d.date_livraison_souhaitee ? formaterDateAffichage(d.date_livraison_souhaitee) : '-'}</td>
                  <td>{d.montant_total} DT</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <select
                        value={d.statut}
                        onChange={(e) => changerStatut(d.id, e.target.value)}
                        className="erp-select erp-input-sm"
                      >
                        <option value="en_attente">En attente</option>
                        <option value="accepte">Accepté</option>
                        <option value="refuse">Refusé</option>
                      </select>
                      {d.statut === 'accepte' && (
                        <button onClick={() => convertirEnCommande(d.id)} className="erp-btn-link erp-btn-link-primary">
                          Convertir en commande
                        </button>
                      )}
                    </div>
                  </td>
                  <td>
                    <button
                      onClick={() => telechargerDocument(`/documents-commerciaux/devis/${d.id}/proforma`, `PROFORMA-${d.numero}.pdf`)}
                      className="erp-btn-link erp-btn-link-primary"
                    >
                      Pro forma
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