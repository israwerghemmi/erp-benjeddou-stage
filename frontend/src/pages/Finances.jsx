import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Finances() {
  const [synthese, setSynthese] = useState(null);
  const [depenses, setDepenses] = useState([]);
  const [recettes, setRecettes] = useState([]);
  const [nouvelleDepense, setNouvelleDepense] = useState({ libelle: '', montant: '', categorie: '' });
  const [nouvelleRecette, setNouvelleRecette] = useState({ libelle: '', montant: '', categorie: '' });
  const [erreur, setErreur] = useState('');

  const charger = async () => {
    try {
      const [syntheseRes, depensesRes, recettesRes] = await Promise.all([
        api.get('/rapports-financiers/synthese'),
        api.get('/depenses'),
        api.get('/recettes'),
      ]);
      setSynthese(syntheseRes.data);
      setDepenses(depensesRes.data);
      setRecettes(recettesRes.data);
    } catch (err) {
      setErreur('Impossible de charger les données financières.');
    }
  };

  useEffect(() => { charger(); }, []);

  const ajouterDepense = async (e) => {
    e.preventDefault();
    try {
      await api.post('/depenses', { ...nouvelleDepense, montant: parseFloat(nouvelleDepense.montant) });
      setNouvelleDepense({ libelle: '', montant: '', categorie: '' });
      charger();
    } catch (err) {
      setErreur('Erreur lors de l\'ajout de la dépense.');
    }
  };

  const ajouterRecette = async (e) => {
    e.preventDefault();
    try {
      await api.post('/recettes', { ...nouvelleRecette, montant: parseFloat(nouvelleRecette.montant) });
      setNouvelleRecette({ libelle: '', montant: '', categorie: '' });
      charger();
    } catch (err) {
      setErreur('Erreur lors de l\'ajout de la recette.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Gestion Financière</h1>

        {erreur && <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm mb-4">{erreur}</div>}

        {synthese && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-md p-5">
              <p className="text-sm text-gray-500">Total Recettes</p>
              <p className="text-2xl font-bold text-green-600">{synthese.totalRecettes} DT</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-5">
              <p className="text-sm text-gray-500">Total Dépenses</p>
              <p className="text-2xl font-bold text-red-600">{synthese.totalDepenses} DT</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-5">
              <p className="text-sm text-gray-500">Total Paiements</p>
              <p className="text-2xl font-bold text-blue-600">{synthese.totalPaiements} DT</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-5">
              <p className="text-sm text-gray-500">Solde</p>
              <p className={`text-2xl font-bold ${synthese.solde >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {synthese.solde} DT
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          {/* Recettes */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Recettes</h2>
            <form onSubmit={ajouterRecette} className="bg-white p-4 rounded-xl shadow-md mb-4 space-y-2">
              <input placeholder="Libellé" value={nouvelleRecette.libelle}
                onChange={(e) => setNouvelleRecette({ ...nouvelleRecette, libelle: e.target.value })}
                className="border border-gray-300 rounded-lg p-2 w-full" required />
              <input type="number" step="0.01" placeholder="Montant" value={nouvelleRecette.montant}
                onChange={(e) => setNouvelleRecette({ ...nouvelleRecette, montant: e.target.value })}
                className="border border-gray-300 rounded-lg p-2 w-full" required />
              <input placeholder="Catégorie" value={nouvelleRecette.categorie}
                onChange={(e) => setNouvelleRecette({ ...nouvelleRecette, categorie: e.target.value })}
                className="border border-gray-300 rounded-lg p-2 w-full" />
              <button type="submit" className="bg-green-600 text-white rounded-lg p-2 w-full font-medium hover:bg-green-700 transition">
                Ajouter une recette
              </button>
            </form>
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {recettes.map((r) => (
                <div key={r.id} className="flex justify-between p-3 border-t border-gray-100 text-sm">
                  <span>{r.libelle}</span>
                  <span className="text-green-600 font-medium">+{r.montant} DT</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dépenses */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Dépenses</h2>
            <form onSubmit={ajouterDepense} className="bg-white p-4 rounded-xl shadow-md mb-4 space-y-2">
              <input placeholder="Libellé" value={nouvelleDepense.libelle}
                onChange={(e) => setNouvelleDepense({ ...nouvelleDepense, libelle: e.target.value })}
                className="border border-gray-300 rounded-lg p-2 w-full" required />
              <input type="number" step="0.01" placeholder="Montant" value={nouvelleDepense.montant}
                onChange={(e) => setNouvelleDepense({ ...nouvelleDepense, montant: e.target.value })}
                className="border border-gray-300 rounded-lg p-2 w-full" required />
              <input placeholder="Catégorie" value={nouvelleDepense.categorie}
                onChange={(e) => setNouvelleDepense({ ...nouvelleDepense, categorie: e.target.value })}
                className="border border-gray-300 rounded-lg p-2 w-full" />
              <button type="submit" className="bg-red-600 text-white rounded-lg p-2 w-full font-medium hover:bg-red-700 transition">
                Ajouter une dépense
              </button>
            </form>
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {depenses.map((d) => (
                <div key={d.id} className="flex justify-between p-3 border-t border-gray-100 text-sm">
                  <span>{d.libelle}</span>
                  <span className="text-red-600 font-medium">-{d.montant} DT</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}