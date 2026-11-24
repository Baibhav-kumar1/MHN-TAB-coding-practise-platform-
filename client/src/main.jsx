import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { PlaygroundProvider } from './context/PlaygroundContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <PlaygroundProvider>
          <App />
        </PlaygroundProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
