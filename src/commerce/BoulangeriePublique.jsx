import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// URL de base de votre API Render
const API_BASE_URL = 'https://e-souk-backend.onrender.com/api'; 

// =========================================================================
//              COMPOSANT PUBLIC (Stylisé avec Tailwind CSS - Thème Stone)
// =========================================================================

const BoulangeriePublique = () => {
    // État des produits - suppression de la dépendance aux catégories
    const [products, setProducts] = useState([
        // Données factices pour garantir un affichage en cas d'échec de l'API
        // Les images utilisent maintenant des couleurs plus claires et neutres (EBEBEB)
        { _id: '1', name: 'Pain de Campagne Artisanal', price: 4.50, description: 'Au levain naturel, cuisson lente sur pierre, pour une croûte croustillante.', image: 'https://placehold.co/600x400/EBEBEB/5A5655?text=Pain+Artisanal' },
        { _id: '2', name: 'Croissant Pur Beurre', price: 1.20, description: 'Feuilletage léger et saveur intense. Idéal pour le petit-déjeuner.', image: 'https://placehold.co/600x400/EBEBEB/5A5655?text=Croissant+Frais' },
    ]);
    
    // Suppression de l'état 'categories'
    
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
    // Suppression de l'état 'selectedCategory'
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isClearCartConfirmOpen, setIsClearCartConfirmOpen] = useState(false); 


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
    
    const fetchPublishedProducts = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/products/published`); 
            if (response.data && response.data.length > 0) {
                setProducts(response.data);
            }
        } catch (err) {
            console.error("Fetch published products error:", err);
            // On conserve les produits factices si l'API échoue
        }
    }, [showMessage]); 

    // Appel des fonctions de récupération 
    useEffect(() => {
        fetchPublishedProducts();
    }, [fetchPublishedProducts]);
    

    // --- Logique du Panier d'Achat ---

    const addToCart = (product) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item._id === product._id);
            if (existingItem) {
                return prevCart.map(item => 
                    item._id === product._id 
                        ? { ...item, quantity: item.quantity + 1 } 
                        : item
                );
            } else {
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
                    return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
                }
                return item;
            }).filter(Boolean); 

            return updatedCart;
        });
    };

    const removeFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item._id !== productId));
        showMessage("Produit retiré du panier.", false);
    };
    
    const confirmClearCart = () => {
        setIsClearCartConfirmOpen(true);
    };

    const clearCart = (confirmed) => {
        setIsClearCartConfirmOpen(false);
        if (confirmed) {
            setCart([]);
            showMessage("Panier vidé.");
        }
    };

    // --- LOGIQUE DE CONNEXION (Modification du chemin de redirection) ---
    const handleLoginClick = () => {
        showMessage("Redirection vers la page de gestion (Management)...", false);
        // Changement de '/login' à '/management' pour cibler la page d'administration
        // NOTE: Si cela ne fonctionne pas, vous devez ajuster ce chemin 
        // pour correspondre au routing exact de votre application principale.
        window.location.href = '/management'; 
    };
    // ----------------------------

    // --- Calculs du Panier ---

    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
    
    // --- Filtrage des produits (simplifié sans catégorie) ---
    const filteredProducts = products;


    // =========================================================================
    //              RENDU
    // =========================================================================

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 sm:p-6 md:p-8 font-sans">
            {/* Confirmation Modal */}
            {isClearCartConfirmOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full">
                        <h3 className="text-xl font-bold mb-4 text-red-600">Confirmer la suppression</h3>
                        <p className="mb-6 text-gray-700">Êtes-vous sûr de vouloir vider votre panier ? Cette action est irréversible.</p>
                        <div className="flex justify-end space-x-3">
                            <button 
                                onClick={() => clearCart(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition shadow-sm"
                            >
                                Annuler
                            </button>
                            <button 
                                onClick={() => clearCart(true)}
                                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition shadow-md"
                            >
                                Vider le panier
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* HEADER - Nouveau thème Stone/Terreux */}
            <header className="w-full max-w-6xl bg-white shadow-xl rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center mb-8 sticky top-0 z-40 border-b-4 border-stone-500/50">
                {/* Icône du pain retirée pour un look plus nude */}
                <h1 className="text-3xl font-extrabold text-stone-700 flex items-center mb-3 sm:mb-0">
                    La Boulangerie du Coin
                </h1>
                
                <div className="flex space-x-3">
                    {/* BOUTON DE CONNEXION (Style nude) */}
                    <button 
                        className="flex items-center space-x-2 px-4 py-2 bg-stone-200 text-stone-700 font-semibold rounded-full hover:bg-stone-300 transition shadow-md hover:shadow-lg text-sm" 
                        onClick={handleLoginClick}
                    >
                        {/* Icône Porte */}
                        <span className="text-lg">🚪</span> 
                        <span className="hidden sm:inline">Se connecter</span>
                    </button>

                    {/* Bouton pour ouvrir/fermer le panier (couleur d'accent) */}
                    <button 
                        className="flex items-center space-x-2 px-4 py-2 bg-stone-700 text-white font-semibold rounded-full hover:bg-stone-800 transition shadow-md hover:shadow-lg relative text-sm" 
                        onClick={() => setIsCartOpen(!isCartOpen)}
                    >
                        {/* Icône Panier */}
                        <span className="text-lg">🛒</span> 
                        <span>Panier</span>
                        {totalItems > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                                {totalItems}
                            </span>
                        )}
                    </button>
                </div>
            </header>

            {/* Messages */}
            {message && <div className="w-full max-w-6xl p-3 bg-green-100 text-green-700 rounded-lg mb-4 text-center font-medium transition-all duration-300">{message}</div>}
            {error && <div className="w-full max-w-6xl p-3 bg-red-100 text-red-700 rounded-lg mb-4 text-center font-medium transition-all duration-300">{error}</div>}

            {/* SECTION DES PRODUITS PUBLICS */}
            <div className="w-full max-w-6xl flex">

                {/* GRID DES PRODUITS PUBLICS */}
                <main className="flex-grow">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map(product => (
                                <div key={product._id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 overflow-hidden flex flex-col border-t-4 border-stone-500">
                                    <img 
                                        src={product.image} 
                                        alt={product.name} 
                                        className="h-48 w-full object-cover" 
                                        // Fallback utilisant la couleur de fond très claire (nude)
                                        onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/600x400/EBEBEB/5A5655?text=${product.name.substring(0, 1).toUpperCase()}`; }}
                                    />
                                    <div className="p-4 flex flex-col flex-grow">
                                        <h3 className="text-xl font-bold text-stone-800 mb-1">{product.name}</h3>
                                        <p className="text-sm text-gray-600 flex-grow mb-3 line-clamp-2">{product.description}</p>
                                        <p className="text-2xl font-extrabold text-red-600 mb-4">{product.price.toFixed(2)} €</p>
                                        {/* Bouton Ajouter au panier (Style nude/discret) */}
                                        <button 
                                            className="w-full py-2 bg-stone-100 text-stone-700 font-bold rounded-lg hover:bg-stone-200 transition shadow-sm flex items-center justify-center space-x-2 border border-stone-300" 
                                            onClick={() => addToCart(product)}
                                        >
                                            <span className="text-lg">🛒</span>
                                            <span>Ajouter au Panier</span>
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="col-span-full text-center text-gray-500 p-10 bg-white rounded-xl shadow-lg">
                                Aucun produit publié pour le moment.
                            </p>
                        )}
                    </div>
                </main>
                
                {/* PANIER D'ACHAT (Thème Stone) */}
                <aside className={`fixed top-0 right-0 h-full w-full sm:w-80 bg-white shadow-2xl z-50 transform transition-transform duration-500 ease-in-out ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="flex flex-col h-full">
                        <div className="p-4 border-b bg-stone-700 text-white flex justify-between items-center">
                            <h2 className="text-xl font-bold flex items-center">
                                <span className="mr-2 text-lg">🛒</span> Votre Panier
                            </h2>
                            <button onClick={() => setIsCartOpen(false)} className="text-xl hover:text-gray-200 transition">
                                ✖️
                            </button>
                        </div>

                        {cart.length === 0 ? (
                            <p className="p-4 text-gray-500 text-center flex-grow">Votre panier est vide.</p>
                        ) : (
                            <>
                                <ul className="flex-grow overflow-y-auto p-4 space-y-3">
                                    {cart.map(item => (
                                        <li key={item._id} className="bg-gray-50 p-3 rounded-lg shadow-sm border border-gray-200">
                                            <div className="flex justify-between items-start">
                                                <p className="font-semibold text-gray-800 text-sm line-clamp-1">{item.name}</p>
                                                <button 
                                                    onClick={() => removeFromCart(item._id)} 
                                                    className="text-red-500 hover:text-red-700 transition ml-2"
                                                >
                                                    <span className="text-xs">🗑️</span>
                                                </button>
                                            </div>
                                            <div className="flex justify-between items-center mt-2">
                                                <p className="text-xs text-gray-600">
                                                    {item.price.toFixed(2)} € x {item.quantity} = 
                                                    <span className="font-bold text-stone-700 ml-1"> {(item.price * item.quantity).toFixed(2)} €</span>
                                                </p>
                                                <div className="flex items-center space-x-1">
                                                    <button 
                                                        onClick={() => updateQuantity(item._id, -1)} 
                                                        className="h-6 w-6 text-center bg-stone-200 text-stone-700 rounded-full hover:bg-stone-300 transition text-sm font-bold"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-5 text-center text-sm font-medium">{item.quantity}</span>
                                                    <button 
                                                        onClick={() => updateQuantity(item._id, 1)} 
                                                        className="h-6 w-6 text-center bg-stone-200 text-stone-700 rounded-full hover:bg-stone-300 transition text-sm font-bold"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                
                                <div className="p-4 border-t bg-gray-50">
                                    <div className="flex justify-between items-center text-xl font-extrabold mb-4">
                                        <p className="text-gray-700">Total Général:</p>
                                        <p className="text-red-600">{totalPrice} €</p>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <button onClick={confirmClearCart} className="w-full py-2 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition shadow-sm">
                                            Vider le panier
                                        </button>
                                        {/* Bouton de paiement (Style nude/discret) */}
                                        <button 
                                            className="w-full py-3 bg-stone-100 text-stone-700 font-bold rounded-lg hover:bg-stone-200 transition shadow-lg flex items-center justify-center space-x-2 border border-stone-300" 
                                            onClick={() => showMessage("Fonctionnalité de paiement en attente d'intégration (Stripe/PayPal)...", false)}
                                        >
                                            <span className="text-lg">💲</span> Procéder au paiement
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </aside>
            </div>
            {/* Overlay pour fermer le panier en cliquant à l'extérieur */}
            {isCartOpen && <div className="fixed inset-0 bg-black bg-opacity-30 z-40" onClick={() => setIsCartOpen(false)}></div>}
        </div>
    );
};

export default BoulangeriePublique;