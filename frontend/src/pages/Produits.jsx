import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Produits() {
  const [produits, setProduits] = useState([]);
  const [nouveauProduit, setNouveauProduit] = useState({ nom: '', reference: '', prix: '', quantite_stock: '' });
  const [produitEnEdition, setProduitEnEdition] = useState(null);
  const [erreur, setErreur] = useState('');

  const charger = async () => {
    try {
      const res = await api.get('/produits');
      setProduits(res.data);
    } catch (err) {
      setErreur('Impossible de charger les produits.');
    }
  };

  useEffect(() => { charger(); }, []);

  const handleChange = (e) => setNouveauProduit({ ...nouveauProduit, [e.target.name]: e.target.value });

  const handleAjouter = async (e) => {
    e.preventDefault();
    try {
      await api.post('/produits', {
        ...nouveauProduit,
        prix: parseFloat(nouveauProduit.prix),
        quantite_stock: parseInt(nouveauProduit.quantite_stock),
      });
      setNouveauProduit({ nom: '', reference: '', prix: '', quantite_stock: '' });
      charger();
    } catch (err) {
      setErreur('Erreur lors de l\'ajout du produit.');
    }
  };

  const demarrerEdition = (produit) => setProduitEnEdition({ ...produit });
  const annulerEdition = () => setProduitEnEdition(null);
  const handleChangeEdition = (e) => setProduitEnEdition({ ...produitEnEdition, [e.target.name]: e.target.value });

  const sauvegarderEdition = async () => {
    try {
      await api.put(`/produits/${produitEnEdition.id}`, {
        ...produitEnEdition,
        prix: parseFloat(produitEnEdition.prix),
        quantite_stock: parseInt(produitEnEdition.quantite_stock),
      });
      setProduitEnEdition(null);
      charger();
    } catch (err) {
      setErreur('Erreur lors de la modification.');
    }
  };

  const supprimerProduit = async (id) => {
    if (!window.confirm('Supprimer ce produit ?')) return;
    try {
      await api.delete(`/produits/${id}`);
      charger();
    } catch (err) {
      setErreur('Erreur lors de la suppression.');
    }
  };

  return (
    <div className="erp-page">
      <div className="erp-container erp-container-md">
        <header className="erp-page-header">
          <h1>Mes Produits</h1>
          <p>Catalogue et gestion des stocks</p>
        </header>

        {erreur && <div className="erp-alert erp-alert-error">{erreur}</div>}

        <form onSubmit={handleAjouter} className="erp-card erp-card-padded erp-form-grid" style={{ marginBottom: '1.5rem' }}>
          <input name="nom" value={nouveauProduit.nom} placeholder="Nom du produit" onChange={handleChange}
            className="erp-input" required />
          <input name="reference" value={nouveauProduit.reference} placeholder="Référence" onChange={handleChange}
            className="erp-input" />
          <input name="prix" type="number" step="0.01" value={nouveauProduit.prix} placeholder="Prix" onChange={handleChange}
            className="erp-input" required />
          <input name="quantite_stock" type="number" value={nouveauProduit.quantite_stock} placeholder="Quantité en stock" onChange={handleChange}
            className="erp-input" />
          <button type="submit" className="erp-btn erp-btn-primary" style={{ gridColumn: '1 / -1' }}>
            Ajouter le produit
          </button>
        </form>

        <div className="erp-table-wrap">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Référence</th>
                <th>Prix</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {produits.map((p) => (
                <tr key={p.id}>
                  {produitEnEdition?.id === p.id ? (
                    <>
                      <td><input name="nom" value={produitEnEdition.nom} onChange={handleChangeEdition} className="erp-input erp-input-sm" /></td>
                      <td><input name="reference" value={produitEnEdition.reference || ''} onChange={handleChangeEdition} className="erp-input erp-input-sm" /></td>
                      <td><input name="prix" type="number" step="0.01" value={produitEnEdition.prix} onChange={handleChangeEdition} className="erp-input erp-input-sm" /></td>
                      <td><input name="quantite_stock" type="number" value={produitEnEdition.quantite_stock} onChange={handleChangeEdition} className="erp-input erp-input-sm" /></td>
                      <td>
                        <div className="erp-table-actions">
                          <button onClick={sauvegarderEdition} className="erp-btn-link erp-btn-link-success">Enregistrer</button>
                          <button onClick={annulerEdition} className="erp-btn-link erp-btn-link-muted">Annuler</button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{p.nom}</td>
                      <td>{p.reference}</td>
                      <td>{p.prix} DT</td>
                      <td>{p.quantite_stock}</td>
                      <td>
                        <div className="erp-table-actions">
                          <button onClick={() => demarrerEdition(p)} className="erp-btn-link erp-btn-link-primary">Modifier</button>
                          <button onClick={() => supprimerProduit(p.id)} className="erp-btn-link erp-btn-link-danger">Supprimer</button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
