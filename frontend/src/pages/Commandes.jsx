import { useEffect, useState } from 'react';
import api from '../services/api';
import ChampDate from '../components/ChampDate';
import { formaterDateAffichage, estDateValide, estDateFuture, estDatePassee } from '../utils/dateUtils';
import { useParams } from 'react-router-dom';

const statutBadge = (statut) => {
  if (statut === 'livree') return 'erp-badge erp-badge-success';
  if (statut === 'annulee') return 'erp-badge erp-badge-danger';
  return 'erp-badge erp-badge-warning';
};

export default function Commandes() {
  const [commandesListe, setCommandesListe] = useState([]);
  const [clients, setClients] = useState([]);
  const [produits, setProduits] = useState([]);
  const [form, setForm] = useState({ numero: '', client_id: '', produit_id: '', quantite: 1, prix_unitaire: '' });
  const [erreur, setErreur] = useState('');

  const charger = async () => {
    try {
      const [commandesRes, clientsRes, produitsRes] = await Promise.all([
        api.get('/commandes'), api.get('/clients'), api.get('/produits'),
      ]);
      setCommandesListe(commandesRes.data);
      setClients(clientsRes.data);
      setProduits(produitsRes.data);
    } catch (err) {
      setErreur('Impossible de charger les commandes.');
    }
  };

  useEffect(() => { charger(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreer = async (e) => {
    e.preventDefault();
    try {
      await api.post('/commandes', {
        numero: form.numero,
        client_id: form.client_id,
        produits: [{ produit_id: form.produit_id, quantite: parseInt(form.quantite), prix_unitaire: parseFloat(form.prix_unitaire) }],
      });
      setForm({ numero: '', client_id: '', produit_id: '', quantite: 1, prix_unitaire: '' });
      charger();
    } catch (err) {
      setErreur('Erreur lors de la création de la commande.');
    }
  };

  const changerStatut = async (id, statut) => {
    try {
      await api.patch(`/commandes/${id}/statut`, { statut });
      charger();
    } catch (err) {
      setErreur('Erreur lors du changement de statut.');
    }
  };

  const payerEnLigne = async (commandeId) => {
    setErreur('');
    try {
      const res = await api.post(`/paiement-en-ligne/creer-session/${commandeId}`);
      window.location.href = res.data.url;
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de la création de la session de paiement.');
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
          <h1>Commandes</h1>
          <p>Suivi des commandes clients</p>
        </header>

        {erreur && <div className="erp-alert erp-alert-error">{erreur}</div>}

        <form onSubmit={handleCreer} className="erp-card erp-card-padded erp-form-grid" style={{ marginBottom: '1.5rem' }}>
          <input name="numero" value={form.numero} placeholder="Numéro (ex: CMD-001)" onChange={handleChange}
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
            name="date_livraison"
            value={form.date_livraison}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
          />
          <button type="submit" className="erp-btn erp-btn-primary" style={{ gridColumn: '1 / -1' }}>
            Créer la commande
          </button>
        </form>

        <div className="erp-table-wrap">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Numéro</th>
                <th>Client</th>
                <th>Statut</th>
                <th>Montant</th>
                <th>Changer statut</th>
                <th>Paiement</th>
                <th>Documents</th>
              </tr>
            </thead>
            <tbody>
              {commandesListe.map((c) => (
                <tr key={c.id}>
                  <td>{c.numero}</td>
                  <td>{c.ClientCommercial?.nom || '-'}</td>
                  <td><span className={statutBadge(c.statut)}>{c.statut}</span></td>
                  <td>{c.montant_total} DT</td>
                  <td>
                    <select
                      value={c.statut}
                      onChange={(e) => changerStatut(c.id, e.target.value)}
                      className="erp-select erp-input-sm"
                    >
                      <option value="en_cours">En cours</option>
                      <option value="livree">Livrée</option>
                      <option value="annulee">Annulée</option>
                    </select>
                  </td>
                  <td>
                    {c.statut !== 'livree' && c.statut !== 'annulee' && (
                      <button
                        onClick={() => payerEnLigne(c.id)}
                        className="erp-btn-link erp-btn-link-primary"
                      >
                        Payer en ligne
                      </button>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => telechargerDocument(`/documents-commerciaux/commandes/${c.id}/bon-livraison`, `BL-${c.numero}.pdf`)}
                        className="erp-btn-link erp-btn-link-primary"
                      >
                        Bon livraison
                      </button>
                      <button
                        onClick={() => telechargerDocument(`/documents-commerciaux/commandes/${c.id}/bon-sortie`, `BS-${c.numero}.pdf`)}
                        className="erp-btn-link erp-btn-link-primary"
                      >
                        Bon sortie
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