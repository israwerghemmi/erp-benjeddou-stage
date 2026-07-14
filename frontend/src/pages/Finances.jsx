import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Finances() {
  const [synthese, setSynthese] = useState(null);
  const [depenses, setDepenses] = useState([]);
  const [recettes, setRecettes] = useState([]);
  const [paiements, setPaiements] = useState([]);
  const [commandes, setCommandes] = useState([]);
  const [nouvelleDepense, setNouvelleDepense] = useState({ libelle: '', montant: '', categorie: '' });
  const [nouvelleRecette, setNouvelleRecette] = useState({ libelle: '', montant: '', categorie: '' });
  const [nouveauPaiement, setNouveauPaiement] = useState({ reference: '', montant: '', mode_paiement: 'especes', commande_id: '' });
  const [erreur, setErreur] = useState('');

  const charger = async () => {
    try {
      const [syntheseRes, depensesRes, recettesRes, paiementsRes, commandesRes] = await Promise.all([
        api.get('/rapports-financiers/synthese'),
        api.get('/depenses'),
        api.get('/recettes'),
        api.get('/paiements'),
        api.get('/commandes'),
      ]);
      setSynthese(syntheseRes.data);
      setDepenses(depensesRes.data);
      setRecettes(recettesRes.data);
      setPaiements(paiementsRes.data);
      setCommandes(commandesRes.data);
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

  const ajouterPaiement = async (e) => {
    e.preventDefault();
    try {
      await api.post('/paiements', {
        ...nouveauPaiement,
        montant: parseFloat(nouveauPaiement.montant),
        commande_id: nouveauPaiement.commande_id || null,
      });
      setNouveauPaiement({ reference: '', montant: '', mode_paiement: 'especes', commande_id: '' });
      charger();
    } catch (err) {
      setErreur('Erreur lors de l\'ajout du paiement.');
    }
  };

  return (
    <div className="erp-page">
      <div className="erp-container erp-container-xl">
        <header className="erp-page-header">
          <h1>Gestion Financière</h1>
          <p>Recettes, dépenses et suivi de trésorerie</p>
        </header>

        {erreur && <div className="erp-alert erp-alert-error">{erreur}</div>}

        {synthese && (
          <div className="erp-stat-grid" style={{ marginBottom: '2rem' }}>
            <div className="erp-stat-card accent-green">
              <div className="erp-stat-label">Total Recettes</div>
              <div className="erp-stat-value" style={{ color: 'var(--color-success)' }}>{synthese.totalRecettes} DT</div>
            </div>
            <div className="erp-stat-card accent-red">
              <div className="erp-stat-label">Total Dépenses</div>
              <div className="erp-stat-value" style={{ color: 'var(--color-danger)' }}>{synthese.totalDepenses} DT</div>
            </div>
            <div className="erp-stat-card accent-blue">
              <div className="erp-stat-label">Total Paiements</div>
              <div className="erp-stat-value" style={{ color: 'var(--color-info)' }}>{synthese.totalPaiements} DT</div>
            </div>
            <div className="erp-stat-card accent-teal">
              <div className="erp-stat-label">Solde</div>
              <div className="erp-stat-value" style={{ color: synthese.solde >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                {synthese.solde} DT
              </div>
            </div>
          </div>
        )}

        <div className="erp-finance-grid">
          <div>
            <h2 className="erp-section-title">Recettes</h2>
            <form onSubmit={ajouterRecette} className="erp-card erp-card-padded-sm erp-form" style={{ marginBottom: '1rem' }}>
              <input placeholder="Libellé" value={nouvelleRecette.libelle}
                onChange={(e) => setNouvelleRecette({ ...nouvelleRecette, libelle: e.target.value })}
                className="erp-input" required />
              <input type="number" step="0.01" placeholder="Montant" value={nouvelleRecette.montant}
                onChange={(e) => setNouvelleRecette({ ...nouvelleRecette, montant: e.target.value })}
                className="erp-input" required />
              <input placeholder="Catégorie" value={nouvelleRecette.categorie}
                onChange={(e) => setNouvelleRecette({ ...nouvelleRecette, categorie: e.target.value })}
                className="erp-input" />
              <button type="submit" className="erp-btn erp-btn-success erp-btn-full">
                Ajouter une recette
              </button>
            </form>
            <div className="erp-card" style={{ overflow: 'hidden' }}>
              {recettes.map((r) => (
                <div key={r.id} className="erp-list-item">
                  <span>{r.libelle}</span>
                  <span className="erp-amount-positive">+{r.montant} DT</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="erp-section-title">Dépenses</h2>
            <form onSubmit={ajouterDepense} className="erp-card erp-card-padded-sm erp-form" style={{ marginBottom: '1rem' }}>
              <input placeholder="Libellé" value={nouvelleDepense.libelle}
                onChange={(e) => setNouvelleDepense({ ...nouvelleDepense, libelle: e.target.value })}
                className="erp-input" required />
              <input type="number" step="0.01" placeholder="Montant" value={nouvelleDepense.montant}
                onChange={(e) => setNouvelleDepense({ ...nouvelleDepense, montant: e.target.value })}
                className="erp-input" required />
              <input placeholder="Catégorie" value={nouvelleDepense.categorie}
                onChange={(e) => setNouvelleDepense({ ...nouvelleDepense, categorie: e.target.value })}
                className="erp-input" />
              <button type="submit" className="erp-btn erp-btn-danger erp-btn-full">
                Ajouter une dépense
              </button>
            </form>
            <div className="erp-card" style={{ overflow: 'hidden' }}>
              {depenses.map((d) => (
                <div key={d.id} className="erp-list-item">
                  <span>{d.libelle}</span>
                  <span className="erp-amount-negative">-{d.montant} DT</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="erp-section-title">Paiements</h2>
            <form onSubmit={ajouterPaiement} className="erp-card erp-card-padded-sm erp-form" style={{ marginBottom: '1rem' }}>
              <input placeholder="Référence" value={nouveauPaiement.reference}
                onChange={(e) => setNouveauPaiement({ ...nouveauPaiement, reference: e.target.value })}
                className="erp-input" required />
              <input type="number" step="0.01" placeholder="Montant" value={nouveauPaiement.montant}
                onChange={(e) => setNouveauPaiement({ ...nouveauPaiement, montant: e.target.value })}
                className="erp-input" required />
              <select value={nouveauPaiement.mode_paiement}
                onChange={(e) => setNouveauPaiement({ ...nouveauPaiement, mode_paiement: e.target.value })}
                className="erp-select">
                <option value="especes">Espèces</option>
                <option value="cheque">Chèque</option>
                <option value="virement">Virement</option>
                <option value="carte">Carte</option>
              </select>
              <select value={nouveauPaiement.commande_id}
                onChange={(e) => setNouveauPaiement({ ...nouveauPaiement, commande_id: e.target.value })}
                className="erp-select">
                <option value="">Aucune commande liée</option>
                {commandes.map((c) => <option key={c.id} value={c.id}>{c.numero}</option>)}
              </select>
              <button type="submit" className="erp-btn erp-btn-primary erp-btn-full">
                Ajouter un paiement
              </button>
            </form>
            <div className="erp-card" style={{ overflow: 'hidden' }}>
              {paiements.map((p) => (
                <div key={p.id} className="erp-list-item">
                  <span>{p.reference} ({p.mode_paiement})</span>
                  <span className="erp-amount-neutral">{p.montant} DT</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
