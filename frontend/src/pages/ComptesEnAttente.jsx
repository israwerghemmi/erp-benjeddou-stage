import { useEffect, useState } from 'react';
import api from '../services/api';

export default function ComptesEnAttente() {
  const [comptes, setComptes] = useState([]);
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');

  const charger = async () => {
    try {
      const res = await api.get('/comptes/en-attente');
      setComptes(res.data);
    } catch (err) {
      setErreur(err.response?.data?.message || 'Impossible de charger les comptes en attente.');
    }
  };

  useEffect(() => { charger(); }, []);

  const validerCompte = async (id) => {
    try {
      await api.patch(`/comptes/${id}/valider`);
      setSucces('Compte validé avec succès.');
      charger();
    } catch (err) {
      setErreur('Erreur lors de la validation.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Comptes en attente de validation</h1>

        {erreur && <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm mb-4">{erreur}</div>}
        {succes && <div className="bg-green-100 text-green-700 p-3 rounded-lg text-sm mb-4">{succes}</div>}

        {comptes.length === 0 && !erreur && (
          <div className="bg-white rounded-xl shadow-md p-6 text-gray-500 text-center">
            Aucun compte en attente de validation.
          </div>
        )}

        {comptes.length > 0 && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-100 text-gray-600 text-sm">
                <tr>
                  <th className="p-3">Entreprise</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Abonnement</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {comptes.map((c) => (
                  <tr key={c.id} className="border-t border-gray-100">
                    <td className="p-3">{c.nom_entreprise}</td>
                    <td className="p-3">{c.email}</td>
                    <td className="p-3">{c.type_compte}</td>
                    <td className="p-3">{c.abonnement}</td>
                    <td className="p-3">
                      <button
                        onClick={() => validerCompte(c.id)}
                        className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 transition"
                      >
                        Valider
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}