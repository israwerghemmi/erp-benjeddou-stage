import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Devis() {
  const [devisListe, setDevisListe] = useState([]);
  const [clients, setClients] = useState([]);
  const [produits, setProduits] = useState([]);
  const [form, setForm] = useState({ numero: '', client_id: '', produit_id: '', quantite: 1, prix_unitaire: '' });
  const [erreur, setErreur] = useState('');

  const charger = async () => {
    const [devisRes, clientsRes, produitsRes] = await Promise.all([
      api.get('/devis'), api.get('/clients'), api.get('/produits'),
    ]);
    setDevisListe(devisRes.data);
    setClients(clientsRes.data);
    setProduits(produitsRes.data);
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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Devis</h1>
        {erreur && <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm mb-4">{erreur}</div>}

        <form onSubmit={handleCreer} className="bg-white p-6 rounded-xl shadow-md mb-6 grid grid-cols-2 gap-4">
          <input name="numero" value={form.numero} placeholder="Numéro (ex: DEV-001)" onChange={handleChange}
            className="border border-gray-300 rounded-lg p-2" required />
          <select name="client_id" value={form.client_id} onChange={handleChange} className="border border-gray-300 rounded-lg p-2" required>
            <option value="">Choisir un client</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
          <select name="produit_id" value={form.produit_id} onChange={handleChange} className="border border-gray-300 rounded-lg p-2" required>
            <option value="">Choisir un produit</option>
            {produits.map((p) => <option key={p.id} value={p.id}>{p.nom} ({p.prix} DT)</option>)}
          </select>
          <input name="quantite" type="number" value={form.quantite} placeholder="Quantité" onChange={handleChange}
            className="border border-gray-300 rounded-lg p-2" required />
          <input name="prix_unitaire" type="number" step="0.01" value={form.prix_unitaire} placeholder="Prix unitaire" onChange={handleChange}
            className="border border-gray-300 rounded-lg p-2 col-span-2" required />
          <button type="submit" className="col-span-2 bg-blue-600 text-white rounded-lg p-2 font-medium hover:bg-blue-700 transition">
            Créer le devis
          </button>
        </form>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-gray-600 text-sm">
              <tr><th className="p-3">Numéro</th><th className="p-3">Client</th><th className="p-3">Statut</th><th className="p-3">Montant</th></tr>
            </thead>
            <tbody>
              {devisListe.map((d) => (
                <tr key={d.id} className="border-t border-gray-100">
                  <td className="p-3">{d.numero}</td>
                  <td className="p-3">{d.ClientCommercial?.nom || '-'}</td>
                  <td className="p-3">{d.statut}</td>
                  <td className="p-3">{d.montant_total} DT</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}