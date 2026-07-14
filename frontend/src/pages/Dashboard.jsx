import { useEffect, useState } from 'react';
import api from '../services/api';

const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
);
const IconBox = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
);
const IconTruck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
);
const IconFile = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
);
const IconCart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
);

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
    { label: 'Clients', valeur: stats.clients, accent: 'accent-blue', iconStyle: { background: '#dbeafe', color: '#2563eb' }, Icon: IconUsers },
    { label: 'Produits', valeur: stats.produits, accent: 'accent-purple', iconStyle: { background: '#ede9fe', color: '#7c3aed' }, Icon: IconBox },
    { label: 'Fournisseurs', valeur: stats.fournisseurs, accent: 'accent-orange', iconStyle: { background: '#ffedd5', color: '#ea580c' }, Icon: IconTruck },
    { label: 'Devis en attente', valeur: stats.devisEnAttente, accent: 'accent-amber', iconStyle: { background: '#fef3d6', color: '#d4922a' }, Icon: IconFile },
    { label: 'Commandes en cours', valeur: stats.commandesEnCours, accent: 'accent-green', iconStyle: { background: '#d1fae5', color: '#059669' }, Icon: IconCart },
  ];

  return (
    <div className="erp-page">
      <div className="erp-container erp-container-lg">
        <header className="erp-page-header">
          <h1>Tableau de bord</h1>
          <p>Vue d'ensemble de votre activité</p>
        </header>

        <div className="erp-stat-grid">
          {cartes.map((c) => (
            <div key={c.label} className={`erp-stat-card ${c.accent}`}>
              <div className="erp-stat-icon" style={c.iconStyle}>
                <c.Icon />
              </div>
              <div className="erp-stat-value">{c.valeur}</div>
              <div className="erp-stat-label">{c.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
