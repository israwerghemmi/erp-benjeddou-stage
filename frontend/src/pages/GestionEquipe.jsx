import { useEffect, useState } from 'react';
import api from '../services/api';

export default function GestionEquipe() {
  const [membres, setMembres] = useState([]);
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({ nom: '', email: '', mot_de_passe: '', role_id: '' });
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');

  const charger = async () => {
    try {
      const [membresRes, rolesRes] = await Promise.all([
        api.get('/equipe'),
        api.get('/roles'),
      ]);
      setMembres(membresRes.data);
      setRoles(rolesRes.data);
    } catch (err) {
      setErreur('Impossible de charger l\'équipe.');
    }
  };

  useEffect(() => { charger(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const inviterCollaborateur = async (e) => {
    e.preventDefault();
    setErreur('');
    setSucces('');
    try {
      await api.post('/equipe/inviter', form);
      setSucces('Collaborateur ajouté avec succès.');
      setForm({ nom: '', email: '', mot_de_passe: '', role_id: '' });
      charger();
    } catch (err) {
      if (err.response?.data?.erreurs) {
        setErreur(err.response.data.erreurs.join(' '));
      } else {
        setErreur(err.response?.data?.message || 'Erreur lors de l\'ajout.');
      }
    }
  };

  const toggleActif = async (id) => {
    setErreur('');
    setSucces('');
    try {
      const res = await api.patch(`/equipe/${id}/desactiver`);
      setSucces(res.data.message);
      charger();
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors du changement de statut.');
    }
  };

  const supprimerCollaborateur = async (id, nom) => {
    if (!window.confirm(`Supprimer définitivement l'accès de ${nom} ?`)) return;
    setErreur('');
    setSucces('');
    try {
      await api.delete(`/equipe/${id}`);
      setSucces('Collaborateur supprimé.');
      charger();
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de la suppression.');
    }
  };

  return (
    <div className="erp-page">
      <div className="erp-container erp-container-md">
        <header className="erp-page-header">
          <h1>Gestion de l'équipe</h1>
          <p>Ajoutez des collaborateurs et attribuez-leur un rôle</p>
        </header>

        {erreur && <div className="erp-alert erp-alert-error">{erreur}</div>}
        {succes && <div className="erp-alert erp-alert-success">{succes}</div>}

        <form onSubmit={inviterCollaborateur} className="erp-card erp-card-padded erp-form-grid" style={{ marginBottom: '1.5rem' }}>
          <input name="nom" value={form.nom} placeholder="Nom du collaborateur" onChange={handleChange}
            className="erp-input" required />
          <input name="email" type="email" value={form.email} placeholder="Email" onChange={handleChange}
            className="erp-input" required />
          <input name="mot_de_passe" type="password" value={form.mot_de_passe} placeholder="Mot de passe temporaire" onChange={handleChange}
            className="erp-input" required />
          <select name="role_id" value={form.role_id} onChange={handleChange} className="erp-select">
            <option value="">Aucun rôle (à définir plus tard)</option>
            {roles.map((r) => <option key={r.id} value={r.id}>{r.nom}</option>)}
          </select>
          <button type="submit" className="erp-btn erp-btn-accent" style={{ gridColumn: '1 / -1' }}>
            Ajouter le collaborateur
          </button>
        </form>

        <div className="erp-table-wrap">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Dernière connexion</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {membres.map((m) => (
                <tr key={m.id}>
                  <td>{m.nom}</td>
                  <td>{m.email}</td>
                  <td>{m.role_nom || (m.role === 'admin_compte' ? 'Administrateur' : 'Non défini')}</td>
                  <td>
                    <span className={m.actif !== false ? 'erp-badge erp-badge-success' : 'erp-badge erp-badge-danger'}>
                      {m.actif !== false ? 'Actif' : 'Désactivé'}
                    </span>
                  </td>
                  <td>{m.derniere_connexion ? new Date(m.derniere_connexion).toLocaleString('fr-FR') : 'Jamais connecté'}</td>
                  <td>
                    {m.role !== 'admin_compte' && (
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button onClick={() => toggleActif(m.id)} className="erp-btn-link erp-btn-link-primary">
                          {m.actif !== false ? 'Désactiver' : 'Réactiver'}
                        </button>
                        <button onClick={() => supprimerCollaborateur(m.id, m.nom)} className="erp-btn-link" style={{ color: '#dc2626' }}>
                          Supprimer
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}