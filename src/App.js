import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';

// ------------------------------------------------------------------
// 1. IMPORTS DES COMPOSANTS
// ------------------------------------------------------------------
// Base
import Home from './components/Home'; // Assurez-vous que ce chemin est correct
import Commerces from './components/Commerces'; // Assurez-vous que ce chemin est correct

// Authentification (Doivent être dans src/auth/)
import Login from './auth/Login';       
import Register from './auth/Register'; // <-- Inscription
// import LoginEmailOnly from './auth/LoginEmailOnly'; // Si vous maintenez cette route de débogage

// Commerce (Boulangerie)
import BoulangeriePublique from './commerce/BoulangeriePublique';
import MaBoulangerieAdmin from './commerce/MaBoulangerieAdmin'; 

// ------------------------------------------------------------------
// 2. LOGIQUE D'AUTHENTIFICATION (GARDES-ROUTES)
// ------------------------------------------------------------------

// Vérifie si le token JWT est présent et non expiré dans le localStorage
const checkAuth = () => {
    const token = localStorage.getItem('authToken');
    if (!token) return false;

    try {
        // Décode le token pour vérifier sa date d'expiration
        const decoded = jwtDecode(token);
        // exp est en secondes, Date.now() est en millisecondes
        if (decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem('authToken'); // Le token a expiré
            return false;
        }
        return true;
    } catch (e) {
        // Erreur de décodage (token invalide)
        localStorage.removeItem('authToken'); 
        return false;
    }
};

// Composant Gardien : Protège les routes
const RequireAuth = ({ children }) => {
    const isAuthenticated = checkAuth();
    if (!isAuthenticated) {
        // Si non authentifié, redirige vers la page de connexion
        return <Navigate to="/login" replace />;
    }
    return children;
};

// ------------------------------------------------------------------
// 3. COMPOSANT PRINCIPAL APP
// ------------------------------------------------------------------
const App = () => {
    // État de connexion initialisé par la vérification du token
    const [isLoggedIn, setIsLoggedIn] = useState(checkAuth());

    // Fonction de déconnexion
    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setIsLoggedIn(false);
        // Redirection après la déconnexion
        // Utilisation de window.location.href pour un rafraîchissement complet
        window.location.href = '/login'; 
    };
    
    return (
        <Router>
            <Routes>
                
                {/* ---------------------------------------------------- */}
                {/* A. ROUTES PUBLIQUES (Accessibles à tous) */}
                {/* ---------------------------------------------------- */}
                <Route path="/" element={<Home />} />
                <Route path="/commerces" element={<Commerces />} />
                
                {/* Pages d'Authentification */}
                {/* Le composant Login reçoit la fonction setIsLoggedIn pour mettre à jour l'état global */}
                <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} /> 
                <Route path="/register" element={<Register />} /> 

                {/* Chemin public des produits */}
                <Route path="/boulangerie" element={<BoulangeriePublique />} />
                
                {/* ---------------------------------------------------- */}
                {/* B. ROUTES PROTÉGÉES (Admin) */}
                {/* ---------------------------------------------------- */}
                {/* La route /admin est désormais protégée par RequireAuth */}
                <Route 
                    path="/admin" 
                    element={
                        <RequireAuth>
                            {/* Le composant Admin reçoit la fonction de déconnexion */}
                            <MaBoulangerieAdmin handleLogout={handleLogout} />
                        </RequireAuth>
                    } 
                />
                
                {/* Route 404/Not Found */}
                <Route path="*" element={<h1>404 - Page non trouvée</h1>} />
                
            </Routes>
        </Router>
    );
};

export default App;