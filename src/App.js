import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
// L'importation de 'react-icons/fa' a été retirée et remplacée par un simple caractère (←)
// pour éviter les erreurs de compilation dans cet environnement.

// --- LOGIQUE JWT/AUTH SIMPLIFIÉE ---
// NOTE: Le module 'jwt-decode' n'est pas résolu dans cet environnement.
// Nous utilisons une vérification d'authentification simplifiée basée sur le localStorage.
const checkAuth = () => {
    const token = localStorage.getItem('authToken');
    if (!token) return false;
    // Simulation d'une vérification de token valide
    return token === 'valid-token'; 
};

// --- COMPOSANT GARDIEN ---
const RequireAuth = ({ children }) => {
    const isAuthenticated = checkAuth();
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

// ------------------------------------------------------------------
// 1. COMPOSANTS INTÉGRÉS
// ------------------------------------------------------------------

// --- Home (Simulé) ---
const Home = () => {
    const navigate = useNavigate();
    const isLoggedIn = checkAuth();

    const handleAuthClick = () => {
        if (isLoggedIn) {
            navigate('/admin'); // Si connecté, va à l'administration
        } else {
            navigate('/login'); // Sinon, va à la page de connexion
        }
    };

    return (
        <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'Arial' }}>
            {/* Bouton de Connexion/Admin */}
            <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
                <button 
                    onClick={handleAuthClick}
                    style={{
                        padding: '8px 15px', 
                        fontSize: '14px', 
                        cursor: 'pointer',
                        // COULEUR NUDE/CRÈME
                        backgroundColor: '#e4d3c8', 
                        color: '#2d3748', // Texte sombre
                        border: 'none',
                        borderRadius: '5px'
                    }}
                >
                    {isLoggedIn ? 'Administration' : 'Se Connecter'}
                </button>
            </div>

            <h1>Bienvenue sur e-Souk</h1>
            <p>Découvrez nos produits locaux et éthiques.</p>
            <button 
                onClick={() => navigate('/commerces')}
                style={{
                    padding: '10px 20px', 
                    fontSize: '16px', 
                    cursor: 'pointer',
                    // COULEUR NUDE/CRÈME
                    backgroundColor: '#e4d3c8', 
                    color: '#2d3748', // Texte sombre
                    border: 'none',
                    borderRadius: '5px',
                    marginTop: '20px'
                }}
            >
                Voir les Commerces
            </button>
        </div>
    );
};

// --- Commerces (Simulé et Corrigé) ---
const commercesData = [
  {
    id: 1,
    name: 'Ma Boulangerie',
    category: 'Boulangerie',
    description: 'Boulangerie artisanale avec des produits bio et faits maison.',
    link: '/boulangerie', 
  },
  {
    id: 2,
    name: 'My Cake',
    category: 'Pâtisserie',
    description: 'Gâteau fait maison pour les occasions.',
    link: '/cake-publique', 
  },
];

