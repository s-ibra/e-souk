import React from 'react';
import { useLocation, Navigate, Outlet } from 'react-router-dom';

const RequireAuth = () => {
  // 1. Vérifie si le token d'authentification existe
  const isAuthenticated = localStorage.getItem('token'); 
  
  // 2. Récupère l'objet de localisation (l'URL actuelle)
  const location = useLocation();

  if (!isAuthenticated) {
    // 3. Si non connecté : 
    // Redirige vers la page de connexion ("/login")
    // et passe l'objet 'location' complet dans l'état de navigation sous la clé 'from'.
    // C'est cette information que Login.js utilise pour déterminer la redirection post-connexion.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 4. Si connecté : 
  // Affiche le composant enfant de la route protégée (<Outlet />).
  return <Outlet />;
};

export default RequireAuth;