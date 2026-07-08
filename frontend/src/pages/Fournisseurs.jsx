import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Fournisseurs() {
  const [fournisseurs, setFournisseurs] = useState([]);
  const [nouveauFournisseur, setNouveauFournisseur] = useState({ nom: '', email: '', telephone: '' });
  const [erreur, setErreur] = useState('');

  const chargerFournisseurs = async () => {
    try {
      const res = await api.get('/fournisseurs');
      setFournisseurs(res.data);
    } catch (err) {
      setErreur('Impossible de charger les fournisseurs.');
    }
  };

  useEffect(() => { chargerFournisseurs(); }, []);

  const handleChange = (e) => setNouveauFournisseur({ ...nouveauFournisseur, [e.target.name]: e.target.value });

  const handleAjouter = async (e) => {
    e.preventDefault();
    try {
      await api.post('/fournisseurs', nouveauFournisseur);
      setNouveauFournisseur({ nom: '', email: '', telephone: '' });
      chargerFournisseurs();
    } catch (err) {
      setErreur('Erreur lors de l\'ajout du fournisseur.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Mes Fournisseurs</h1>

        {erreur && <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm mb-4">{erreur}</div>}

        <form onSubmit={handleAjouter} className="bg-white p-6 rounded-xl shadow-md mb-6 grid grid-cols-2 gap-4">
          <input name="nom" value={nouveauFournisseur.nom} placeholder="Nom du fournisseur" onChange={handleChange}
            className="border border-gray-300 rounded-lg p-2" required />
          <input name="email" value={nouveauFournisseur.email} placeholder="Email" onChange={handleChange}
            className="border border-gray-300 rounded-lg p-2" />
          <input name="telephone" value={nouveauFournisseur.telephone} placeholder="Téléphone" onChange={handleChange}
            className="border border-gray-300 rounded-lg p-2 col-span-2" />
          <button type="submit" className="col-span-2 bg-blue-600 text-white rounded-lg p-2 font-medium hover:bg-blue-700 transition">
            Ajouter le fournisseur
          </button>
        </form>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-gray-600 text-sm">
              <tr>
                <th className="p-3">Nom</th>
                <th className="p-3">Email</th>
                <th className="p-3">Téléphone</th>
              </tr>
            </thead>
            <tbody>
              {fournisseurs.map((f) => (
                <tr key={f.id} className="border-t border-gray-100">
                  <td className="p-3">{f.nom}</td>
                  <td className="p-3">{f.email}</td>
                  <td className="p-3">{f.telephone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}