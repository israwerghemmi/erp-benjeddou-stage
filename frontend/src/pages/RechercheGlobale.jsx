import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const routesParType = {
  client: '/clients',
  fournisseur: '/fournisseurs',
  produit: '/produits',
  devis: '/devis',
  commande: '/commandes',
  facture: '/factures',
};

const labelsParType = {
  client: 'Clients',
  fournisseur: 'Fournisseurs',
  produit: 'Produits',
  devis: 'Devis',
  commande: 'Commandes',
  facture: 'Factures',
};

export default function RechercheGlobale() {
  const [terme, setTerme] = useState('');
  const [resultats, setResultats] = useState(null);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');
  const navigate = useNavigate();

  const lancerRecherche = async (e) => {
    e.preventDefault();
    setErreur('');

    if (terme.trim().length < 2) {
      setErreur('Le terme de recherche doit contenir au moins 2 caractères.');
      return;
    }

    setChargement(true);
    try {
      const res = await api.get('/recherche', { params: { q: terme.trim() } });
      setResultats(res.data);
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de la recherche.');
      setResultats(null);
    } finally {
      setChargement(false);
    }
  };

  const allerVersResultat = (type, id) => {
    navigate(`${routesParType[type]}?focus=${id}`);
  };

  const aucunResultat = resultats && Object.values(resultats).every((liste) => liste.length === 0);

  return (
    <div className="erp-page">
      <div className="erp-container erp-container-md">
        <header className="erp-page-header">
          <h1>Recherche globale</h1>
          <p>Retrouvez rapidement un client, un produit, un devis, une commande ou une facture</p>
        </header>

        {erreur && <div className="erp-alert erp-alert-error">{erreur}</div>}

        <form onSubmit={lancerRecherche} className="erp-card erp-card-padded erp-form-row" style={{ marginBottom: '1.5rem' }}>
          <input
            type="text"
            value={terme}
            onChange={(e) => setTerme(e.target.value)}
            placeholder="Rechercher (nom, email, numéro...)"
            className="erp-input"
            style={{ flex: 1 }}
            autoFocus
          />
          <button type="submit" className="erp-btn erp-btn-primary" disabled={chargement}>
            {chargement ? 'Recherche...' : 'Rechercher'}
          </button>
        </form>

        {resultats && aucunResultat && (
          <div className="erp-card erp-card-padded" style={{ textAlign: 'center', color: 'var(--color-ink-muted)' }}>
            Aucun résultat pour « {terme} ».
          </div>
        )}

        {resultats && !aucunResultat && Object.entries(resultats).map(([type, liste]) => (
          liste.length > 0 && (
            <div key={type} className="erp-card erp-card-padded" style={{ marginBottom: '1rem' }}>
              <h3 style={{ marginBottom: '0.75rem' }}>{labelsParType[type]}</h3>
              <div className="erp-table-wrap">
                <table className="erp-table">
                  <tbody>
                    {liste.map((item) => (
                      <tr key={`${type}-${item.id}`}>
                        <td>{item.titre}</td>
                        <td style={{ color: 'var(--color-ink-muted)' }}>{item.sousTitre}</td>
                        <td>
                          <button
                            onClick={() => allerVersResultat(type, item.id)}
                            className="erp-btn-link erp-btn-link-primary"
                          >
                            Voir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}