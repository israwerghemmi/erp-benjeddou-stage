import { Navigate } from 'react-router-dom';
import Navbar from './Navbar';

export default function RouteProtegee({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/connexion" replace />;

  return (
    <>
      <Navbar />
      {children}
    </>
  );
}