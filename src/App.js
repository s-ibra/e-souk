import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// ------------------------------------------------------------------
// 1. IMPORTS DES COMPOSANTS DE BASE ET D'AUTHENTIFICATION
// ------------------------------------------------------------------
import Home from './Home'; 
import Commerces from './components/Commerces'; 
import RequireAuth from './components/RequireAuth'; // Le composant gardien

// --- Authentification ---
import Login from './auth/Login'; 
import LoginEmailOnly from './auth/LoginEmailOnly'; // Nouvelle route de débogage

// ------------------------------------------------------------------
// 2. IMPORTS DES PAGES DE COMMERCE (TOUTES DEPUIS ./commerce)
// ------------------------------------------------------------------
// --- BOULANGERIE ---
import BoulangeriePublique from './commerce/BoulangeriePublique'; 
import MaBoulangerieAdmin from './commerce/MaBoulangerieAdmin'; // C'est lui qui est utilisé

// --- SAVONS (Exemple) ---
import SavonsPublique from './commerce/SavonsPublique'; 
import MesSavons from './commerce/MesSavons'; 

// --- GÂTEAUX ---
import CakePublique from './commerce/CakePublique'; 
import MyCake from './commerce/Mycake'; 

// --- PÉRICULTURE ---
import PericulturePublique from './commerce/PericulturePublique'; 
import MaPericulture from './commerce/Mapericulture'; 


const App = () => {
  return (
    <Router>
      <Routes>
        
        {/* ---------------------------------------------------- */}
        {/* A. ROUTES PUBLIQUES (Accessibles à tous) */}
        {/* ---------------------------------------------------- */}
        <Route path="/" element={<Home />} />
        <Route path="/commerces" element={<Commerces />} />
        
        {/* Route de connexion standard */}
        <Route path="/login" element={<Login />} />
        
        {/* NOUVELLE ROUTE DE DÉBOGAGE SANS MOT DE PASSE */}
        <Route path="/login-debug" element={<LoginEmailOnly />} /> 

        {/* Chemins publics des commerces */}
        <Route path="/boulangerie-publique" element={<BoulangeriePublique />} />
        <Route path="/savons-publique" element={<SavonsPublique />} />
        <Route path="/cake-publique" element={<CakePublique />} />
        <Route path="/periculture-publique" element={<PericulturePublique />} />

        
        {/* ---------------------------------------------------- */}
        {/* B. ROUTES PROTÉGÉES (Nécessitent une connexion) */}
        {/* ---------------------------------------------------- */}
        <Route element={<RequireAuth />}>
          
          {/* Chemins privés des commerces (cible de la redirection après login) */}
          <Route path="/ma-boulangerie" element={<MaBoulangerieAdmin />} />
          
          {/* Les autres routes protégées restent inchangées: */}
          <Route path="/mes-savons" element={<MesSavons />} />
          <Route path="/my-cake" element={<MyCake />} />
          <Route path="/ma-periculture" element={<MaPericulture />} />
          
        </Route>
        
        {/* Route 404/Not Found (Optionnel mais recommandé) */}
        <Route path="*" element={<h1>404 - Page non trouvée</h1>} />
        
      </Routes>
    </Router>
  );
};

export default App;