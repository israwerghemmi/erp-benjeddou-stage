import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const DUREE_INACTIVITE_MS = 10 * 1000; // 15 minutes

export default function useInactivityLogout() {
  const navigate = useNavigate();
  const timerRef = useRef(null);

  useEffect(() => {
    const deconnecter = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('utilisateur');
      localStorage.removeItem('compte');
      navigate('/connexion');
    };

    const reinitialiserTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(deconnecter, DUREE_INACTIVITE_MS);
    };

    const evenements = ['mousemove', 'keydown', 'click', 'scroll'];
    evenements.forEach((ev) => window.addEventListener(ev, reinitialiserTimer));

    reinitialiserTimer(); // démarre le minuteur au montage

    return () => {
      evenements.forEach((ev) => window.removeEventListener(ev, reinitialiserTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [navigate]);
}