import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Inscription from './pages/Inscription';
import Connexion from './pages/Connexion';
import Clients from './pages/Clients';
import Fournisseurs from './pages/Fournisseurs';
import Commandes from './pages/Commandes';
import Produits from './pages/Produits';
import Devis from './pages/Devis';
import Dashboard from './pages/Dashboard';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/connexion" />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/fournisseurs" element={<Fournisseurs />} />
        <Route path="/commandes" element={<Commandes />} />
        <Route path="/devis" element={<Devis />} />
        <Route path="/produits" element={<Produits />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;