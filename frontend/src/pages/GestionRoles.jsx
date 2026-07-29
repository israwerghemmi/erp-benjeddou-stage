import { useEffect, useState } from 'react';
import api from '../services/api';

const MODULES = ['clients', 'produits', 'fournisseurs', 'devis', 'commandes', 'finances', 'factures'];
const ACTIONS = ['consultation', 'creation', 'modification', 'suppression'];

export default function GestionRoles() {
  const [roles, setRoles] = useState([]);
  const [nom, setNom] = useState('');
  const [permissions, setPermissions] = useState({});
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');

  const charger = async () => {
    try {
      const res = await api.get('/roles');
      setRoles(res.data);
    } catch (err) {
      setErreur('Impossible de charger les rôles.');
    }
  };

  useEffect(() => { charger(); }, []);

  const toggleAction = (module, action) => {
    setPermissions((prev) => {
      const actionsModule = prev[module] || [];
      const nouvelleListe = actionsModule.includes(action)
        ? actionsModule.filter((a) => a !== action)
        : [...actionsModule, action];
      return { ...prev, [module]: nouvelleListe };
    });
  };

  const creerRole = async (e) => {
    e.preventDefault();
    setErreur('');
    setSucces('');
    try {
      await api.post('/roles', { nom, permissions });
      setSucces('Rôle créé avec succès.');
      setNom('');
      setPermissions({});
      charger();
    } catch (err) {
      setErreur('Erreur lors de la création du rôle.');
    }
  };

  return (
    <div className="erp-page">
      <div className="erp-container erp-container-md">
        <header className="erp-page-header">
          <h1>Gestion des rôles et permissions</h1>
          <p>Définissez les accès de votre équipe</p>
        </header>

        {erreur && <div className="erp-alert erp-alert-error">{erreur}</div>}
        {succes && <div className="erp-alert erp-alert-success">{succes}</div>}

        <form onSubmit={creerRole} className="erp-card erp-card-padded" style={{ marginBottom: '1.5rem' }}>
          <input
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Nom du rôle (ex: Responsable Stock)"
            className="erp-input"
            style={{ marginBottom: '1rem' }}
            required
          />

          <table className="erp-table" style={{ marginBottom: '1rem' }}>
            <thead>
              <tr>
                <th>Module</th>
                {ACTIONS.map((a) => <th key={a}>{a}</th>)}
              </tr>
            </thead>
            <tbody>
              {MODULES.map((module) => (
                <tr key={module}>
                  <td>{module}</td>
                  {ACTIONS.map((action) => (
                    <td key={action}>
                      <input
                        type="checkbox"
                        checked={(permissions[module] || []).includes(action)}
                        onChange={() => toggleAction(module, action)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <button type="submit" className="erp-btn erp-btn-accent">Créer le rôle</button>
        </form>

        <div className="erp-table-wrap">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Nom du rôle</th>
                <th>Permissions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((r) => (
                <tr key={r.id}>
                  <td>{r.nom}</td>
                  <td style={{ fontSize: '0.8rem' }}>
                    {Object.entries(r.permissions || {}).map(([mod, actions]) => (
                      <div key={mod}>{mod} : {actions.join(', ')}</div>
                    ))}
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