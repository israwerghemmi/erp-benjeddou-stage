import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Entrepots() {
  const [entrepots, setEntrepots] = useState([]);
  const [nouveau, setNouveau] = useState({ nom: '', adresse: '', responsable: '' });
  const [erreur, setErreur] = useState('');

  const charger = async () => {
    try {
      const res = await api.get('/stock/entrepots');
      setEntrepots(res.data);
    } catch (err) {
      setErreur('Impossible de charger les entrepôts.');
    }
  };

  useEffect(() => { charger(); }, []);

  const handleChange = (e) => setNouveau({ ...nouveau, [e.target.name]: e.target.value });

  const handleAjouter = async (e) => {
    e.preventDefault();
    try {
      await api.post('/stock/entrepots', nouveau);
      setNouveau({ nom: '', adresse: '', responsable: '' });
      charger();
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de l\'ajout.');
    }
  };

  return (
    <div className="erp-page">
      <div className="erp-container erp-container-md">
        <header className="erp-page-header">
          <h1>Entrepôts</h1>
          <p>Gérez vos points de stockage</p>
        </header>

        {erreur && <div className="erp-alert erp-alert-error">{erreur}</div>}

        <form onSubmit={handleAjouter} className="erp-card erp-card-padded erp-form-grid" style={{ marginBottom: '1.5rem' }}>
          <input name="nom" value={nouveau.nom} placeholder="Nom de l'entrepôt" onChange={handleChange} className="erp-input" required />
          <input name="adresse" value={nouveau.adresse} placeholder="Adresse" onChange={handleChange} className="erp-input" />
          <input name="responsable" value={nouveau.responsable} placeholder="Responsable" onChange={handleChange} className="erp-input" />
          <button type="submit" className="erp-btn erp-btn-primary" style={{ gridColumn: '1 / -1' }}>
            Ajouter l'entrepôt
          </button>
        </form>

        <div className="erp-table-wrap">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Adresse</th>
                <th>Responsable</th>
              </tr>
            </thead>
            <tbody>
              {entrepots.map((e) => (
                <tr key={e.id}>
                  <td>{e.nom}</td>
                  <td>{e.adresse || '-'}</td>
                  <td>{e.responsable || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}