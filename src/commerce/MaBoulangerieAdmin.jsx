import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaPlusCircle, FaSignOutAlt, FaEdit, FaTrash } from 'react-icons/fa';
import './MaBoulangerieAdmin.css';

const MaBoulangerieAdmin = () => {
    // 🔑 CLÉ DU DÉPLOIEMENT : Définit l'URL de base de l'API.
    // En production (Netlify), REACT_APP_BACKEND_URL utilisera l'URL Render (e.g., https://e-souk-backend.onrender.com).
    // En développement local, elle reviendra à 'http://localhost:5001'.
    const BASE_API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
    const API_URL = `${BASE_API_URL}/api/products`; 
    
    // --- États pour l'Ajout ---
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [imageFile, setImageFile] = useState(null); 
    
    // --- États Généraux ---
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [products, setProducts] = useState([]); 
    const navigate = useNavigate();

    // --- États pour l'Édition ---
    const [isEditing, setIsEditing] = useState(false);
    const [editProduct, setEditProduct] = useState({
        _id: null,
        name: '',
        description: '',
        price: '',
        image: null, 
        currentImage: '', 
    });

    // --- Fonctions de Récupération ---
    const fetchProducts = async () => {
        try {
            // Utilise l'API_URL dynamique
            const response = await axios.get(API_URL); 
            setProducts(response.data);
            setError('');
        } catch (err) {
            console.error('Erreur lors du chargement des produits.', err);
            if (products.length === 0) {
                setError('Impossible de charger les produits. Vérifiez la connexion au serveur API.');
            }
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // --- Gestion du Changement de Fichier ---
    const handleImageChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    // --- Gestion du Changement de Fichier (Édition) ---
    const handleEditImageChange = (e) => {
        setEditProduct({ ...editProduct, image: e.target.files[0] });
    };

    // --- Fonction de Soumission du Formulaire (Ajout) ---
    const handleAddProduct = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!name || !description || !price || !imageFile) {
            setError('Tous les champs (Nom, Description, Prix, Image) doivent être remplis.');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            setError('Vous devez être connecté pour ajouter un produit. Redirection...');
            setTimeout(() => navigate('/login'), 1500);
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('price', price);
        formData.append('image', imageFile); 

        try {
            // Utilise l'API_URL dynamique
            const response = await axios.post(API_URL, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`, 
                },
            });

            setSuccess(`Produit "${response.data.name}" ajouté avec succès!`);
            
            setName('');
            setDescription('');
            setPrice('');
            setImageFile(null); 
            fetchProducts(); 

        } catch (err) {
            console.error('Erreur lors de l\'ajout du produit:', err.response?.data || err);
            setError(err.response?.data.error || 'Erreur inconnue lors de l\'ajout. (Serveur/Token invalide)');
        }
    };
    
    // --- Fonction pour commencer l'édition
    const handleEditClick = (product) => {
        setIsEditing(true);
        setSuccess('');
        setError('');
        setEditProduct({
            _id: product._id,
            name: product.name,
            description: product.description,
            price: product.price,
            image: null, 
            currentImage: product.image, 
        });
    };

    // --- Fonction pour soumettre la modification
    const handleSubmitEdit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const token = localStorage.getItem('token');
        if (!token) {
            setError('Vous devez être connecté pour modifier un produit. Redirection...');
            setTimeout(() => navigate('/login'), 1500);
            return;
        }

        const formData = new FormData();
        formData.append('name', editProduct.name);
        formData.append('description', editProduct.description);
        formData.append('price', editProduct.price);
        
        if (editProduct.image) {
            formData.append('image', editProduct.image);
        }

        try {
            // Utilise l'API_URL dynamique
            const response = await axios.put(`${API_URL}/${editProduct._id}`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`, 
                },
            });
            setSuccess(`Produit "${response.data.name}" modifié avec succès!`);
            setIsEditing(false);
            fetchProducts();

        } catch (err) {
            console.error('Erreur lors de la modification du produit:', err.response?.data || err);
            setError(err.response?.data.error || 'Erreur inconnue lors de la modification.');
        }
    };

    // --- Fonction pour supprimer un produit
    const handleDeleteProduct = async (id) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return;

        const token = localStorage.getItem('token');
        if (!token) {
            setError('Vous devez être connecté pour supprimer un produit. Redirection...');
            setTimeout(() => navigate('/login'), 1500);
            return;
        }

        try {
            // Utilise l'API_URL dynamique
            await axios.delete(`${API_URL}/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`, 
                },
            });
            setSuccess(`Produit supprimé avec succès!`);
            fetchProducts();
        } catch (err) {
            console.error('Erreur lors de la suppression du produit:', err.response?.data || err);
            setError(err.response?.data.error || 'Erreur inconnue lors de la suppression.');
        }
    };

    // --- Fonction de Déconnexion ---
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login', { replace: true });
    };


    return (
        <div className="admin-container">
            <header className="admin-header">
                <h1>Panneau d'Administration de Ma Boulangerie</h1>
                <button onClick={handleLogout} className="logout-button">
                    <FaSignOutAlt /> Déconnexion
                </button>
            </header>

            <div className="admin-content">
                
                {success && <p className="success-message">{success}</p>}
                {error && <p className="error-message">{error}</p>}

                {/* --- Section Ajout/Édition --- */}
                <section className="form-section">
                    {isEditing ? (
                        
                        // --- FORMULAIRE D'ÉDITION ---
                        <div className="edit-product-section">
                            <h2><FaEdit /> Modifier le Produit : {editProduct.name}</h2>
                            <form className="product-form" onSubmit={handleSubmitEdit}>
                                <div className="form-group">
                                    <label>Nom du Produit</label>
                                    <input type="text" value={editProduct.name} onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea value={editProduct.description} onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Prix (€)</label>
                                    <input type="number" value={editProduct.price} onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })} min="0.01" step="0.01" required />
                                </div>
                                <div className="form-group">
                                    <label>Image Actuelle</label>
                                    <img 
                                        src={editProduct.currentImage} 
                                        alt="Image actuelle" 
                                        className="current-image-preview"
                                    />
                                    <label htmlFor="edit-image">Remplacer l'Image (Facultatif)</label>
                                    <input
                                        id="edit-image"
                                        type="file"
                                        onChange={handleEditImageChange}
                                    />
                                </div>
                                <div className="edit-actions">
                                    <button type="submit" className="submit-product-button">
                                        Sauvegarder les Modifications
                                    </button>
                                    <button type="button" onClick={() => setIsEditing(false)} className="cancel-button">
                                        Annuler
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        // --- FORMULAIRE D'AJOUT ---
                        <div className="add-product-section">
                            <h2><FaPlusCircle /> Ajouter un Nouveau Produit</h2>
                            <form className="product-form" onSubmit={handleAddProduct}>
                                <div className="form-group">
                                    <label htmlFor="name">Nom du Produit</label>
                                    <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="description">Description</label>
                                    <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="price">Prix (€)</label>
                                    <input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} min="0.01" step="0.01" required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="image">Image du Produit</label>
                                    <input id="image" type="file" onChange={handleImageChange} required />
                                    {imageFile && <p className="image-selected">Image sélectionnée: **{imageFile.name}**</p>}
                                </div>
                                <button type="submit" className="submit-product-button">
                                    Ajouter le Produit
                                </button>
                            </form>
                        </div>
                    )}
                </section>

                <hr/>

                {/* --- Section Gestion des Produits (Liste détaillée) --- */}
                <section className="product-list-section">
                    <h2>Gestion des Produits ({products.length})</h2>
                    <div className="product-grid">
                        {products.map(p => (
                            <div key={p._id} className="product-card">
                                <img
                                    src={p.image} 
                                    alt={p.name}
                                />
                                <div className="product-info">
                                    <h3>{p.name}</h3>
                                    <p className="description">{p.description}</p>
                                    <p className="price">{parseFloat(p.price).toFixed(2)} €</p>
                                </div>
                                <div className="actions">
                                    <button onClick={() => handleEditClick(p)} className="edit-button">
                                        <FaEdit /> Modifier
                                    </button>
                                    <button onClick={() => handleDeleteProduct(p._id)} className="delete-button">
                                        <FaTrash /> Supprimer
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
                
            </div>
        </div>
    );
};

export default MaBoulangerieAdmin;