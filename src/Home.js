import React from 'react';
import './Home.css';
import { useNavigate } from 'react-router-dom'; // Import de useNavigate pour la navigation
import logo from './assets/logo_souk.jpg'; // Logo importé
import cover from './assets/accueil_souk.jpg'; // Couverture importée
import footerImage from './assets/footer_souk.jpg'; // Image de footer importée

const Home = () => {
  const navigate = useNavigate(); // Initialisation de useNavigate pour la navigation

  // Fonction pour rediriger vers la page des commerces
  const handleNavigateToCommerces = () => {
    navigate('/commerces');
  };

  return (
    <div className="home-container">
      {/* Logo et accueil */}
      <header className="home-header">
        <img
          src={logo}
          alt="e-souk logo"
          className="logo"
          onClick={handleNavigateToCommerces} // Redirige vers la page des commerces en cliquant sur le logo
        />
        <h1>Bienvenue sur e-souk</h1>
        <p>Le marché en ligne des entrepreneures.</p>
        <button className="home-button" onClick={handleNavigateToCommerces}>
          Explorer les souks
        </button>
      </header>

      {/* Image de couverture juste après le texte */}
      <div className="cover-page" style={{ backgroundImage: `url(${cover})` }}></div>

      {/* Section de fonctionnalités */}
      <section className="features-section">
        <div className="feature">
          <h2>Marketplace</h2>
          <p>Une plateforme pour soutenir les commerces et promouvoir les produits éthiques et made in France.</p>
        </div>
        <div className="feature">
          <h2>Facile et accessible</h2>
          <p>Des boutiques organisées pour un shopping en toute simplicité.</p>
        </div>
        <div className="feature">
          <h2>Soutenir les petits commerces</h2>
          <p>Chaque achat contribue à soutenir les entrepreneures et contribué au made in France.</p>
        </div>
      </section>

      {/* Couverture à la fin de la page, avant le footer */}
      <div className="cover-footer" style={{ backgroundImage: `url(${footerImage})` }}>
        <p className="footer-text">Rejoignez-nous !</p>
        {/* Texte de copyright */}
        <p className="copyright-text">&copy; 2024 e-souk. Tous droits réservés.</p>
      </div>
    </div>
  );
};

export default Home;
