import React, { useState } from 'react';
// NOTE : Les imports de fichiers CSS locaux (./Commerces.css) et d'images locales 
// sont supprimés car non pris en charge dans un composant unique et autonome.
// Le style est répliqué en utilisant Tailwind CSS.
import { ArrowLeft, Package, Store, Heart, Smile, Leaf } from 'lucide-react'; 

// --- Simulation des assets locaux avec des placeholders et logos simples ---
// Les chemins d'images locaux sont remplacés par des URL de placeholders.
// Utilisation de couleurs neutres (Stone) pour les placeholders pour s'harmoniser avec le thème.
const IMAGE_PLACEHOLDER_BASE = 'https://placehold.co/600x400/EDEAE9/78716C?text='; // Couleur Stone 100/700
const LOGO_SOUK = 'https://placehold.co/100x40/78716C/EDEAE9?text=e-souk'; // Couleur Stone 700
const PAGE_IMAGE_FOOTER = 'https://placehold.co/1000x200/C7C5C4/3D3C3C?text=Illustration+Artisanale'; // Couleur Stone 300

// Données des commerces - Les liens d'images locaux sont remplacés
const commercesData = [
  {
    id: 1,
    name: 'Ma Boulangerie',
    category: 'Boulangerie',
    description: 'Boulangerie artisanale avec des produits bio et faits maison.',
    image: IMAGE_PLACEHOLDER_BASE + 'Ma+Boulangerie',
    link: '/boulangerie-publique', 
    icon: <Package className="w-5 h-5" />
  },
  {
    id: 2,
    name: 'My Cake',
    category: 'Pâtisserie',
    description: 'Gâteau fait maison pour les occasions.',
    image: IMAGE_PLACEHOLDER_BASE + 'My+Cake',
    link: '/cake-publique', 
    icon: <Smile className="w-5 h-5" />
  },
  {
    id: 3,
    name: 'Mes savons',
    category: 'Bien-être',
    description: 'Produits de bien-être et soins pour le corps 100% naturels.',
    image: IMAGE_PLACEHOLDER_BASE + 'Mes+Savons',
    link: '/savons-publique', 
    icon: <Heart className="w-5 h-5" />
  },
  {
    id: 4,
    name: 'La périculture',
    category: 'Bébé',
    description: 'Produits pour bébé, adapté à votre bébé.',
    image: IMAGE_PLACEHOLDER_BASE + 'Periculture',
    link: '/periculture-publique', 
    icon: <Leaf className="w-5 h-5" />
  },
];

// Simulation de useNavigate pour gérer la navigation sans react-router-dom
const useSimulatedNavigate = () => (path) => {
    console.log(`Navigation simulée vers: ${path}`);
    if (path === '/') {
        window.location.href = '/'; 
    } else {
        window.location.hash = path;
    }
};

