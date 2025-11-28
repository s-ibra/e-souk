import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './BoulangeriePublique.css';
import { FaShoppingCart, FaTrash, FaUser, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

// URL de base de votre API Render. C'est l'URL où votre backend est déployé.
const API_BASE_URL = 'https://e-souk-backend.onrender.com/api'; 

const BoulangeriePublique = () => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const navigate = useNavigate();

    // Fonction pour récupérer les produits depuis l'API publique
    const fetchProducts = async () => {
        try {
            // Utilisation de l'URL de l'API Render et de la route publique
            const response = await axios.get(`${API_BASE_URL}/public/products`);
            setProducts(response.data);
        } catch (err) {
            console.error('Erreur lors du chargement des produits.', err);
        }
    };

    // Charger les produits au démarrage du composant
    useEffect(() => {
        fetchProducts();
    }, []);

    // Filtrer les produits
    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Fonction pour ajouter un produit au panier (Gère l'incrémentation)
    const addToCart = (productToAdd) => {
        setCartItems((prevCart) => {
            
            const existingItem = prevCart.find((item) => item._id === productToAdd._id);

            if (existingItem) {
                return prevCart.map((item) =>
                    item._id === productToAdd._id
                        ? { ...item, quantity: item.quantity + 1 } 
                        : item
                );
            } else {
                return [...prevCart, { ...productToAdd, quantity: 1 }];
            }
        });
    };

    // Fonction pour supprimer un produit du panier
    const removeFromCart = (productId) => {
        setCartItems((prevCart) =>
            prevCart.filter((item) => item._id !== productId)
        );
    };

    // Calculer le total du panier
    const calculateTotal = () => {
        return cartItems.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );
    };

    // Fonction pour rediriger vers la page de connexion/inscription
    const handleLoginRedirect = () => {
        navigate('/login');
    };

    // Fonction pour revenir à la page précédente
    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <div className="boulangerie-public-container">
            {/* Titre principal */}
            <h1>Notre Sélection de Produits</h1>

            {/* Barre supérieure avec les boutons */}
            <div className="top-bar">
                
                {/* GROUPE GAUCHE : Bouton Retour seul */}
                <div className="left-group">
                    {/* Bouton Retour */}
                    <button
                        className="back-button"
                        onClick={handleGoBack}
                        aria-label="Retour à la page précédente"
                    >
                        <FaArrowLeft /> Retour
                    </button>
                </div>

                {/* GROUPE DROIT : Se connecter et Panier */}
                <div className="right-group">
                    {/* Bouton de connexion/inscription (Compact) */}
                    <button
                        className="login-button"
                        onClick={handleLoginRedirect}
                        aria-label="Se connecter ou s'inscrire"
                    >
                        <FaUser />         
                    </button>
                    
                    {/* Conteneur pour l'icône du panier */}
                    <div className="cart-button-container">
                        <button
                            className={`cart-toggle-button ${isCartOpen ? 'open' : ''}`}
                            onClick={() => setIsCartOpen(!isCartOpen)} // Gère l'ouverture/fermeture du panneau
                            aria-label="Ouvrir/Fermer le panier"
                        >
                            <FaShoppingCart />
                            {/* Utilisation de reduce pour obtenir la quantité TOTALE pour le badge */}
                            {cartItems.length > 0 && (
                                <span className="cart-item-count">
                                    {cartItems.reduce((total, item) => total + item.quantity, 0)}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Onglet du Panier latéral droit (Contrôlé par isCartOpen) */}
            {isCartOpen && (
                <div className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}>
                    <div className="cart-header">
                        <h2>
                            <FaShoppingCart /> Mon Panier
                        </h2>
                        <button
                            className="close-cart-button"
                            onClick={() => setIsCartOpen(false)}
                            aria-label="Fermer le panier"
                        >
                            X
                        </button>
                    </div>
                    {cartItems.length > 0 ? (
                        <div className="cart-content">
                            <ul className="cart-items-list">
                                {cartItems.map((item) => (
                                    <li key={item._id} className="cart-item">
                                        <span>{item.name} ({item.quantity}x)</span>
                                        <span>{(item.price * item.quantity).toFixed(2)} €</span>
                                        <button
                                            onClick={() => removeFromCart(item._id)}
                                            className="remove-from-cart-button"
                                        >
                                            <FaTrash />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <div className="cart-total">
                                <strong>Total :</strong> {calculateTotal().toFixed(2)} €
                            </div>
                        </div>
                    ) : (
                        <p className="empty-cart">Votre panier est vide.</p>
                    )}
                </div>
            )}

            {/* Barre de recherche */}
            <div className="search-bar-container">
                <input
                    type="text"
                    placeholder="Rechercher un produit..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-bar"
                    aria-label="Rechercher un produit"
                />
            </div>

            {/* Liste des produits */}
            <div className="product-list-public">
                {filteredProducts.map((product) => (
                    <div key={product._id} className="product-card-public">
                        <img
                            // L'URL de l'image est l'URL Cloudinary complète
                            src={product.image}
                            alt={product.name}
                            className="product-image-public"
                        />
                        <h3>{product.name}</h3>
                        <p>{product.description}</p>
                        <p>
                            <strong>Prix :</strong> {product.price.toFixed(2)} € 
                        </p>
                        {/* Bouton "Ajouter au Panier" */}
                        <button
                            onClick={() => addToCart(product)}
                            className="add-to-cart-button"
                        >
                            <FaShoppingCart /> Ajouter au Panier
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BoulangeriePublique;