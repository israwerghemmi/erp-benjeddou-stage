import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Fournisseurs() {
  const [fournisseurs, setFournisseurs] = useState([]);
  const [nouveauFournisseur, setNouveauFournisseur] = useState({ nom: '', email: '', telephone: '' });
  const [erreur, setErreur] = useState('');

  const chargerFournisseurs = async () => {
    try {
      const res = await api.get('/fournisseurs');
      setFournisseurs(res.data);
    } catch (err) {
      setErreur('Impossible de charger les fournisseurs.');
    }
  };

  useEffect(() => { chargerFournisseurs(); }, []);

  const handleChange = (e) => setNouveauFournisseur({ ...nouveauFournisseur, [e.target.name]: e.target.value });

  const handleAjouter = async (e) => {
    e.preventDefault();
    try {
      await api.post('/fournisseurs', nouveauFournisseur);
      setNouveauFournisseur({ nom: '', email: '', telephone: '' });
      chargerFournisseurs();
    } catch (err) {
      setErreur('Erreur lors de l\'ajout du fournisseur.');
    }
  };

  return (
    <div className="erp-page">
      <div className="erp-container erp-container-md">
        <header className="erp-page-header">
          <h1>Mes Fournisseurs</h1>
          <p>Vos partenaires et contacts fournisseurs</p>
        </header>

        {erreur && <div className="erp-alert erp-alert-error">{erreur}</div>}

        <form onSubmit={handleAjouter} className="erp-card erp-card-padded erp-form-grid" style={{ marginBottom: '1.5rem' }}>
          <input name="nom" value={nouveauFournisseur.nom} placeholder="Nom du fournisseur" onChange={handleChange}
            className="erp-input" required />
          <input name="email" value={nouveauFournisseur.email} placeholder="Email" onChange={handleChange}
            className="erp-input" />
          <input name="telephone" value={nouveauFournisseur.telephone} placeholder="Téléphone" onChange={handleChange}
            className="erp-input" style={{ gridColumn: '1 / -1' }} />
          <button type="submit" className="erp-btn erp-btn-primary" style={{ gridColumn: '1 / -1' }}>
            Ajouter le fournisseur
          </button>
        </form>

        <div className="erp-table-wrap">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Téléphone</th>
              </tr>
            </thead>
            <tbody>
              {fournisseurs.map((f) => (
                <tr key={f.id}>
                  <td>{f.nom}</td>
                  <td>{f.email}</td>
                  <td>{f.telephone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
