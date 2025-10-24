import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Suppress WebSocket connection errors from React dev server
const originalError = console.error;
console.error = (...args) => {
    if (
        typeof args[0] === 'string' &&
        (args[0].includes('WebSocket connection') ||
         args[0].includes('ws://localhost') ||
         args[0].includes('ERR_CONNECTION_REFUSED'))
    ) {
        return;
    }
    originalError.apply(console, args);
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);