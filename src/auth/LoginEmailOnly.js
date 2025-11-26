import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css'; // Utilisez votre CSS existant

const LoginEmailOnly = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            // NOTE IMPORTANTE : Utilise le nouveau port 5001 et une nouvelle route
            const response = await axios.post('http://localhost:5001/api/login-email-only', { 
                email,
            });

            // Stocke le token reçu du backend
            localStorage.setItem('token', response.data.token);
            
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                // Rediriger après succès
                navigate('/ma-boulangerie', { replace: true }); 
            }, 1500);

        } catch (err) {
            console.error('Erreur lors de la connexion sans MDP:', err.response?.data.error);
            setError(err.response?.data.error || 'Erreur de connexion. Vérifiez l\'email.');
        }
    };

    return (
        <div className="login-container">
            <div className="login-form-container">
                <h2>Mode Débogage : Connexion par Email</h2>
                
                {success && <p className="success-message">Connexion réussie ! Redirection...</p>}
                {error && <p className="error-message">{error}</p>}

                <form className="login-form" onSubmit={handleLogin}>
                    
                    <div className="form-group">
                        <label htmlFor="email">Email :</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Votre adresse email enregistrée"
                            required
                        />
                    </div>

                    <button className="submit-button" type="submit">
                        Se connecter (Sans MDP)
                    </button>

                    <p style={{ marginTop: '20px', fontSize: '12px' }}>
                        ⚠️ **Avertissement :** Utilisé uniquement pour le débogage.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default LoginEmailOnly;