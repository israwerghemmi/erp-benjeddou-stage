import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Produits() {
  const [produits, setProduits] = useState([]);
  const [nouveauProduit, setNouveauProduit] = useState({ nom: '', reference: '', prix: '', quantite_stock: '' });
  const [erreur, setErreur] = useState('');

  const charger = async () => {
    try {
      const res = await api.get('/produits');
      setProduits(res.data);
    } catch (err) {
      setErreur('Impossible de charger les produits.');
    }
  };

  useEffect(() => { charger(); }, []);

  const handleChange = (e) => setNouveauProduit({ ...nouveauProduit, [e.target.name]: e.target.value });

  const handleAjouter = async (e) => {
    e.preventDefault();
    try {
      await api.post('/produits', {
        ...nouveauProduit,
        prix: parseFloat(nouveauProduit.prix),
        quantite_stock: parseInt(nouveauProduit.quantite_stock),
      });
      setNouveauProduit({ nom: '', reference: '', prix: '', quantite_stock: '' });
      charger();
    } catch (err) {
      setErreur('Erreur lors de l\'ajout du produit.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Mes Produits</h1>
        {erreur && <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm mb-4">{erreur}</div>}

        <form onSubmit={handleAjouter} className="bg-white p-6 rounded-xl shadow-md mb-6 grid grid-cols-2 gap-4">
          <input name="nom" value={nouveauProduit.nom} placeholder="Nom du produit" onChange={handleChange}
            className="border border-gray-300 rounded-lg p-2" required />
          <input name="reference" value={nouveauProduit.reference} placeholder="Référence" onChange={handleChange}
            className="border border-gray-300 rounded-lg p-2" />
          <input name="prix" type="number" step="0.01" value={nouveauProduit.prix} placeholder="Prix" onChange={handleChange}
            className="border border-gray-300 rounded-lg p-2" required />
          <input name="quantite_stock" type="number" value={nouveauProduit.quantite_stock} placeholder="Quantité en stock" onChange={handleChange}
            className="border border-gray-300 rounded-lg p-2" />
          <button type="submit" className="col-span-2 bg-blue-600 text-white rounded-lg p-2 font-medium hover:bg-blue-700 transition">
            Ajouter le produit
          </button>
        </form>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-gray-600 text-sm">
              <tr><th className="p-3">Nom</th><th className="p-3">Référence</th><th className="p-3">Prix</th><th className="p-3">Stock</th></tr>
            </thead>
            <tbody>
              {produits.map((p) => (
                <tr key={p.id} className="border-t border-gray-100">
                  <td className="p-3">{p.nom}</td>
                  <td className="p-3">{p.reference}</td>
                  <td className="p-3">{p.prix} DT</td>
                  <td className="p-3">{p.quantite_stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}