const Commerces = () => {
    const navigate = useNavigate(); 
    const [searchTerm, setSearchTerm] = useState(''); 
    const [selectedCategory, setSelectedCategory] = useState(''); 

    const filteredCommerces = commercesData.filter((commerce) => {
        const matchName = commerce.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCategory = selectedCategory ? commerce.category === selectedCategory : true;
        return matchName && matchCategory;
    });

    const handleClick = (link) => navigate(link); 
    const handleGoHome = () => navigate('/');

    return (
        <div className="commerces-container" style={{ padding: '20px', fontFamily: 'Arial' }}>
            <div style={{ marginBottom: '20px' }}>
                <button 
                    onClick={handleGoHome} 
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2d3748' }}
                >
                    {/* Flèche simple pour le retour */}
                    ← Retour à l'accueil
                </button>
            </div>
            <h1 style={{ textAlign: 'center' }}>Tous les commerces</h1>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="Rechercher un commerce..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <select
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    value={selectedCategory}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                    <option value="">Toutes les catégories</option>
                    <option value="Boulangerie">Boulangerie</option>
                    <option value="Pâtisserie">Pâtisserie</option>
                </select>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
                {filteredCommerces.map((commerce) => (
                    <div 
                        key={commerce.id} 
                        style={{ 
                            border: '1px solid #ddd', 
                            padding: '15px', 
                            width: '250px', 
                            textAlign: 'center', 
                            borderRadius: '8px',
                            boxShadow: '2px 2px 5px rgba(0,0,0,0.1)',
                            cursor: 'pointer'
                        }}
                        onClick={() => handleClick(commerce.link)}
                    >
                        <h2>{commerce.name}</h2>
                        <p>{commerce.description}</p>
                        <button style={{ 
                            padding: '5px 10px', 
                            // COULEUR NUDE/CRÈME
                            backgroundColor: '#e4d3c8', 
                            color: '#2d3748', // Texte sombre
                            border: 'none', 
                            borderRadius: '4px' 
                        }}>
                            Voir plus
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- BoulangeriePublique (Simulé) ---
const BoulangeriePublique = () => {
    return (
        <div style={{ padding: '20px', fontFamily: 'Arial', textAlign: 'center' }}>
            <h1>Ma Boulangerie Publique</h1>
            <p>Bienvenue sur la page des produits de la boulangerie.</p>
            <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #eee', borderRadius: '5px' }}>
                <h2>Nos Pains</h2>
                <p>Découvrez notre gamme de pains au levain traditionnels.</p>
            </div>
        </div>
    );
};

// --- Login (Simulé) ---
const Login = ({ setIsLoggedIn }) => {
    const navigate = useNavigate();
    const handleLogin = () => {
        // Simulation d'une connexion réussie
        localStorage.setItem('authToken', 'valid-token');
        setIsLoggedIn(true);
        navigate('/admin'); // Redirection vers la page admin après connexion
    };

    return (
        <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'Arial' }}>
            <h1>Connexion</h1>
            <p>Identifiant et Mot de passe</p>
            <button 
                onClick={handleLogin}
                style={{
                    padding: '10px 20px', 
                    fontSize: '16px', 
                    cursor: 'pointer',
                    // COULEUR NUDE/CRÈME
                    backgroundColor: '#e4d3c8', 
                    color: '#2d3748', // Texte sombre
                    border: 'none',
                    borderRadius: '5px',
                    marginTop: '10px'
                }}
            >
                Se Connecter (Simulé)
            </button>
            <p style={{ marginTop: '15px' }}>
                Pas de compte ? <a href="/register" style={{ color: '#2d3748', fontWeight: 'bold' }}>S'inscrire</a>
            </p>
        </div>
    );
};

// --- Register (Simulé) ---
const Register = () => {
    const navigate = useNavigate();
    return (
        <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'Arial' }}>
            <h1>Inscription</h1>
            <p>Formulaire d'enregistrement pour un nouveau commerce.</p>
            <button 
                onClick={() => navigate('/login')}
                style={{
                    padding: '10px 20px', 
                    fontSize: '16px', 
                    cursor: 'pointer',
                    // COULEUR NUDE/CRÈME
                    backgroundColor: '#e4d3c8', 
                    color: '#2d3748', // Texte sombre
                    border: 'none',
                    borderRadius: '5px',
                    marginTop: '10px'
                }}
            >
                S'inscrire (Simulé)
            </button>
            <p style={{ marginTop: '15px' }}>
                Déjà un compte ? <a href="/login" style={{ color: '#2d3748', fontWeight: 'bold' }}>Se Connecter</a>
            </p>
        </div>
    );
};

// --- MaBoulangerieAdmin (Simulé) ---
const MaBoulangerieAdmin = ({ handleLogout }) => {
    return (
        <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'Arial' }}>
            <h1>Espace Administration - Ma Boulangerie</h1>
            <p>Bienvenue dans votre tableau de bord sécurisé.</p>
            {/* Le bouton de déconnexion garde sa couleur rouge pour insister sur l'action critique */}
            <button 
                onClick={handleLogout}
                style={{
                    padding: '10px 20px', 
                    fontSize: '16px', 
                    cursor: 'pointer',
                    backgroundColor: '#dc3545', // Rouge (danger/déconnexion)
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    marginTop: '20px'
                }}
            >
                Déconnexion
            </button>
        </div>
    );
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
                <Route 
                    path="/login" 
                    element={<Login setIsLoggedIn={setIsLoggedIn} />} 
                /> 
                <Route path="/register" element={<Register />} /> 

                {/* Chemin public des produits (Boulangerie) */}
                <Route path="/boulangerie" element={<BoulangeriePublique />} />
                
                {/* ---------------------------------------------------- */}
                {/* B. ROUTES PROTÉGÉES (Admin) */}
                {/* ---------------------------------------------------- */}
                {/* NOTE: Les routes non définies dans Commerces (ex: /cake-publique) donneront une 404 sauf si elles sont ajoutées ici. */}
                <Route path="/cake-publique" element={<BoulangeriePublique />} /> 
                <Route path="/savons-publique" element={<BoulangeriePublique />} /> 
                <Route path="/periculture-publique" element={<BoulangeriePublique />} />
                
                <Route 
                    path="/admin" 
                    element={
                        <RequireAuth>
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