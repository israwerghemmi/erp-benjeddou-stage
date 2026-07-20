import { Navigate } from 'react-router-dom';
import Layout from './Layout';
import useInactivityLogout from '../hooks/useInactivityLogout';

export default function RouteProtegee({ children }) {
  const token = localStorage.getItem('token');
  useInactivityLogout();

  if (!token) return <Navigate to="/connexion" replace />;

  return <Layout>{children}</Layout>;
}