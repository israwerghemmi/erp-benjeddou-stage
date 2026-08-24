import { useEffect, useState } from 'react';
import api from '../services/api';

const LIBELLES_TYPE = { entree: 'Entrée', sortie: 'Sortie', transfert: 'Transfert', ajustement: 'Ajustement' };

export default function MouvementsStock() {
  const [mouvements, setMouvements] = useState([]);
  const [produits, setProduits] = useState([]);
  const [entrepots, setEntrepots] = useState([]);
  const [form, setForm] = useState({ produit_id: '', entrepot_id: '', type: 'entree', quantite: '', motif: '' });
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');

  const charger = async () => {
    try {
      const [mvtRes, prodRes, entRes] = await Promise.all([
        api.get('/stock/mouvements'),
        api.get('/produits'),
        api.get('/stock/entrepots'),
      ]);
      setMouvements(mvtRes.data);
      setProduits(prodRes.data);
      setEntrepots(entRes.data);
    } catch (err) {
      setErreur('Impossible de charger les données de stock.');
    }
  };

  useEffect(() => { charger(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleEnregistrer = async (e) => {
    e.preventDefault();
    setErreur('');
    setSucces('');
    try {
      const res = await api.post('/stock/mouvements', {
        ...form,
        quantite: Number(form.quantite),
      });
      setSucces(
        res.data.alerte_rupture
          ? `Mouvement enregistré. ⚠️ Stock faible : ${res.data.quantite_stock} restant(s).`
          : `Mouvement enregistré. Stock actuel : ${res.data.quantite_stock}.`
      );
      setForm({ produit_id: '', entrepot_id: '', type: 'entree', quantite: '', motif: '' });
      charger();
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de l\'enregistrement.');
    }
  };

  return (
    <div className="erp-page">
      <div className="erp-container erp-container-md">
        <header className="erp-page-header">
          <h1>Mouvements de stock</h1>
          <p>Entrées, sorties, transferts et ajustements</p>
        </header>

        {erreur && <div className="erp-alert erp-alert-error">{erreur}</div>}
        {succes && <div className="erp-alert erp-alert-success">{succes}</div>}

        <form onSubmit={handleEnregistrer} className="erp-card erp-card-padded erp-form-grid" style={{ marginBottom: '1.5rem' }}>
          <select name="produit_id" value={form.produit_id} onChange={handleChange} className="erp-input" required>
            <option value="">Choisir un produit</option>
            {produits.map((p) => (
              <option key={p.id} value={p.id}>{p.nom} (stock: {p.quantite_stock ?? 0})</option>
            ))}
          </select>

          <select name="entrepot_id" value={form.entrepot_id} onChange={handleChange} className="erp-input">
            <option value="">Entrepôt (optionnel)</option>
            {entrepots.map((e) => (
              <option key={e.id} value={e.id}>{e.nom}</option>
            ))}
          </select>

          <select name="type" value={form.type} onChange={handleChange} className="erp-input">
            <option value="entree">Entrée</option>
            <option value="sortie">Sortie</option>
            <option value="transfert">Transfert</option>
            <option value="ajustement">Ajustement</option>
          </select>

          <input name="quantite" type="number" min="1" value={form.quantite} placeholder="Quantité" onChange={handleChange} className="erp-input" required />
          <input name="motif" value={form.motif} placeholder="Motif (optionnel)" onChange={handleChange} className="erp-input" />

          <button type="submit" className="erp-btn erp-btn-primary" style={{ gridColumn: '1 / -1' }}>
            Enregistrer le mouvement
          </button>
        </form>

        <div className="erp-table-wrap">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Produit</th>
                <th>Entrepôt</th>
                <th>Type</th>
                <th>Quantité</th>
                <th>Motif</th>
              </tr>
            </thead>
            <tbody>
              {mouvements.map((m) => (
                <tr key={m.id}>
                  <td>{new Date(m.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td>{m.Produit?.nom || '-'}</td>
                  <td>{m.Entrepot?.nom || '-'}</td>
                  <td>{LIBELLES_TYPE[m.type]}</td>
                  <td>{m.quantite}</td>
                  <td>{m.motif || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}