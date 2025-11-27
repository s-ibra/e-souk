import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './BoulangeriePublique.css';
import { FaShoppingCart, FaTrash, FaUser, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

// 🔑 CORRECTION N°1 : UTILISER LA BONNE URL API
// La route pour le public est '/api/products/public' dans votre backend.
// De plus, nous utilisons directement l'URL complète pour la requête.
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
const PUBLIC_PRODUCTS_URL = `${API_BASE_URL}/api/products/public`;


const BoulangeriePublique = () => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // Ajout d'un état de chargement
    const [error, setError] = useState(null); // Ajout d'un état d'erreur
    const navigate = useNavigate();

    // Fonction pour récupérer les produits publics depuis l'API
    const fetchProducts = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // 💡 Correction de l'URL pour accéder aux produits PUBLICS
            const response = await axios.get(PUBLIC_PRODUCTS_URL);
            
            // Filtrer ici les produits non publiés juste pour être sûr, même si la route backend le fait.
            const publishedProducts = response.data.filter(p => p.isPublished); 
            
            setProducts(publishedProducts);
        } catch (err) {
            console.error('Erreur lors du chargement des produits publics.', err);
            setError("Impossible de charger les produits. Veuillez vérifier la connexion au serveur.");
        } finally {
            setIsLoading(false);
        }
    };

    // Charger les produits au démarrage du composant
    useEffect(() => {
        fetchProducts();
    }, []);
    
    // Reste du code (fonctions inchangées)...
    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

    const removeFromCart = (productId) => {
        setCartItems((prevCart) =>
            prevCart.filter((item) => item._id !== productId)
        );
    };

    const calculateTotal = () => {
        return cartItems.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );
    };

    const handleLoginRedirect = () => {
        navigate('/login');
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    // =========================================================================
    //                            RENDU
    // =========================================================================

    if (isLoading) {
        return <div className="boulangerie-public-container">Chargement des produits...</div>;
    }

    if (error) {
        return <div className="boulangerie-public-container error-message">{error}</div>;
    }


    return (
        <div className="boulangerie-public-container">
            <h1>Notre Sélection de Produits </h1>

            {/* Barre supérieure avec les boutons */}
            <div className="top-bar">
                
                {/* GROUPE GAUCHE : Bouton Retour seul */}
                <div className="left-group">
                    <button
                        className="back-button"
                        onClick={handleGoBack}
                        aria-label="Retour à la page précédente"
                    >
                        <FaArrowLeft /> Retour
                    </button>
                </div>

                {/* 🎯 GROUPE DROIT : Se connecter et Panier */}
                <div className="right-group">
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
                            onClick={() => setIsCartOpen(!isCartOpen)} 
                            aria-label="Ouvrir/Fermer le panier"
                        >
                            <FaShoppingCart />
                            {cartItems.length > 0 && (
                                <span className="cart-item-count">
                                    {cartItems.reduce((total, item) => total + item.quantity, 0)}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Onglet du Panier latéral droit */}
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
                            // 🔑 CORRECTION N°2 : Utiliser l'URL Cloudinary complète déjà dans product.image
                            src={product.image} 
                            alt={product.name}
                            className="product-image-public"
                        />
                        <h3>{product.name}</h3>
                        <p>{product.description}</p>
                        <p><strong>Prix :</strong> {product.price} €</p>
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