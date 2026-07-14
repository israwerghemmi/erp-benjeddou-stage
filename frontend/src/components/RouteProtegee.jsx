import { Navigate } from 'react-router-dom';
import Layout from './Layout';

export default function RouteProtegee({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/connexion" replace />;

  return <Layout>{children}</Layout>;
}
