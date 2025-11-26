import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MaBoulangerie.css'; // Importez votre fichier CSS
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';

const MaBoulangerie = () => {
  const navigate = useNavigate(); // Hook pour la navigation
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
    _id: null,
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
      ...product,
      image: null,
    });
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
      setIsEditing(false);
      setEditProduct({
        name: '',
        description: '',
        price: '',
        image: null,
        _id: null,
      });
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
      <h1>Mes Gâteaux</h1>
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
          <label className="custom-file-input">
            {previewImage ? 'Image sélectionnée' : 'Choisir une image'}
            <input type="file" onChange={handleImageChange} hidden />
          </label>
          {previewImage && (
            <img src={previewImage} alt="Aperçu" className="preview-image" />
          )}
          <button onClick={handleAddProduct}>Ajouter un produit</button>
        </div>
      )}

      {/* Formulaire d'édition */}
      {isEditing && (
        <div className="edit-form">
          <input
            type="text"
            name="name"
            value={editProduct.name}
            onChange={(e) =>
              setEditProduct({ ...editProduct, name: e.target.value })
            }
            placeholder="Nom du produit"
          />
          <input
            type="text"
            name="description"
            value={editProduct.description}
            onChange={(e) =>
              setEditProduct({ ...editProduct, description: e.target.value })
            }
            placeholder="Description du produit"
          />
          <input
            type="number"
            name="price"
            value={editProduct.price}
            onChange={(e) =>
              setEditProduct({ ...editProduct, price: e.target.value })
            }
            placeholder="Prix du produit"
          />
          <label className="custom-file-input">
            {editProduct.image ? 'Image sélectionnée' : 'Choisir une image'}
            <input
              type="file"
              onChange={(e) =>
                setEditProduct({ ...editProduct, image: e.target.files[0] })
              }
              hidden
            />
          </label>
          {editProduct.image && (
            <img
              src={URL.createObjectURL(editProduct.image)}
              alt="Aperçu"
              className="preview-image"
            />
          )}
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
            <div className="icon-buttons">
              <button
                onClick={() => handleDeleteProduct(product._id)}
                className="icon-button"
              >
                <FaTrash />
              </button>
              <button
                onClick={() => handleEditClick(product)}
                className="icon-button"
              >
                <FaEdit />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bouton Valider pour accéder à la page publique */}
      <button
        onClick={() => navigate('/boulangerie-publique')} // Redirection vers BoulangeriePublique
        className="validate-button"
      >
        Valider et afficher la boulangerie publique
      </button>
    </div>
  );
};

export default MaBoulangerie;