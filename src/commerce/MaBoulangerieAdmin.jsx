import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './MaBoulangerieAdmin.css';

// URL de base de votre API Render.
const API_BASE_URL = 'https://e-souk-backend.onrender.com/api'; 

// État initial d'un nouveau produit
const initialProductState = {
    name: '',
    description: '',
    // Le prix est initialisé comme une chaîne vide
    price: '', 
};

// =========================================================================
//              MAIN COMPONENT: MA BOULANGERIE ADMIN
// =========================================================================

const MaBoulangerieAdmin = () => {
    // --- États de gestion ---
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // --- États des produits ---
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState(initialProductState);
    const [imageFile, setImageFile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- États des messages ---
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // --- Vérification d'Authentification ---
    useEffect(() => {
        if (token) {
            setIsAuthenticated(true);
        }
    }, [token]);

    // --- Fonctions de gestion des messages ---
    const showMessage = (msg, isError = false) => {
        if (isError) {
            setError(msg);
            setMessage('');
        } else {
            setMessage(msg);
            setError('');
        }
        // Nettoie les messages après 5 secondes
        setTimeout(() => {
            setMessage('');
            setError('');
        }, 5000); 
    };

    // --- GESTION DES REQUÊTES API (CRUD) ---

    // Récupérer la liste des produits (utilisé via useCallback)
    const fetchProducts = useCallback(async () => {
        try {
            // Pas besoin de token pour la lecture simple (GET /products)
            const response = await axios.get(`${API_BASE_URL}/products`); 
            setProducts(response.data);
        } catch (err) {
            showMessage("Erreur lors de la récupération des produits.", true);
            console.error("Fetch products error:", err);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            fetchProducts();
        }
    }, [isAuthenticated, fetchProducts]);

    // Headers avec le Token d'authentification (AJOUTÉ pour POST/PUT/DELETE)
    // NOTE IMPORTANTE: Lorsque vous utilisez 'multipart/form-data',
    // n'ajoutez PAS le 'Content-Type' dans les headers. Axios le gérera
    // automatiquement et correctement avec la frontière (boundary) si vous
    // lui passez l'objet FormData.
    const getConfig = () => ({
        headers: {
            Authorization: `Bearer ${token}`,
            // 'Content-Type': 'multipart/form-data', <--- RETIRÉ pour FormData
        },
    });

    // Gestion du changement de champs
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Gestion du fichier image
    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    // --- AJOUT ET MODIFICATION DE PRODUIT (POST/PUT) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        // Validation simple du prix
        const parsedPrice = parseFloat(formData.price);
        if (isNaN(parsedPrice) || parsedPrice <= 0) {
            showMessage("Veuillez entrer un prix valide (nombre positif).", true);
            return;
        }

        setIsSubmitting(true);
        setError('');
        
        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('price', parsedPrice); // Utilisez le prix parsé
        
        // Logique de validation de l'image
        if (imageFile) {
            data.append('image', imageFile);
        } else if (!isEditing) {
            // L'image est REQUISE pour l'AJOUT
            showMessage("L'image est requise pour l'ajout d'un nouveau produit.", true);
            setIsSubmitting(false);
            return;
        }
        // Si isEditing est vrai et imageFile est null, cela signifie que
        // l'utilisateur ne change pas l'image. Le backend devrait gérer 
        // la conservation de l'URL existante.

        try {
            if (isEditing) {
                // Modification (PUT)
                const config = getConfig();
                // IMPORTANT: Lors d'un PUT avec FormData, le backend doit être 
                // configuré pour gérer l'absence d'un nouveau fichier image 
                // et conserver l'ancienne URL (editingProduct.image).
                await axios.put(`${API_BASE_URL}/products/${editingProduct._id}`, data, config);
                showMessage("Produit modifié avec succès !");
                setIsEditing(false);
                setEditingProduct(null);
            } else {
                // Ajout (POST)
                await axios.post(`${API_BASE_URL}/products`, data, getConfig());
                showMessage("Produit ajouté avec succès !");
            }
            
            // Réinitialisation après succès
            setFormData(initialProductState);
            setImageFile(null);
            fetchProducts();
            
        } catch (err) {
            console.error("Erreur lors de l'ajout/modification:", err.response ? err.response.data : err.message);
            const errMsg = err.response && err.response.data && err.response.data.error 
                ? `Erreur: ${err.response.data.error}`
                : "Erreur inconnue lors de l'opération. (Vérifiez le prix, le format ou le Token)";

            showMessage(errMsg, true);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // --- DÉMARRER ÉDITION ---
    const startEditing = (product) => {
        setIsEditing(true);
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            // Convertir le prix en chaîne pour le champ input
            price: product.price.toString(), 
        });
        setImageFile(null); 
        // Défile vers le formulaire d'édition
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
    };

    const cancelEditing = () => {
        setIsEditing(false);
        setEditingProduct(null);
        setFormData(initialProductState);
        setImageFile(null);
        setError('');
    };

    // --- SUPPRESSION DE PRODUIT (DELETE) ---
    const handleDelete = async (id) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.")) return;

        try {
            await axios.delete(`${API_BASE_URL}/products/${id}`, getConfig());
            showMessage("Produit supprimé avec succès.");
            fetchProducts();
        } catch (err) {
             console.error("Erreur lors de la suppression:", err.response ? err.response.data : err.message);
             showMessage("Erreur lors de la suppression du produit. (Vérifiez le Token)", true);
        }
    };

    // --- AUTHENTIFICATION (LOGIN) ---
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            // L'API de login ne prend pas de 'multipart/form-data',
            // donc on laisse Axios gérer le 'application/json' par défaut.
            const response = await axios.post(`${API_BASE_URL}/login`, { email, password });
            
            const newToken = response.data.token;
            setToken(newToken);
            localStorage.setItem('adminToken', newToken);
            setIsAuthenticated(true);
            showMessage("Connexion réussie !");
            
        } catch (err) {
            const errMsg = err.response && err.response.data && err.response.data.error 
                ? err.response.data.error
                : "Erreur de connexion (Email ou mot de passe incorrect/Serveur injoignable)";
            showMessage(errMsg, true);
        }
    };

    // --- DÉCONNEXION (LOGOUT) ---
    const handleLogout = () => {
        setToken('');
        localStorage.removeItem('adminToken');
        setIsAuthenticated(false);
        setProducts([]);
        showMessage("Déconnexion réussie.");
    };

    // =========================================================================
    //                            RENDU DU COMPOSANT
    // =========================================================================

    if (!isAuthenticated) {
        // --- RENDU : FORMULAIRE DE CONNEXION ---
        return (
            <div className="admin-container">
                <div className="login-section">
                    <h2>🥐 Connexion Administrateur</h2>
                    {error && <div className="error-message">{error}</div>}
                    <form onSubmit={handleLogin} className="login-form">
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="text"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Mot de passe</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="submit-product-button">
                            Se Connecter
                        </button>
                    </form>
                </div>
            </div>
        );
    }


    // --- RENDU : VUE D'ADMINISTRATION PRINCIPALE ---
    return (
        <div className="admin-container">
            <header className="admin-header">
                <h1>🥖 Administration de Ma Boulangerie</h1>
                <button onClick={handleLogout} className="logout-button">
                    Déconnexion
                </button>
            </header>

            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}

            {/* --- SECTION FORMULAIRE D'ÉDITION --- */}
            {isEditing && (
                <div id="edit-form" className="edit-product-section">
                    <h2>✍️ Modifier le Produit: {editingProduct?.name}</h2>
                    <form onSubmit={handleSubmit} className="product-form">
                        <div className="form-group">
                            <label>Nom</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Prix (€)</label>
                            {/* NOTE: Le type est 'text' pour mieux gérer l'affichage de la valeur flottante, mais la validation est faite dans handleSubmit */}
                            <input type="number" name="price" value={formData.price} onChange={handleChange} step="0.01" required /> 
                        </div>
                        
                        {/* Prévisualisation de l'image actuelle */}
                        {editingProduct.image && (
                            <div className="form-group image-preview-group">
                                <label>Image Actuelle:</label>
                                <img src={editingProduct.image} alt={`Produit actuel ${editingProduct.name}`} className="current-image-preview" />
                            </div>
                        )}

                        <div className="form-group">
                            <label>Nouvelle Image (optionnel)</label>
                            <input type="file" name="image" onChange={handleFileChange} accept="image/*" />
                            {imageFile && <p className="image-selected">Fichier sélectionné : **{imageFile.name}**</p>}
                        </div>

                        <div className="edit-actions">
                            <button type="submit" className="submit-product-button" disabled={isSubmitting}>
                                {isSubmitting ? 'Mise à jour en cours...' : 'Sauvegarder les modifications'}
                            </button>
                            <button type="button" onClick={cancelEditing} className="cancel-button" disabled={isSubmitting}>
                                Annuler
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* --- SECTION FORMULAIRE D'AJOUT --- */}
            {!isEditing && (
                <div className="add-product-section">
                    <h2>✨ Ajouter un nouveau produit</h2>
                    <form onSubmit={handleSubmit} className="product-form">
                        <div className="form-group">
                            <label>Nom</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Prix (€)</label>
                            <input type="number" name="price" value={formData.price} onChange={handleChange} step="0.01" required />
                        </div>
                        <div className="form-group">
                            <label>Image du produit</label>
                            <input type="file" name="image" onChange={handleFileChange} accept="image/*" required />
                            {imageFile && <p className="image-selected">Fichier sélectionné : **{imageFile.name}**</p>}
                        </div>

                        <button type="submit" className="submit-product-button" disabled={isSubmitting}>
                            {isSubmitting ? 'Ajout en cours...' : 'Ajouter le produit'}
                        </button>
                    </form>
                </div>
            )}

            <hr />

            {/* --- SECTION LISTE DES PRODUITS --- */}
            <section className="product-list-section">
                <h2>Liste des Produits ({products.length})</h2>
                <div className="product-grid">
                    {products.length === 0 ? (
                        <p style={{textAlign: 'center', width: '100%', gridColumn: '1 / -1'}}>Aucun produit trouvé. Veuillez en ajouter un !</p>
                    ) : (
                        products.map((p) => (
                            <div key={p._id} className="product-card">
                                
                                <div className="product-image-container">
                                    <img 
                                        src={p.image} 
                                        alt={`Produit ${p.name}`} 
                                    />
                                </div>
                                
                                <div className="product-info">
                                    <h3>{p.name}</h3>
                                    <p className="description">{p.description || 'Description non fournie.'}</p> 
                                    <p className="price">
                                        **{p.price?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}**
                                    </p>
                                </div>
                                
                                <div className="actions">
                                    <button 
                                        className="edit-button" 
                                        onClick={() => startEditing(p)}
                                    >
                                        Éditer
                                    </button>
                                    <button 
                                        className="delete-button" 
                                        onClick={() => handleDelete(p._id)}
                                    >
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
};

export default MaBoulangerieAdmin;