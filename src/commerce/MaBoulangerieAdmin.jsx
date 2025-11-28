import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './MaBoulangerieAdmin.css';
import { FaSignOutAlt, FaPlus, FaTags } from 'react-icons/fa'; // Ajout d'icônes

// URL de base de votre API Render.
const API_BASE_URL = 'https://e-souk-backend.onrender.com/api'; 

// État initial d'un nouveau produit
const initialProductState = {
    name: '',
    description: '',
    price: '', 
    category: '', 
};

// =========================================================================
//              MAIN COMPONENT: MA BOULANGERIE ADMIN
// =========================================================================

// Le composant reçoit handleLogout du parent (App.js via RequireAuth)
const MaBoulangerieAdmin = ({ handleLogout }) => {
    
    // Le token est lu directement depuis localStorage, car le composant 
    // n'est affiché que si RequireAuth a trouvé un token valide.
    const token = localStorage.getItem('authToken'); 
    
    // --- États des produits et catégories ---
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]); 
    const [formData, setFormData] = useState(initialProductState);
    const [imageFile, setImageFile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // États de gestion de catégorie
    const [newCategoryName, setNewCategoryName] = useState(''); 
    const [isCategorySubmitting, setIsCategorySubmitting] = useState(false); 

    // --- États des messages ---
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');


    // 🛑 LOGIQUE DE CONNEXION SUPPRIMÉE : Le parent (RequireAuth) gère l'accès.
    // 🛑 États email et password SUPPRIMÉS.

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
        }, 5000); 
    }, []); 

    // --- Headers avec le Token d'authentification (doit être dynamique) ---
    const getConfig = useCallback(() => {
        const currentToken = localStorage.getItem('authToken');
        return {
            headers: {
                Authorization: `Bearer ${currentToken}`,
            },
        };
    }, []); 

    // --- Récupération des Catégories ---
    const fetchCategories = useCallback(async () => {
        // Sécurité : si le token est manquant (devrait pas arriver grâce à RequireAuth)
        if (!token) return; 

        try {
            const response = await axios.get(`${API_BASE_URL}/categories`, getConfig());
            setCategories(response.data);
        } catch (err) {
            showMessage("Erreur lors de la récupération des catégories.", true);
            console.error("Fetch categories error:", err);
        }
    }, [showMessage, getConfig, token]); 


    // --- Récupérer la liste des produits pour l'ADMIN ---
    const fetchProducts = useCallback(async () => {
        if (!token) return;

        try {
            const response = await axios.get(`${API_BASE_URL}/products`, getConfig()); 
            setProducts(response.data);
        } catch (err) {
             // Si le token est invalide, déconnecte l'utilisateur
            if (err.response && err.response.status === 401) {
                showMessage("Session expirée. Veuillez vous reconnecter.", true);
                handleLogout();
            } else {
                showMessage("Erreur lors de la récupération des produits.", true);
            }
            console.error("Fetch products error:", err);
        }
    }, [token, showMessage, getConfig, handleLogout]); 


    // --- Hook d'initialisation et de rafraîchissement ---
    useEffect(() => {
        // Les appels se font dès que le composant est monté (grâce à RequireAuth)
        fetchProducts();
        fetchCategories(); 
    }, [fetchProducts, fetchCategories]); 


    // --- GESTION DES REQUÊTES API (CRUD) ---

    // Gestion du changement de champs
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Gestion du fichier image
    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    // --- Gestion de Catégorie (POST/DELETE) ---
    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        if (isCategorySubmitting || !newCategoryName.trim()) return;

        setIsCategorySubmitting(true);
        setError('');

        try {
            await axios.post(`${API_BASE_URL}/categories`, { name: newCategoryName.trim() }, getConfig());
            showMessage("Catégorie ajoutée avec succès !");
            setNewCategoryName('');
            fetchCategories();
        } catch (err) {
            console.error("Erreur lors de l'ajout de catégorie:", err.response ? err.response.data : err.message);
            showMessage("Erreur lors de l'ajout de catégorie.", true);
        } finally {
            setIsCategorySubmitting(false);
        }
    };

    const handleCategoryDelete = async (categoryId) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ? Cette action est irréversible. Tous les produits liés devront être mis à jour manuellement.")) return;

        try {
            await axios.delete(`${API_BASE_URL}/categories/${categoryId}`, getConfig());
            showMessage("Catégorie supprimée avec succès.");
            fetchCategories();
            fetchProducts(); // Rafraîchir les produits au cas où leur catégorie soit maintenant "Non classé"
        } catch (err) {
            console.error("Erreur lors de la suppression de catégorie:", err.response ? err.response.data : err.message);
            showMessage("Erreur lors de la suppression de catégorie. (Vérifiez qu'aucun produit n'y est lié)", true);
        }
    };
    

    // --- AJOUT ET MODIFICATION DE PRODUIT (POST/PUT) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        const parsedPrice = parseFloat(formData.price);
        if (isNaN(parsedPrice) || parsedPrice <= 0) {
            showMessage("Veuillez entrer un prix valide (nombre positif).", true);
            return;
        }
        if (!formData.category) {
            showMessage("Veuillez sélectionner une catégorie.", true);
            return;
        }

        setIsSubmitting(true);
        setError('');
        
        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('price', parsedPrice); 
        data.append('category', formData.category); 
        
        if (imageFile) {
            data.append('image', imageFile);
        } else if (!isEditing) {
            showMessage("L'image est requise pour l'ajout d'un nouveau produit.", true);
            setIsSubmitting(false);
            return;
        }

        try {
            if (isEditing) {
                // Pour la modification, ajoute l'ID du produit
                await axios.put(`${API_BASE_URL}/products/${editingProduct._id}`, data, getConfig());
                showMessage("Produit modifié avec succès !");
                setIsEditing(false);
                setEditingProduct(null);
            } else {
                await axios.post(`${API_BASE_URL}/products`, data, getConfig());
                showMessage("Produit ajouté avec succès !");
            }
            
            setFormData(initialProductState);
            setImageFile(null);
            fetchProducts();
            
        } catch (err) {
            console.error("Erreur lors de l'ajout/modification:", err.response ? err.response.data : err.message);
            const errMsg = err.response && err.response.data && err.response.data.error 
                ? `Erreur: ${err.response.data.error}`
                : "Erreur inconnue lors de l'opération. (Vérifiez le prix ou le Token)";

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
            price: product.price.toString(), 
            category: product.category || '', 
        });
        setImageFile(null); 
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
             showMessage("Erreur lors de la suppression du produit.", true);
        }
    };

    // 🔑 PUBLICATION/DÉPUBLICATION (PUT)
    const handleTogglePublish = async (product) => {
        const action = product.isPublished ? 'dépublier' : 'publier';
        if (!window.confirm(`Êtes-vous sûr de vouloir ${action} ce produit ?`)) return;

        try {
            // Pour l'action de publication, on envoie uniquement les données nécessaires
            await axios.put(
                `${API_BASE_URL}/products/${product._id}`, 
                { 
                    isPublished: !product.isPublished,
                    // Note: Il est plus sûr de n'envoyer que l'état 'isPublished', 
                    // mais si votre route PUT requiert tous les champs, vous devrez les inclure.
                    // Exemple avec tous les champs (comme dans votre original, c'est plus robuste) :
                    name: product.name, 
                    description: product.description,
                    price: product.price,
                    category: product.category, 
                }, 
                getConfig()
            );
            
            const newState = !product.isPublished ? 'publié' : 'dépublié';
            showMessage(`Produit ${newState} avec succès.`);
            fetchProducts();
            
        } catch (err) {
            console.error(`Erreur lors de la ${action}:`, err.response ? err.response.data : err.message);
            showMessage(`Erreur lors de la ${action} du produit.`, true);
        }
    };
    
    // 🛑 LOGIQUE handleLogout SIMPLIFIÉE : utilise la prop reçue du parent
    // 🛑 Le Rendu du formulaire de connexion est SUPPRIMÉ.


    // =========================================================================
    //                            RENDU DU COMPOSANT
    // =========================================================================

    return (
        <div className="admin-container">
            <header className="admin-header">
                <h1> Administration de Ma Boulangerie</h1>
                {/* Utilisation de la prop handleLogout fournie par App.js */}
                <button onClick={handleLogout} className="logout-button">
                    <FaSignOutAlt /> Déconnexion
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

                        {/* Champ de sélection de catégorie */}
                        <div className="form-group">
                            <label>Catégorie</label>
                            <select name="category" value={formData.category} onChange={handleChange} required>
                                <option value="">Sélectionner une catégorie</option>
                                {categories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>


                        <div className="form-group">
                            <label>Prix (€)</label>
                            <input type="number" name="price" value={formData.price} onChange={handleChange} step="0.01" required /> 
                        </div>
                        
                        {editingProduct?.image && (
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
                    <h2><FaPlus /> Ajouter un nouveau produit</h2>
                    <form onSubmit={handleSubmit} className="product-form">
                        <div className="form-group">
                            <label>Nom</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} required />
                        </div>

                        {/* Champ de sélection de catégorie */}
                        <div className="form-group">
                            <label>Catégorie</label>
                            <select name="category" value={formData.category} onChange={handleChange} required>
                                <option value="">Sélectionner une catégorie</option>
                                {categories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
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

            <hr className="divider" />
            
            {/* SECTION GESTION DES CATÉGORIES */}
            <div className="category-management-section">
                <h2><FaTags /> Gestion des Catégories</h2>
                <form onSubmit={handleCategorySubmit} className="category-form">
                    <div className="form-group">
                        <label>Nom de la nouvelle catégorie</label>
                        <input 
                            type="text" 
                            value={newCategoryName} 
                            onChange={(e) => setNewCategoryName(e.target.value)} 
                            required 
                            disabled={isCategorySubmitting}
                        />
                    </div>
                    <button type="submit" className="submit-product-button" disabled={isCategorySubmitting}>
                        {isCategorySubmitting ? 'Ajout en cours...' : 'Ajouter Catégorie'}
                    </button>
                </form>

                <div className="category-list">
                    <h3>Catégories existantes ({categories.length})</h3>
                    <ul>
                        {categories.map((cat) => (
                            <li key={cat._id}>
                                {cat.name} 
                                <button onClick={() => handleCategoryDelete(cat._id)} className="delete-category-button">
                                    Supprimer
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
 
            <hr className="divider" />


            {/* --- TABLEAU DES PRODUITS --- */}
            <div className="product-list-section">
                <h2>Liste des produits ({products.length})</h2>
                <table className="product-table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Nom</th>
                            <th>Catégorie</th>
                            <th>Prix (€)</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product._id}>
                                <td className="product-image-cell">
                                    <img src={product.image} alt={product.name} className="product-table-image" />
                                </td>
                                <td>{product.name}</td>
                                <td>
                                    {/* Affiche le nom de la catégorie en cherchant l'ID */}
                                    {categories.find(c => c._id === product.category)?.name || 'Non classé'} 
                                </td>
                                <td>{product.price.toFixed(2)} €</td>
                                <td>
                                    <span className={`status-badge ${product.isPublished ? 'published' : 'unpublished'}`}>
                                        {product.isPublished ? 'Publié ✅' : 'Brouillon 📝'}
                                    </span>
                                </td>
                                <td className="product-actions-cell">
                                    <button onClick={() => startEditing(product)} className="action-button edit-button">
                                        Modifier
                                    </button>
                                    <button onClick={() => handleDelete(product._id)} className="action-button delete-button">
                                        Supprimer
                                    </button>
                                    <button 
                                        onClick={() => handleTogglePublish(product)} 
                                        className={`action-button ${product.isPublished ? 'unpublish-button' : 'publish-button'}`}
                                    >
                                        {product.isPublished ? 'Dépublier' : 'Publier'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MaBoulangerieAdmin;