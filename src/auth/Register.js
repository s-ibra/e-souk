import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaLock, FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import './Register.css'; // Importe les styles

// URL de base de votre API Render (ou locale si vous testez en local)
const API_BASE_URL = 'https://e-souk-backend.onrender.com/api'; 

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1); // Revenir à la page précédente
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }

        if (password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères.');
            return;
        }

        try {
            // Appel à la route /api/register du backend
            const response = await axios.post(`${API_BASE_URL}/register`, {
                email,
                password,
            });

            setSuccessMessage(response.data.message || "Inscription réussie ! Redirection...");
            
            // Redirection vers la page de connexion après succès
            setTimeout(() => {
                navigate('/login'); 
            }, 1500);

        } catch (err) {
            console.error('Erreur d\'inscription:', err);
            // Afficher le message d'erreur du backend
            const errorMessage = err.response?.data?.error || "Une erreur inconnue est survenue lors de l'inscription.";
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

            <div className="register-card">
                <h2><FaUserPlus /> Inscription Administrateur</h2>
                
                {successMessage && <p className="success-message">{successMessage}</p>}
                {error && <p className="error-message">{error}</p>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email"><FaEnvelope /> Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Entrez votre email"
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
                            placeholder="Minimum 6 caractères"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword"><FaLock /> Confirmer le mot de passe</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirmer le mot de passe"
                            required
                        />
                    </div>

                    <button type="submit" className="submit-button">
                        S'inscrire
                    </button>
                </form>

                <p className="redirect-text">
                    Déjà un compte ? <span onClick={() => navigate('/login')} className="redirect-link">Connectez-vous ici.</span>
                </p>
            </div>
        </div>
    );
};

export default Register;