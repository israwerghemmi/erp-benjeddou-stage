import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({ clients: 0, produits: 0, fournisseurs: 0, devisEnAttente: 0, commandesEnCours: 0 });

  useEffect(() => {
    const charger = async () => {
      try {
        const [clientsRes, produitsRes, fournisseursRes, devisRes, commandesRes] = await Promise.all([
          api.get('/clients'), api.get('/produits'), api.get('/fournisseurs'), api.get('/devis'), api.get('/commandes'),
        ]);
        setStats({
          clients: clientsRes.data.length,
          produits: produitsRes.data.length,
          fournisseurs: fournisseursRes.data.length,
          devisEnAttente: devisRes.data.filter((d) => d.statut === 'en_attente').length,
          commandesEnCours: commandesRes.data.filter((c) => c.statut === 'en_cours').length,
        });
      } catch (err) {
        console.error('Erreur lors du chargement du tableau de bord :', err);
      }
    };
    charger();
  }, []);

  const cartes = [
    { label: 'Clients', valeur: stats.clients, couleur: 'bg-blue-500' },
    { label: 'Produits', valeur: stats.produits, couleur: 'bg-purple-500' },
    { label: 'Fournisseurs', valeur: stats.fournisseurs, couleur: 'bg-orange-500' },
    { label: 'Devis en attente', valeur: stats.devisEnAttente, couleur: 'bg-yellow-500' },
    { label: 'Commandes en cours', valeur: stats.commandesEnCours, couleur: 'bg-green-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Tableau de bord</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {cartes.map((c) => (
            <div key={c.label} className="bg-white rounded-xl shadow-md p-6">
              <div className={`w-10 h-10 rounded-lg ${c.couleur} mb-3`}></div>
              <p className="text-3xl font-bold text-gray-800">{c.valeur}</p>
              <p className="text-gray-500 text-sm">{c.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}