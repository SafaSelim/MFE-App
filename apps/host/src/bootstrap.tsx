import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { configureAuth } from '@mfe/auth-sdk';
import App from './App';
import './index.css';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

// Configure auth SDK
configureAuth({
  useBff: process.env.REACT_APP_USE_BFF === 'true',
  bffUrl: process.env.REACT_APP_BFF_URL || 'http://localhost:3003',
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);