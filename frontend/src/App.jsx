import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Inscription from './pages/Inscription';
import Connexion from './pages/Connexion';
import Clients from './pages/Clients';
import Fournisseurs from './pages/Fournisseurs';
import Commandes from './pages/Commandes';
import Produits from './pages/Produits';
import Devis from './pages/Devis';
import Dashboard from './pages/Dashboard';
import RouteProtegee from './components/RouteProtegee';
import ComptesEnAttente from './pages/ComptesEnAttente';
import Finances from './pages/Finances';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/connexion" />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/clients" element={<RouteProtegee><Clients /></RouteProtegee>} />
        <Route path="/produits" element={<RouteProtegee><Produits /></RouteProtegee>} />
        <Route path="/fournisseurs" element={<RouteProtegee><Fournisseurs /></RouteProtegee>} />
        <Route path="/devis" element={<RouteProtegee><Devis /></RouteProtegee>} />
        <Route path="/commandes" element={<RouteProtegee><Commandes /></RouteProtegee>} />
        <Route path="/dashboard" element={<RouteProtegee><Dashboard /></RouteProtegee>} />
        <Route path="/comptes-en-attente" element={<RouteProtegee><ComptesEnAttente /></RouteProtegee>} />
        <Route path="/finances" element={<RouteProtegee><Finances /></RouteProtegee>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;