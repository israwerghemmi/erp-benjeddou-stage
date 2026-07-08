import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Connexion() {
  const [form, setForm] = useState({ email: '', mot_de_passe: '' });
  const [erreur, setErreur] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');
    try {
      const res = await api.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('utilisateur', JSON.stringify(res.data.utilisateur));
      localStorage.setItem('compte', JSON.stringify(res.data.compte));
      navigate('/clients');
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur de connexion.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Connexion</h1>

        {erreur && <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">{erreur}</div>}

        <input name="email" type="email" placeholder="Email" onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
        <input name="mot_de_passe" type="password" placeholder="Mot de passe" onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required />

        <button type="submit" className="w-full bg-blue-600 text-white rounded-lg p-3 font-medium hover:bg-blue-700 transition">
          Se connecter
        </button>

        <p className="text-center text-sm text-gray-500">
          Pas encore de compte ? <a href="/inscription" className="text-blue-600 hover:underline">S'inscrire</a>
        </p>
      </form>
    </div>
  );
}