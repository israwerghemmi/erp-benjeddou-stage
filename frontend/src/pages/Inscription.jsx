import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Inscription() {
  const [form, setForm] = useState({
    nom_entreprise: '', email: '', telephone: '', nom_utilisateur: '', mot_de_passe: '',
    type_abonnement: 'trial',
  });
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');
    try {
      const res = await api.post('/comptes/inscription', form);
      setSucces(res.data.message);
      setTimeout(() => navigate('/connexion'), 1500);
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de l\'inscription.');
    }
  };

  return (
    <div className="erp-auth">
      <div className="erp-auth-brand">
        <div className="erp-auth-brand-content">
          <h1>
            Lancez votre <span className="erp-auth-brand-accent">ERP</span> en quelques minutes
          </h1>
          <p>
            Créez votre compte entreprise et commencez à gérer clients, stocks et facturation dès aujourd'hui.
          </p>
        </div>
      </div>

      <div className="erp-auth-form-panel">
        <form onSubmit={handleSubmit} className="erp-auth-form erp-form">
          <h2>Créer un compte</h2>
          <p className="erp-auth-form-subtitle">Inscription entreprise</p>

          {erreur && <div className="erp-alert erp-alert-error">{erreur}</div>}
          {succes && <div className="erp-alert erp-alert-success">{succes}</div>}

          <input name="nom_entreprise" placeholder="Nom de l'entreprise" onChange={handleChange}
            className="erp-input" required />
          <input name="email" type="email" placeholder="Email" onChange={handleChange}
            className="erp-input" required />
          <input name="telephone" placeholder="Téléphone" onChange={handleChange}
            className="erp-input" />
          <input name="nom_utilisateur" placeholder="Votre nom" onChange={handleChange}
            className="erp-input" required />
          <input name="mot_de_passe" type="password" placeholder="Mot de passe" onChange={handleChange}
            className="erp-input" required />

          <div className="erp-form-group">
            <p className="erp-form-label">Formule souhaitée</p>
            <label className="erp-radio-option">
              <input type="radio" name="type_abonnement" value="trial"
                checked={form.type_abonnement === 'trial'} onChange={handleChange} />
              <span>Période d'essai gratuite (30 connexions)</span>
            </label>
            <label className="erp-radio-option">
              <input type="radio" name="type_abonnement" value="direct"
                checked={form.type_abonnement === 'direct'} onChange={handleChange} />
              <span>Souscrire directement à un abonnement</span>
            </label>
          </div>

          <button type="submit" className="erp-btn erp-btn-accent erp-btn-full">
            S'inscrire
          </button>

          <p className="erp-auth-footer">
            Déjà un compte ? <Link to="/connexion">Se connecter</Link>
          </p>
        </form>
      </div>
    </div>
  );
}