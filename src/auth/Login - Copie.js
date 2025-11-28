import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaSignInAlt, FaLock, FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import './Login.css';

// URL de base de votre API Render (ou locale si vous testez en local)
const API_BASE_URL = 'https://e-souk-backend.onrender.com/api'; 

const Login = ({ setIsLoggedIn }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1); // Revenir à la page précédente
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post(`${API_BASE_URL}/login`, {
                email,
                password,
            });

            const { token, message } = response.data;
            
            // 1. Stocker le token JWT dans le stockage local
            localStorage.setItem('authToken', token);
            
            // 2. Mettre à jour l'état de connexion de l'application parente (App.js)
            // C'est essentiel pour afficher le bon contenu (admin vs public)
            if (setIsLoggedIn) {
                setIsLoggedIn(true);
            }

            console.log(message, 'Redirection vers l\'administration...');
            
            // 3. Redirection vers la page d'administration
            navigate('/admin');

        } catch (err) {
            console.error('Erreur de connexion:', err.response?.data?.error || err.message);
            const errorMessage = err.response?.data?.error || "Erreur lors de la connexion. Veuillez vérifier vos identifiants.";
            setError(errorMessage);
        }
    };

    return (
        <div className="auth-container">
            <button 
                className="back-button"
                onClick={handleGoBack}
                aria-label="Retour à la page précédente"
            >
                <FaArrowLeft /> Retour
            </button>
            
            <div className="login-card">
                <h2><FaSignInAlt /> Connexion Administrateur</h2>
                
                {error && <p className="error-message">{error}</p>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email"><FaEnvelope /> Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password"><FaLock /> Mot de passe</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mot de passe"
                            required
                        />
                    </div>

                    <button type="submit" className="submit-button">
                        Se connecter
                    </button>
                </form>
                
                <p className="redirect-text">
                    Pas encore de compte ? <span onClick={() => navigate('/register')} className="redirect-link">Inscrivez-vous ici.</span>
                </p>
            </div>
        </div>
    );
};

export default Login;