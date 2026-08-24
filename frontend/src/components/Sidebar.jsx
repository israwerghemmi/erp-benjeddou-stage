import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LangueContext';

const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconDashboard = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" />
  </svg>
);

const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconBox = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const IconTruck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const IconFile = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const IconCart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const IconWallet = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const IconReceipt = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
    <path d="M8 10h8" /><path d="M8 14h4" />
  </svg>
);

const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const IconHistory = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v5h5" /><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
    <path d="M12 7v5l4 2" />
  </svg>
);

const ICONS = {
  dashboard: IconDashboard,
  recherche: IconSearch,
  clients: IconUsers,
  produits: IconBox,
  fournisseurs: IconTruck,
  devis: IconFile,
  commandes: IconCart,
  finances: IconWallet,
  factures: IconReceipt,
  historique: IconHistory,
  admin: IconShield,
  
};

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, basculerTheme } = useTheme();
  const { langue, setLangue } = useLanguage();
  const { t } = useTranslation();
  const utilisateur = JSON.parse(localStorage.getItem('utilisateur') || '{}');
  const compte = JSON.parse(localStorage.getItem('compte') || '{}');

  const handleDeconnexion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('utilisateur');
    localStorage.removeItem('compte');
    navigate('/connexion');
  };
  const liens = [
      { label: t('sidebar.tableauDeBord'), path: '/dashboard', icon: 'dashboard' },
      { label: t('sidebar.rechercheGlobale'), path: '/recherche', icon: 'recherche' },
      { label: t('sidebar.clients'), path: '/clients', icon: 'clients' },
      { label: t('sidebar.produits'), path: '/produits', icon: 'produits' },
      { label: t('sidebar.fournisseurs'), path: '/fournisseurs', icon: 'fournisseurs' },
      { label: t('sidebar.devis'), path: '/devis', icon: 'devis' },
      { label: t('sidebar.commandes'), path: '/commandes', icon: 'commandes' },
      { label: t('sidebar.finances'), path: '/finances', icon: 'finances' },
      { label: t('sidebar.factures'), path: '/factures', icon: 'factures' },
      { label: t('sidebar.historiquePaiements'), path: '/historique-paiements', icon: 'historique' },
      { label: t('Gestion Documentaire'), path: '/documents', icon: 'factures' },
  ];
  
    // Modules d'administration : UNIQUEMENT pour admin_compte et admin_plateforme
    if (utilisateur.role === 'admin_compte' || utilisateur.role === 'admin_plateforme') {
      liens.push(
        { label: t('sidebar.verificationKyc'), path: '/kyc', icon: 'admin' },
        { label: t('sidebar.journalAudit'), path: '/journal-audit', icon: 'admin' },
        { label: t('sidebar.securiteMfa'), path: '/mfa', icon: 'admin' },
        { label: t('sidebar.rolesPermissions'), path: '/roles', icon: 'admin' },
        { label: t('sidebar.equipe'), path: '/equipe', icon: 'clients' },
        { label: t('Entrepots'), path: '/entrepots', icon: 'produits' },
        { label: t('Mouvements Stock'), path: '/mouvements-stock', icon: 'produits' }
      );
    }
  
    // Modules réservés UNIQUEMENT à l'admin plateforme
    if (utilisateur.role === 'admin_plateforme') {
      liens.push({ label: t('sidebar.comptesEnAttente'), path: '/comptes-en-attente', icon: 'admin' });
    }

  const initiales = (utilisateur.nom || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="erp-sidebar">
      <div className="erp-sidebar-brand">
        <span className="erp-sidebar-brand-name">{compte.nom_entreprise || 'ERP'}</span>
        <span className="erp-sidebar-brand-tag">{t('sidebar.gestionEntreprise')}</span>
      </div>

      <nav className="erp-sidebar-nav">
        {liens.map((l) => {
          const Icon = ICONS[l.icon];
          const active = location.pathname === l.path;
          return (
            <Link
              key={l.path}
              to={l.path}
              className={`erp-sidebar-link${active ? ' active' : ''}`}
            >
              <Icon />
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="erp-sidebar-footer">
        <div className="erp-sidebar-user">
          <div className="erp-sidebar-avatar">{initiales}</div>
          <div>
            <div className="erp-sidebar-user-name">{utilisateur.nom || t('sidebar.utilisateur')}</div>
            <div className="erp-sidebar-user-role">{utilisateur.role?.replace('_', ' ') || t('sidebar.membre')}</div>
          </div>
        </div>

        <select value={langue} onChange={(e) => setLangue(e.target.value)} className="erp-select erp-input-sm">
          <option value="fr">Français</option>
          <option value="en">English</option>
          <option value="ar">العربية</option>
        </select>

        <button onClick={basculerTheme} className="erp-btn erp-btn-ghost erp-btn-sm erp-btn-full">
          {theme === 'clair' ? `🌙 ${t('sidebar.modeSombre')}` : `☀️ ${t('sidebar.modeClair')}`}
        </button>

        <button onClick={handleDeconnexion} className="erp-btn erp-btn-ghost-danger erp-btn-sm erp-btn-full">
          {t('sidebar.deconnexion')}
        </button>
      </div>
    </aside>
  );
}
