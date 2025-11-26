import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Login.css';
import { FaTimes } from 'react-icons/fa';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // États du formulaire
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // États de l'application
  const [mode, setMode] = useState('login'); // 'login' ou 'register'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // LOGIQUE DE REDIRECTION AFFINÉE AVEC MAPPING
  const getRedirectPath = () => {
    // Récupère le chemin d'où l'utilisateur vient (ex: /boulangerie-publique)
    const fromPath = location.state?.from?.pathname;
    
    // Table de correspondance : Clé = Route Publique, Valeur = Route Privée
    const routeMapping = {
      '/boulangerie-publique': '/ma-boulangerie',
      '/cake-publique': '/my-cake',
      '/periculture-publique': '/ma-periculture',
      '/savons-publique': '/mes-savons',
    };

    // Retourne la route privée spécifique ou la route par défaut
    return routeMapping[fromPath] || '/ma-boulangerie';
  };
  
  // Stocke le chemin de redirection calculé
  const redirectPath = getRedirectPath(); 

  // Gérer l'affichage du message de succès après inscription
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const modeParam = params.get('mode');
    if (modeParam === 'login' && !error) {
      setMode('login');
      setSuccess(true); 
      setTimeout(() => setSuccess(false), 2000); 
    }
  }, [location, error]);

  // Fonction pour gérer la connexion
  const handleLogin = async () => {
    setError(''); 
    try {
      const response = await axios.post('http://localhost:5001/api/login', {
        email,
        password,
      });
      localStorage.setItem('token', response.data.token);
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        // Utilise le chemin d'origine MAPPÉ
        navigate(redirectPath, { replace: true }); 
      }, 2000);
    } catch (err) {
      console.error('Erreur lors de la connexion:', err.response?.data.error);
      setError(err.response?.data.error || 'Identifiants ou mot de passe incorrects.');
    }
  };

  // Fonction pour gérer l'inscription
  const handleRegister = async () => {
    setError('');
    
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    try {
      await axios.post('http://localhost:5001/api/register', {
        email,
        password,
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate('/login?mode=login'); 
      }, 2000);
      
    } catch (err) {
      console.error('Erreur lors de l\'inscription:', err.response?.data.error);
      setError(err.response?.data.error || 'Erreur lors de l\'inscription.');
    }
  };

  // Fonction pour changer entre "Connexion" et "Inscription"
  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
    setSuccess(false); 
    setEmail(''); 
    setPassword('');
    setConfirmPassword('');
  };

  // Fonction pour retourner à la page des commerces (chemin de sortie)
  const handleBack = () => {
    navigate('/commerces');
  };

  // Fonction de soumission unique pour gérer les deux modes
  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'login') {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  return (
    <div className="login-container">
      {/* Barre de retour */}
      <div className="login-header">
        <button className="back-button" onClick={handleBack}>
          <FaTimes /> Retour
        </button>
      </div>

      {/* Contenu principal */}
      <div className="login-form-container">
        <h2>{mode === 'login' ? 'Connexion à e-souk' : 'Inscription à e-souk'}</h2>
        
        {/* Messages d'alerte */}
        {success && (
          <p className="success-message">
            {mode === 'login'
              ? 'Connexion réussie ! Redirection...'
              : 'Inscription réussie ! Veuillez vous connecter.'}
          </p>
        )}
        {error && <p className="error-message">{error}</p>}

        {/* Formulaire de connexion/inscription */}
        <form className="login-form" onSubmit={handleSubmit}>
          
          {/* Champ Email */}
          <div className="form-group">
            <label htmlFor="email">Email :</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre adresse email"
              required
            />
          </div>

          {/* Champ Mot de Passe */}
          <div className="form-group">
            <label htmlFor="password">Mot de passe :</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Votre mot de passe"
              required
            />
          </div>

          {/* Champ Confirmation du Mot de Passe (uniquement en mode inscription) */}
          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="confirm-password">Confirmez le mot de passe :</label>
              <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmez le mot de passe"
                required
              />
            </div>
          )}

          {/* Bouton de soumission */}
          <button className="submit-button" type="submit">
            {mode === 'login' ? 'Se connecter' : 'S\'inscrire'}
          </button>

          {/* Lien pour basculer entre connexion et inscription */}
          <p className="toggle-mode" onClick={toggleMode}>
            {mode === 'login'
              ? "Vous n'avez pas de compte ? S'inscrire"
              : 'Déjà inscrit ? Se connecter'}
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;