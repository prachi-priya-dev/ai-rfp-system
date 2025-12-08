import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Global styles
import './styles/variables.css';
import './index.css';
import './styles/layout.css';
import './styles/buttons.css';
import './styles/form.css';
import './styles/sections.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
