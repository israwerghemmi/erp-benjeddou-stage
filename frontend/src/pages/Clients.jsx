import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [nouveauClient, setNouveauClient] = useState({ nom: '', email: '', telephone: '', adresse: '' });
  const [clientEnEdition, setClientEnEdition] = useState(null);
  const [erreur, setErreur] = useState('');

  const chargerClients = async () => {
    try {
      const res = await api.get('/clients');
      setClients(res.data);
    } catch (err) {
      setErreur('Impossible de charger les clients.');
    }
  };

  useEffect(() => { chargerClients(); }, []);

  const handleChange = (e) => setNouveauClient({ ...nouveauClient, [e.target.name]: e.target.value });

  const handleAjouter = async (e) => {
    e.preventDefault();
    try {
      await api.post('/clients', nouveauClient);
      setNouveauClient({ nom: '', email: '', telephone: '', adresse: '' });
      chargerClients();
    } catch (err) {
      setErreur('Erreur lors de l\'ajout du client.');
    }
  };

  const demarrerEdition = (client) => setClientEnEdition({ ...client });
  const annulerEdition = () => setClientEnEdition(null);
  const handleChangeEdition = (e) => setClientEnEdition({ ...clientEnEdition, [e.target.name]: e.target.value });

  const sauvegarderEdition = async () => {
    try {
      await api.put(`/clients/${clientEnEdition.id}`, clientEnEdition);
      setClientEnEdition(null);
      chargerClients();
    } catch (err) {
      setErreur('Erreur lors de la modification.');
    }
  };

  const supprimerClient = async (id) => {
    if (!window.confirm('Supprimer ce client ?')) return;
    try {
      await api.delete(`/clients/${id}`);
      chargerClients();
    } catch (err) {
      setErreur('Erreur lors de la suppression.');
    }
  };

  return (
    <div className="erp-page">
      <div className="erp-container erp-container-md">
        <header className="erp-page-header">
          <h1>Mes Clients</h1>
          <p>Gérez votre portefeuille clients</p>
        </header>

        {erreur && <div className="erp-alert erp-alert-error">{erreur}</div>}

        <form onSubmit={handleAjouter} className="erp-card erp-card-padded erp-form-grid" style={{ marginBottom: '1.5rem' }}>
          <input name="nom" value={nouveauClient.nom} placeholder="Nom" onChange={handleChange}
            className="erp-input" required />
          <input name="email" value={nouveauClient.email} placeholder="Email" onChange={handleChange}
            className="erp-input" />
          <input name="telephone" value={nouveauClient.telephone} placeholder="Téléphone" onChange={handleChange}
            className="erp-input" />
          <input name="adresse" value={nouveauClient.adresse} placeholder="Adresse" onChange={handleChange}
            className="erp-input" />
          <button type="submit" className="erp-btn erp-btn-primary" style={{ gridColumn: '1 / -1' }}>
            Ajouter le client
          </button>
        </form>

        <div className="erp-table-wrap">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Adresse</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id}>
                  {clientEnEdition?.id === c.id ? (
                    <>
                      <td><input name="nom" value={clientEnEdition.nom} onChange={handleChangeEdition} className="erp-input erp-input-sm" /></td>
                      <td><input name="email" value={clientEnEdition.email || ''} onChange={handleChangeEdition} className="erp-input erp-input-sm" /></td>
                      <td><input name="telephone" value={clientEnEdition.telephone || ''} onChange={handleChangeEdition} className="erp-input erp-input-sm" /></td>
                      <td><input name="adresse" value={clientEnEdition.adresse || ''} onChange={handleChangeEdition} className="erp-input erp-input-sm" /></td>
                      <td>
                        <div className="erp-table-actions">
                          <button onClick={sauvegarderEdition} className="erp-btn-link erp-btn-link-success">Enregistrer</button>
                          <button onClick={annulerEdition} className="erp-btn-link erp-btn-link-muted">Annuler</button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{c.nom}</td>
                      <td>{c.email}</td>
                      <td>{c.telephone}</td>
                      <td>{c.adresse}</td>
                      <td>
                        <div className="erp-table-actions">
                          <button onClick={() => demarrerEdition(c)} className="erp-btn-link erp-btn-link-primary">Modifier</button>
                          <button onClick={() => supprimerClient(c.id)} className="erp-btn-link erp-btn-link-danger">Supprimer</button>
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
