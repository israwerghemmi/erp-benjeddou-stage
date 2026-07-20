import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Connexion() {
  const [form, setForm] = useState({ email: '', mot_de_passe: '' });
  const [erreur, setErreur] = useState('');
  const [messageTrial, setMessageTrial] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');
    setMessageTrial('');
    try {
      const res = await api.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('utilisateur', JSON.stringify(res.data.utilisateur));
      localStorage.setItem('compte', JSON.stringify(res.data.compte));

      if (res.data.messageTrial) {
        setMessageTrial(res.data.messageTrial);
        setTimeout(() => navigate('/clients'), 2000);
      } else {
        navigate('/clients');
      }
    } catch (err) {
      if (err.response?.data?.statut === 'expire') {
        setErreur(err.response.data.message + ' Vous pouvez exporter vos données depuis la page dédiée.');
      } else {
        setErreur(err.response?.data?.message || 'Erreur de connexion.');
      }
    }
  };

  return (
    <div className="erp-auth">
      <div className="erp-auth-brand">
        <div className="erp-auth-brand-content">
          <h1>
            Pilotez votre <span className="erp-auth-brand-accent">entreprise</span> avec clarté
          </h1>
          <p>
            Clients, commandes, finances et factures — tout centralisé dans un espace de travail pensé pour les équipes tunisiennes.
          </p>
        </div>
      </div>

      <div className="erp-auth-form-panel">
        <form onSubmit={handleSubmit} className="erp-auth-form erp-form">
          <h2>Connexion</h2>
          <p className="erp-auth-form-subtitle">Accédez à votre espace de gestion</p>

          {erreur && <div className="erp-alert erp-alert-error">{erreur}</div>}
          {messageTrial && <div className="erp-alert erp-alert-warning">{messageTrial}</div>}

          <input name="email" type="email" placeholder="Email professionnel" onChange={handleChange}
            className="erp-input" required />
          <input name="mot_de_passe" type="password" placeholder="Mot de passe" onChange={handleChange}
            className="erp-input" required />

          <button type="submit" className="erp-btn erp-btn-accent erp-btn-full">
            Se connecter
          </button>

          <p className="erp-auth-footer">
            Pas encore de compte ? <Link to="/inscription">S'inscrire</Link>
          </p>
        </form>
      </div>
    </div>
  );
}