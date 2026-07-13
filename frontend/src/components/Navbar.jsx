import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const utilisateur = JSON.parse(localStorage.getItem('utilisateur') || '{}');
  const compte = JSON.parse(localStorage.getItem('compte') || '{}');

  const handleDeconnexion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('utilisateur');
    localStorage.removeItem('compte');
    navigate('/connexion');
  };

  const liens = [
    { label: 'Tableau de bord', path: '/dashboard' },
    { label: 'Clients', path: '/clients' },
    { label: 'Produits', path: '/produits' },
    { label: 'Fournisseurs', path: '/fournisseurs' },
    { label: 'Devis', path: '/devis' },
    { label: 'Commandes', path: '/commandes' },
    { label: 'Finances', path: '/finances' },
  ];
  
  if (utilisateur.role === 'admin_plateforme') {
    liens.push({ label: 'Comptes en attente', path: '/comptes-en-attente' });
  }

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <span className="font-bold text-gray-800">{compte.nom_entreprise || 'ERP'}</span>
        {liens.map((l) => (
          <Link key={l.path} to={l.path} className="text-gray-600 hover:text-blue-600 text-sm font-medium">
            {l.label}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">{utilisateur.nom}</span>
        <button onClick={handleDeconnexion} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-100 transition">
          Déconnexion
        </button>
      </div>
    </nav>
  );
}