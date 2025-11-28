import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './BoulangeriePublique.css';
import { FaShoppingCart, FaTrashAlt, FaBreadSlice, FaDollarSign, FaTimes } from 'react-icons/fa';

// URL de base de votre API Render
const API_BASE_URL = 'https://e-souk-backend.onrender.com/api'; 

// =========================================================================
//              COMPOSANT PUBLIC
// =========================================================================

const BoulangeriePublique = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    // État du panier : Lit le panier depuis localStorage à l'initialisation
    const [cart, setCart] = useState(() => {
        try {
            const storedCart = localStorage.getItem('cart');
            return storedCart ? JSON.parse(storedCart) : [];
        } catch (e) {
            console.error("Erreur de lecture du panier dans localStorage:", e);
            return [];
        }
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [isCartOpen, setIsCartOpen] = useState(false);

    // --- Synchronisation du panier avec localStorage ---
    useEffect(() => {
        try {
            localStorage.setItem('cart', JSON.stringify(cart));
        } catch (e) {
            console.error("Erreur d'écriture du panier dans localStorage:", e);
        }
    }, [cart]);


    // --- Fonctions de gestion des messages ---
    const showMessage = useCallback((msg, isError = false) => {
        if (isError) {
            setError(msg);
            setMessage('');
        } else {
            setMessage(msg);
            setError('');
        }
        setTimeout(() => {
            setMessage('');
            setError('');
        }, 3000); 
    }, []); 
    
    // --- Récupération des données ---

    const fetchCategories = useCallback(async () => {
        try {
            // Pas besoin de token pour les catégories publiques
            const response = await axios.get(`${API_BASE_URL}/categories`); 
            setCategories(response.data);
        } catch (err) {
            console.error("Fetch categories error:", err);
            // On n'affiche pas d'erreur critique pour le public si les catégories manquent
        }
    }, []); 

    const fetchPublishedProducts = useCallback(async () => {
        try {
            // Endpoint pour obtenir les produits PUBLIÉS
            const response = await axios.get(`${API_BASE_URL}/products/published`); 
            setProducts(response.data);
        } catch (err) {
            console.error("Fetch published products error:", err);
            showMessage("Erreur lors de la récupération du catalogue.", true);
        }
    }, [showMessage]); 

    useEffect(() => {
        fetchPublishedProducts();
        fetchCategories();
    }, [fetchPublishedProducts, fetchCategories]);
    

    // --- Logique du Panier d'Achat ---

    const addToCart = (product) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item._id === product._id);
            if (existingItem) {
                // Si le produit existe, augmente la quantité
                return prevCart.map(item => 
                    item._id === product._id 
                        ? { ...item, quantity: item.quantity + 1 } 
                        : item
                );
            } else {
                // Sinon, ajoute le nouveau produit
                return [...prevCart, { ...product, quantity: 1 }];
            }
        });
        showMessage(`${product.name} ajouté au panier !`);
    };

    const updateQuantity = (productId, delta) => {
        setCart(prevCart => {
            const updatedCart = prevCart.map(item => {
                if (item._id === productId) {
                    const newQuantity = item.quantity + delta;
                    // Assure que la quantité ne descend pas en dessous de 1
                    return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
                }
                return item;
            }).filter(Boolean); // Filtre les éléments null (quantité à 0 ou moins)

            return updatedCart;
        });
    };

    const removeFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item._id !== productId));
        showMessage("Produit retiré du panier.", false);
    };
    
    const clearCart = () => {
        if (window.confirm("Êtes-vous sûr de vouloir vider votre panier ?")) {
            setCart([]);
            showMessage("Panier vidé.");
        }
    };

    // --- Calculs du Panier ---

    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
    
    // --- Filtrage des produits ---
    
    const filteredProducts = products
        .filter(product => {
            // Applique le filtre de catégorie si une catégorie est sélectionnée
            return selectedCategory ? product.category === selectedCategory : true;
        })
        .map(product => {
            // Attache le nom de la catégorie pour l'affichage
            const categoryObj = categories.find(c => c._id === product.category);
            return {
                ...product,
                categoryName: categoryObj ? categoryObj.name : 'Non classé',
            };
        });


    // =========================================================================
    //              RENDU
    // =========================================================================

    return (
        <div className="boulangerie-container">
            <header className="boulangerie-header">
                <h1><FaBreadSlice /> La Boulangerie du Coin</h1>
                
                {/* Bouton pour ouvrir/fermer le panier */}
                <button className="cart-toggle-button" onClick={() => setIsCartOpen(!isCartOpen)}>
                    <FaShoppingCart /> Panier ({totalItems})
                </button>
            </header>

            {message && <div className="public-success-message">{message}</div>}
            {error && <div className="public-error-message">{error}</div>}

            {/* SECTION FILTRE DE CATÉGORIE */}
            <div className="category-filter-section">
                <label htmlFor="category-select">Filtrer par Catégorie:</label>
                <select 
                    id="category-select"
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    <option value="">Toutes les catégories</option>
                    {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                </select>
            </div>
            
            {/* PANIER D'ACHAT (Affichage conditionnel) */}
            <div className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}>
                <div className="cart-header">
                    <h2><FaShoppingCart /> Votre Panier</h2>
                    <button onClick={() => setIsCartOpen(false)} className="close-cart-button">
                        <FaTimes />
                    </button>
                </div>

                {cart.length === 0 ? (
                    <p className="empty-cart-message">Votre panier est vide.</p>
                ) : (
                    <>
                        <ul className="cart-list">
                            {cart.map(item => (
                                <li key={item._id} className="cart-item">
                                    <div className="item-details">
                                        <p className="item-name">{item.name}</p>
                                        <p className="item-price-qty">
                                            {item.price.toFixed(2)} € x {item.quantity} = 
                                            <span className="item-subtotal"> {(item.price * item.quantity).toFixed(2)} €</span>
                                        </p>
                                    </div>
                                    <div className="item-actions">
                                        <button 
                                            onClick={() => updateQuantity(item._id, -1)} 
                                            className="quantity-button decrease"
                                        >
                                            -
                                        </button>
                                        <span className="item-quantity-display">{item.quantity}</span>
                                        <button 
                                            onClick={() => updateQuantity(item._id, 1)} 
                                            className="quantity-button increase"
                                        >
                                            +
                                        </button>
                                        <button 
                                            onClick={() => removeFromCart(item._id)} 
                                            className="remove-button"
                                        >
                                            <FaTrashAlt />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        
                        <div className="cart-summary">
                            <p className="cart-total-label">Total Général:</p>
                            <p className="cart-total-amount">{totalPrice} €</p>
                        </div>
                        
                        <div className="cart-footer-actions">
                            <button onClick={clearCart} className="clear-cart-button">
                                Vider le panier
                            </button>
                            {/* NOTE: Le bouton de paiement doit être implémenté ici pour l'intégration Stripe/PayPal... */}
                            <button className="checkout-button" onClick={() => showMessage("Fonctionnalité de paiement en attente d'intégration (Stripe/PayPal)...", false)}>
                                <FaDollarSign /> Procéder au paiement
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* GRID DES PRODUITS PUBLICS */}
            <div className="product-grid">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map(product => (
                        <div key={product._id} className="product-card">
                            <img src={product.image} alt={product.name} className="product-image" />
                            <div className="product-info">
                                <h3 className="product-name">{product.name}</h3>
                                <p className="product-category">**Catégorie:** {product.categoryName}</p>
                                <p className="product-description">{product.description}</p>
                                <p className="product-price">**{product.price.toFixed(2)} €**</p>
                            </div>
                            <button 
                                className="add-to-cart-button" 
                                onClick={() => addToCart(product)}
                            >
                                Ajouter au Panier
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="no-products-message">Aucun produit publié dans cette catégorie pour le moment.</p>
                )}
            </div>
        </div>
    );
};

export default BoulangeriePublique;