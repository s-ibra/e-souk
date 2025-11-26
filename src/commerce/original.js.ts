import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MaBoulangerie.css';
import { useNavigate } from 'react-router-dom';

const MaBoulangerie = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editProduct, setEditProduct] = useState({
    name: '',
    description: '',
    price: '',
    image: null,
    _id: null
  });

  // Fonction pour ajouter un produit
  const handleAddProduct = async () => {
    if (!name || !description || !price || !image) {
      setError('Tous les champs doivent être remplis.');
      return;
    }

    if (isNaN(price)) {
      setError('Le prix doit être un nombre valide.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('image', image);

    try {
      const response = await axios.post('http://localhost:5000/api/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log("Produit ajouté", response.data);
      fetchProducts(); // Recharger les produits après ajout
      setName('');
      setDescription('');
      setPrice('');
      setImage(null);
      setPreviewImage(null);
      setError('');
    } catch (err) {
      setError('Erreur lors de l\'ajout du produit : ' + err.message);
      console.error(err);
    }
  };

  // Fonction pour récupérer les produits
  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products');
      setProducts(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des produits.');
      console.error(err);
    }
  };

  // Fonction pour supprimer un produit
  const handleDeleteProduct = async (id) => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/products/${id}`);
      console.log('Produit supprimé', response.data);
      fetchProducts(); // Recharger les produits après suppression
    } catch (err) {
      setError('Erreur lors de la suppression du produit : ' + err.message);
      console.error(err);
    }
  };

  // Fonction pour commencer l'édition d'un produit
  const handleEditClick = (product) => {
    setIsEditing(true);
    setEditProduct({
      ...product, // Remplir les champs avec les valeurs existantes du produit
      image: null, // Optionnel : réinitialiser l'image si tu veux que l'utilisateur choisisse une nouvelle image
    });
  };

  // Fonction pour gérer les changements dans le formulaire d'édition
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditProduct((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Fonction pour soumettre la modification d'un produit
  const handleSubmitEdit = async () => {
    const formData = new FormData();
    formData.append('name', editProduct.name);
    formData.append('description', editProduct.description);
    formData.append('price', editProduct.price);
    if (editProduct.image) formData.append('image', editProduct.image);

    try {
      const response = await axios.put(`http://localhost:5000/api/products/${editProduct._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Produit mis à jour:', response.data);
      fetchProducts(); // Recharger les produits après mise à jour
      setIsEditing(false); // Fermer le formulaire d'édition
      setEditProduct({
        name: '',
        description: '',
        price: '',
        image: null,
        _id: null,
      }); // Réinitialiser l'état
    } catch (err) {
      console.error('Erreur lors de la mise à jour du produit:', err);
      setError('Erreur lors de la mise à jour du produit.');
    }
  };

  // Fonction pour gérer le changement d'image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Charger les produits au démarrage du composant
  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="boulangerie-container">
      <h1>Ma Boulangerie</h1>

      {error && <div className="error-message">{error}</div>}

      {/* Formulaire pour ajouter un produit */}
      {!isEditing && (
        <div className="product-form">
          <input
            type="text"
            placeholder="Nom du produit"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Description du produit"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            type="number"
            placeholder="Prix du produit"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <input
            type="file"
            placeholder="Choisir une image"
            onChange={handleImageChange}
          />
          {previewImage && <img src={previewImage} alt="Aperçu" style={{ width: '100px', height: '100px' }} />}
          <button onClick={handleAddProduct}>Ajouter un produit</button>
        </div>
      )}

      {/* Formulaire d'édition (affiché quand on clique sur "Modifier") */}
      {isEditing && (
        <div className="edit-form">
          <input
            type="text"
            name="name"
            value={editProduct.name}
            onChange={handleEditChange}
            placeholder="Nom du produit"
          />
          <input
            type="text"
            name="description"
            value={editProduct.description}
            onChange={handleEditChange}
            placeholder="Description du produit"
          />
          <input
            type="number"
            name="price"
            value={editProduct.price}
            onChange={handleEditChange}
            placeholder="Prix du produit"
          />
          <input
            type="file"
            onChange={(e) => setEditProduct({ ...editProduct, image: e.target.files[0] })}
            placeholder="Choisir une image"
          />
          {editProduct.image && <img src={URL.createObjectURL(editProduct.image)} alt="Aperçu" />}
          <button onClick={handleSubmitEdit}>Soumettre la modification</button>
          <button onClick={() => setIsEditing(false)}>Annuler</button>
        </div>
      )}

      {/* Liste des produits */}
      <div className="product-list">
        {products.map((product) => (
          <div key={product._id} className="product-card">
            <img
              src={`http://localhost:5000/images/${product.image}`}
              alt={product.name}
            />
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p>{product.price} €</p>
            <button onClick={() => handleDeleteProduct(product._id)}>Supprimer</button>
            <button onClick={() => handleEditClick(product)}>Modifier</button>
          </div>
        ))}
      </div>

      {/* Bouton de retour */}
      <button onClick={() => navigate('/commerces')}>Retour à Cormmerces</button>
    </div>
  );
};

export default MaBoulangerie;
