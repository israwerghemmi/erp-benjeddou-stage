import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Inscription() {
  const [form, setForm] = useState({
    nom_entreprise: '', email: '', telephone: '', nom_utilisateur: '', mot_de_passe: '',
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Créer votre compte entreprise</h1>

        {erreur && <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">{erreur}</div>}
        {succes && <div className="bg-green-100 text-green-700 p-3 rounded-lg text-sm">{succes}</div>}

        <input name="nom_entreprise" placeholder="Nom de l'entreprise" onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
        <input name="email" type="email" placeholder="Email" onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
        <input name="telephone" placeholder="Téléphone" onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input name="nom_utilisateur" placeholder="Votre nom" onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
        <input name="mot_de_passe" type="password" placeholder="Mot de passe" onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required />

        <button type="submit" className="w-full bg-blue-600 text-white rounded-lg p-3 font-medium hover:bg-blue-700 transition">
          S'inscrire
        </button>

        <p className="text-center text-sm text-gray-500">
          Déjà un compte ? <a href="/connexion" className="text-blue-600 hover:underline">Se connecter</a>
        </p>
      </form>
    </div>
  );
}