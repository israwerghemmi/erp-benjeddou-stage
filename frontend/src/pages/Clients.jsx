import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [nouveauClient, setNouveauClient] = useState({ nom: '', email: '', telephone: '', adresse: '' });
  const [erreur, setErreur] = useState('');

  const chargerClients = async () => {
    try {
      const res = await api.get('/clients');
      setClients(res.data);
    } catch (err) {
      setErreur('Impossible de charger les clients.');
    }
  };

  useEffect(() => { chargerClients(); }, []);

  const handleChange = (e) => setNouveauClient({ ...nouveauClient, [e.target.name]: e.target.value });

  const handleAjouter = async (e) => {
    e.preventDefault();
    try {
      await api.post('/clients', nouveauClient);
      setNouveauClient({ nom: '', email: '', telephone: '', adresse: '' });
      chargerClients();
    } catch (err) {
      setErreur('Erreur lors de l\'ajout du client.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Mes Clients</h1>

        {erreur && <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm mb-4">{erreur}</div>}

        <form onSubmit={handleAjouter} className="bg-white p-6 rounded-xl shadow-md mb-6 grid grid-cols-2 gap-4">
          <input name="nom" value={nouveauClient.nom} placeholder="Nom" onChange={handleChange}
            className="border border-gray-300 rounded-lg p-2" required />
          <input name="email" value={nouveauClient.email} placeholder="Email" onChange={handleChange}
            className="border border-gray-300 rounded-lg p-2" />
          <input name="telephone" value={nouveauClient.telephone} placeholder="Téléphone" onChange={handleChange}
            className="border border-gray-300 rounded-lg p-2" />
          <input name="adresse" value={nouveauClient.adresse} placeholder="Adresse" onChange={handleChange}
            className="border border-gray-300 rounded-lg p-2" />
          <button type="submit" className="col-span-2 bg-blue-600 text-white rounded-lg p-2 font-medium hover:bg-blue-700 transition">
            Ajouter le client
          </button>
        </form>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-gray-600 text-sm">
              <tr>
                <th className="p-3">Nom</th>
                <th className="p-3">Email</th>
                <th className="p-3">Téléphone</th>
                <th className="p-3">Adresse</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-t border-gray-100">
                  <td className="p-3">{c.nom}</td>
                  <td className="p-3">{c.email}</td>
                  <td className="p-3">{c.telephone}</td>
                  <td className="p-3">{c.adresse}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}