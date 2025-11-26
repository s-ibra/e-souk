import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// URL de base de votre API Render.
// ASSUREZ-VOUS QUE C'EST LA BONNE URL EN PRODUCTION
const API_BASE_URL = 'https://e-souk-backend.onrender.com/api'; 

// État initial d'un nouveau produit (pour le formulaire d'ajout)
const initialProductState = {
    name: '',
    description: '',
    price: '',
};

// =========================================================================
//                  MAIN COMPONENT: MA BOULANGERIE ADMIN
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

    // --- Vérification d'Authentification (Simulée avec le Token) ---
    useEffect(() => {
        if (token) {
            setIsAuthenticated(true);
            // Vérification simple que le token est au moins présent
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
        setTimeout(() => {
            setMessage('');
            setError('');
        }, 5000);
    };

    // --- GESTION DES REQUÊTES API (CRUD) ---

    // Récupérer la liste des produits
    const fetchProducts = useCallback(async () => {
        try {
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

    // Headers avec le Token d'authentification
    const getConfig = () => ({
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data', // Nécessaire pour l'envoi de fichiers
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

    // --- AJOUT DE PRODUIT (POST) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        setError('');
        
        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('price', parseFloat(formData.price));
        
        // La clé 'image' doit correspondre à `upload.single('image')` dans Express
        if (imageFile) {
            data.append('image', imageFile);
        } else if (!isEditing) {
            showMessage("L'image est requise pour l'ajout.", true);
            setIsSubmitting(false);
            return;
        }

        try {
            if (isEditing) {
                // Modification
                await axios.put(`${API_BASE_URL}/products/${editingProduct._id}`, data, getConfig());
                showMessage("Produit modifié avec succès !");
                setIsEditing(false);
                setEditingProduct(null);
            } else {
                // Ajout
                await axios.post(`${API_BASE_URL}/products`, data, getConfig());
                showMessage("Produit ajouté avec succès !");
            }
            
            setFormData(initialProductState);
            setImageFile(null);
            fetchProducts();
            
        } catch (err) {
            console.error("Erreur lors de l'ajout/modification:", err.response ? err.response.data : err.message);
            // ⚠️ Ceci est la clé pour afficher les erreurs 500 ou 400 du serveur Render/Cloudinary
            const errMsg = err.response && err.response.data && err.response.data.error 
                ? `Erreur: ${err.response.data.error}`
                : "Erreur inconnue lors de l'ajout. (Serveur/Token invalide)";

            showMessage(errMsg, true);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // --- ÉDITION DE PRODUIT (PUT) ---
    const startEditing = (product) => {
        setIsEditing(true);
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
        });
        setImageFile(null); // Réinitialiser le fichier
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Remonter au formulaire
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
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return;

        try {
            // L'opération de suppression doit AUSSI s'authentifier
            await axios.delete(`${API_BASE_URL}/products/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showMessage("Produit supprimé avec succès.");
            fetchProducts();
        } catch (err) {
             console.error("Erreur lors de la suppression:", err.response ? err.response.data : err.message);
             showMessage("Erreur lors de la suppression du produit.", true);
        }
    };

    // --- AUTHENTIFICATION (LOGIN) ---
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post(`${API_BASE_URL}/login`, { email, password });
            
            const newToken = response.data.token;
            setToken(newToken);
            localStorage.setItem('adminToken', newToken);
            setIsAuthenticated(true);
            showMessage("Connexion réussie !");
            
        } catch (err) {
            const errMsg = err.response && err.response.data && err.response.data.error 
                ? err.response.data.error
                : "Erreur de connexion (serveur injoignable)";
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
                    <h2>Connexion Administrateur</h2>
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
                <h1>Administration de Ma Boulangerie</h1>
                <button onClick={handleLogout} className="logout-button">
                    Déconnexion
                </button>
            </header>

            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}

            {/* --- SECTION FORMULAIRE D'ÉDITION --- */}
            {isEditing && (
                <div id="edit-form" className="edit-product-section">
                    <h2>Modifier le Produit: {editingProduct?.name}</h2>
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
                        
                        {/* Prévisualisation de l'image actuelle */}
                        {editingProduct.image && (
                            <>
                                <label>Image Actuelle:</label>
                                <img src={editingProduct.image} alt="Actuel" className="current-image-preview" />
                            </>
                        )}

                        <div className="form-group">
                            <label>Nouvelle Image (optionnel)</label>
                            <input type="file" name="image" onChange={handleFileChange} accept="image/*" />
                            {imageFile && <p className="image-selected">Fichier sélectionné : {imageFile.name}</p>}
                        </div>

                        <div className="edit-actions">
                            <button type="submit" className="submit-product-button" disabled={isSubmitting}>
                                {isSubmitting ? 'Mise à jour en cours...' : 'Sauvegarder les modifications'}
                            </button>
                            <button type="button" onClick={cancelEditing} className="cancel-button">
                                Annuler
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* --- SECTION FORMULAIRE D'AJOUT --- */}
            {!isEditing && (
                <div className="add-product-section">
                    <h2>Ajouter un nouveau produit</h2>
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
                            {imageFile && <p className="image-selected">Fichier sélectionné : {imageFile.name}</p>}
                        </div>

                        <button type="submit" className="submit-product-button" disabled={isSubmitting}>
                            {isSubmitting ? 'Ajout en cours...' : 'Ajouter le produit'}
                        </button>
                    </form>
                </div>
            )}

            <hr />

            {/* --- SECTION LISTE DES PRODUITS (Affichage Corrigé) --- */}
            <section className="product-list-section">
                <h2>Liste des Produits</h2>
                <div className="product-grid">
                    {products.length === 0 ? (
                        <p style={{textAlign: 'center', width: '100%', gridColumn: '1 / -1'}}>Aucun produit trouvé.</p>
                    ) : (
                        products.map((p) => (
                            <div key={p._id} className="product-card">
                                
                                {/* 🔑 STRUCTURE CLÉ pour images non tronquées (CSS: object-fit: contain) */}
                                <div className="product-image-container">
                                    <img 
                                        src={p.image} 
                                        alt={`Image de ${p.name}`} 
                                        // className="commerce-image" (si vous utilisiez une classe)
                                    />
                                </div>
                                {/* 🔑 FIN DE LA STRUCTURE CLÉ */}

                                <div className="product-info">
                                    <h3>{p.name}</h3>
                                    {/* Utilisation de || '' pour éviter les erreurs si la description est null */}
                                    <p className="description">{p.description || ''}</p> 
                                    {/* toLocaleString pour un meilleur affichage monétaire */}
                                    <p className="price">{p.price?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</p>
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