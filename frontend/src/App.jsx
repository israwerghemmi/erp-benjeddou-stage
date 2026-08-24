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
import Factures from './pages/Factures';
import PaiementSucces from './pages/PaiementSucces';
import PaiementEchec from './pages/PaiementEchec';
import HistoriquePaiements from './pages/HistoriquePaiements';
import ActivationMfa from './pages/ActivationMfa';
import JournalAudit from './pages/JournalAudit';
import GestionRoles from './pages/GestionRoles';
import GestionEquipe from './pages/GestionEquipe';
import RechercheGlobale from './pages/RechercheGlobale';
import { ThemeProvider } from './context/ThemeContext';
import { LangueProvider } from './context/LangueContext';
import GestionKyc from './pages/GestionKyc';
import Entrepots from './pages/Entrepots';
import MouvementsStock from './pages/MouvementsStock';
import GestionDocumentaire from './pages/GestionDocumentaire';
function App() {
  return (
  <ThemeProvider>
    <LangueProvider>
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
        <Route path="/factures" element={<RouteProtegee><Factures /></RouteProtegee>} />
        <Route path="/paiement/succes" element={<RouteProtegee><PaiementSucces /></RouteProtegee>} />
        <Route path="/paiement/echec" element={<RouteProtegee><PaiementEchec /></RouteProtegee>} />
        <Route path="/historique-paiements" element={<RouteProtegee><HistoriquePaiements /></RouteProtegee>} />
        <Route path="/mfa" element={<RouteProtegee><ActivationMfa /></RouteProtegee>} />
        <Route path="/journal-audit" element={<RouteProtegee><JournalAudit /></RouteProtegee>} />
        <Route path="/roles" element={<RouteProtegee><GestionRoles /></RouteProtegee>} />
        <Route path="/equipe" element={<RouteProtegee><GestionEquipe /></RouteProtegee>} />
        <Route path="/recherche" element={<RouteProtegee><RechercheGlobale /></RouteProtegee>} />
        <Route path="/kyc" element={<RouteProtegee><GestionKyc /></RouteProtegee>} />
        <Route path="/entrepots" element={<RouteProtegee><Entrepots /></RouteProtegee>} />
        <Route path="/mouvements-stock" element={<RouteProtegee><MouvementsStock /></RouteProtegee>} />
        <Route path="/documents" element={<RouteProtegee><GestionDocumentaire /></RouteProtegee>} />
      </Routes>
    </BrowserRouter>
  </LangueProvider>
</ThemeProvider>  
);
}

export default App;