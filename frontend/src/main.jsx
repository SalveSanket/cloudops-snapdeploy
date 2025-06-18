// src/main.jsx
// Entry point for the React frontend application (CloudOps SnapDeploy)
// Sets up global routing and applies base styles

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css'; // Global styles

// Mount the main App component inside the root element with routing support
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);