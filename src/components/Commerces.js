import React, { useState } from 'react';
import './Commerces.css'; 
import { useNavigate } from 'react-router-dom'; 
import image1 from '../assets/image1.jpg';
import image2 from '../assets/image2.jpg';
import image3 from '../assets/image3.jpg';
import image4 from '../assets/image4.jpg';
import pageImage from '../assets/page.jpg';
import logo from '../assets/logo_souk.jpg'; 
import { FaUser, FaArrowLeft } from 'react-icons/fa'; 

// Données des commerces - LIENS CORRIGÉS (inchangés)
const commercesData = [
  {
    id: 1,
    name: 'Ma Boulangerie',
    category: 'Boulangerie',
    description: 'Boulangerie artisanale avec des produits bio et faits maison.',
    image: image1,
    link: '/boulangerie-publique',
  },
  {
    id: 2,
    name: 'My Cake',
    category: 'Pâtisserie',
    description: 'Gâteau fait maison pour les occasions.',
    image: image2,
    link: '/cake-publique', 
  },
  {
    id: 3,
    name: 'Mes savons',
    category: 'Bien-être',
    description: 'Produits de bien-être et soins pour le corps 100% naturels.',
    image: image3,
    link: '/savons-publique', 
  },
  {
    id: 4,
    name: 'La périculture',
    category: 'Bébé',
    description: 'Produits pour bébé, adapté à votre bébé.',
    image: image4,
    link: '/periculture-publique', 
  },
];

const Commerces = () => {
  const navigate = useNavigate(); 
  const [searchTerm, setSearchTerm] = useState(''); 
  const [selectedCategory, setSelectedCategory] = useState(''); 

  const handleSearchChange = (event) => setSearchTerm(event.target.value);
  const handleCategoryChange = (event) => setSelectedCategory(event.target.value);

  // Filtrer les commerces
  const filteredCommerces = commercesData.filter((commerce) => {
    const matchName = commerce.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory ? commerce.category === selectedCategory : true;
    return matchName && matchCategory;
  });

  // Gestion du clic sur un commerce
  const handleClick = (link) => navigate(link); 

  // Redirection vers la page de connexion
  const handleLoginRedirect = () => {
    navigate('/login'); 
  };

  // Redirection vers l'accueil (Bouton Retour)
  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="commerces-container">
      
      <header className="commerces-header">
        {/* 🎯 NOUVEAU : La barre supérieure Flexbox pour les boutons */}
        <div className="top-bar">
          
          {/* GROUPE GAUCHE : Bouton Retour à l'accueil */}
          <div className="left-group">
            <button className="back-button" onClick={handleGoHome}>
              <FaArrowLeft /> Retour à l'accueil
            </button>
          </div>

          {/* GROUPE DROIT : Bouton Se connecter */}
          <div className="right-group">
            <button className="login-button" onClick={handleLoginRedirect}>
              <FaUser /> Se connecter
            </button>
          </div>
        </div> 

        {/* Conteneur pour le logo centré (Maintenant sous la top-bar) */}
        <div className="logo-container-centered">
          <img src={logo} alt="Logo e-souk" className="logo" onClick={() => navigate('/')} />
        </div>

        {/* Titre principal et filtres (Centrés en bas du header) */}
        <h1>Tous les commerces</h1>
        <p>Explorez nos commerces et trouvez des produits éthiques et made in France.</p>

        {/* Champ de recherche et Sélection de la catégorie - Affichez-les avec un conteneur pour le centrage si besoin */}
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <input
            type="text"
            placeholder="Rechercher un commerce..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />

          <select
            onChange={handleCategoryChange}
            value={selectedCategory}
            className="category-select"
          >
            <option value="">Toutes les catégories</option>
            <option value="Boulangerie">Boulangerie</option>
            <option value="Pâtisserie">Pâtisserie</option>
            <option value="Bien-être">Bien-être</option>
            <option value="Bébé">Bébé</option>
          </select>
        </div>

      </header>

      {/* Liste des commerces filtrés */}
      <div className="commerces-list">
        {filteredCommerces.map((commerce) => (
          <div key={commerce.id} className="commerce-card" onClick={() => handleClick(commerce.link)}>
            <img 
                src={commerce.image} 
                // 🔑 CORRECTION : Utiliser un alt descriptif pour éviter la redondance avec le <h2>
                alt={`Photo du commerce ${commerce.name}`} 
                className="commerce-image" 
            />
            <h2>{commerce.name}</h2>
            <p>{commerce.description}</p>
            <button className="view-button">Voir plus</button>
          </div>
        ))}
      </div>

      {/* Image en bas de page */}
      <div className="footer-image-container">
        <img src={pageImage} alt="Illustration de produits artisanaux" className="footer-image" />
      </div>
    </div>
  );
};

export default Commerces;