const Commerces = () => {
  // Utilisation de useNavigate si disponible, sinon la version simulée
  // NOTE: Dans cet environnement, la simulation est souvent nécessaire.
  const navigate = useSimulatedNavigate(); 
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

  // Redirection vers l'accueil (Bouton Retour)
  const handleGoHome = () => {
    navigate('/');
  };

  // NOUVEAU SCHÉMA DE COULEUR : Stone (Neutre/Nude) & Brown (Marronné/Accents Chaleureux)
  const neutralColor = 'stone';
  const accentColor = 'brown'; // Beige Marronné

  return (
    // Utilisation de la police 'serif' pour une typographie plus élégante.
    <div className={`min-h-screen bg-${neutralColor}-50 p-4 sm:p-8 font-serif`}>
      
      {/* HEADER - Équivalent de .commerces-header */}
      <header className={`w-full max-w-4xl mx-auto mb-8 bg-white p-6 rounded-xl shadow-xl border-t-8 border-${accentColor}-400`}>
        
        {/* Top Bar - Flex pour justifier l'espace */}
        <div className="relative flex justify-between items-center mb-6 h-10">
          
          {/* Left Group / Back Button */}
          <div className="flex items-center">
            <button 
              // Équivalent de .back-button
              className={`flex items-center text-${accentColor}-700 hover:text-${accentColor}-600 transition duration-150 font-medium py-1 px-3 rounded-lg bg-${neutralColor}-100/50`} 
              onClick={handleGoHome}
            >
              <ArrowLeft className="mr-2 w-4 h-4" /> Retour à l'accueil
            </button>
          </div>

          {/* Logo container - Centered */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <img 
              src={LOGO_SOUK} 
              alt="Logo e-souk" 
              // Équivalent de .logo
              className="h-10 w-auto cursor-pointer rounded-md shadow-md" 
              onClick={() => navigate('/')} 
            />
          </div>

        </div> 
        
        {/* Titles */}
        <div className="text-center mt-6">
            <h1 className="text-4xl font-extrabold text-${neutralColor}-900 mb-2">Tous les commerces</h1>
            <p className="text-${neutralColor}-600 mb-6">Explorez nos commerces et trouvez des produits éthiques et made in France.</p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <input
            type="text"
            placeholder="Rechercher un commerce..."
            value={searchTerm}
            onChange={handleSearchChange}
            // Équivalent de .search-input (style moderne)
            className={`w-full sm:w-80 px-4 py-2 border border-${neutralColor}-300 rounded-lg shadow-inner focus:ring-${accentColor}-500 focus:border-${accentColor}-500 transition duration-150`}
          />

          <select
            onChange={handleCategoryChange}
            value={selectedCategory}
            // Équivalent de .category-select (style moderne)
            className={`w-full sm:w-48 px-4 py-2 border border-${neutralColor}-300 rounded-lg shadow-inner focus:ring-${accentColor}-500 focus:border-${accentColor}-500 bg-white transition duration-150`}
          >
            <option value="">Toutes les catégories</option>
            <option value="Boulangerie">Boulangerie</option>
            <option value="Pâtisserie">Pâtisserie</option>
            <option value="Bien-être">Bien-être</option>
            <option value="Bébé">Bébé</option>
          </select>
        </div>

      </header>

      {/* Liste des commerces filtrés - Équivalent de .commerces-list */}
      <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCommerces.length > 0 ? (
            filteredCommerces.map((commerce) => (
            <div 
                key={commerce.id} 
                // Équivalent de .commerce-card
                className={`bg-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300 cursor-pointer overflow-hidden border-t-4 border-${accentColor}-400`} 
                onClick={() => handleClick(commerce.link)}
            >
                <img 
                src={commerce.image} 
                alt={`Le commerce ${commerce.name}`} 
                // Équivalent de .commerce-image
                className="w-full h-56 object-cover" 
                />
                <div className="p-5">
                    <div className={`flex items-center text-sm font-semibold text-${accentColor}-600 mb-2`}>
                        {commerce.icon}
                        <span className="ml-2 uppercase tracking-wider">{commerce.category}</span>
                    </div>
                    <h2 className={`text-2xl font-bold text-${neutralColor}-900 mb-2`}>{commerce.name}</h2>
                    <p className={`text-${neutralColor}-600 mb-4 line-clamp-2`}>{commerce.description}</p>
                    {/* Équivalent de .view-button */}
                    <button className={`w-full py-2 bg-${accentColor}-600 text-white font-semibold rounded-lg hover:bg-${accentColor}-700 transition duration-150 shadow-md`}>
                        Voir plus
                    </button>
                </div>
            </div>
            ))
        ) : (
            <div className={`col-span-1 md:col-span-2 text-center p-10 bg-white rounded-xl shadow-lg text-${neutralColor}-500`}>
                Aucun commerce trouvé correspondant à vos critères de recherche.
            </div>
        )}
      </div>
      
      {/* Image en bas de page - Équivalent de .footer-image-container */}
      <div className="w-full max-w-4xl mx-auto mt-10 rounded-xl shadow-xl overflow-hidden">
        {/* Utilisation du placeholder pour l'image de pied de page */}
        <img 
            src={PAGE_IMAGE_FOOTER} 
            alt="Illustration de produits artisanaux" 
            className="w-full h-40 object-cover" 
        />
      </div>
    </div>
  );
};

export default Commerces;