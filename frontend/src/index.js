import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Suppress WebSocket connection errors from React dev server
const isWebSocketError = (message) => {
    if (typeof message !== 'string') return false;
    return (
        message.includes('WebSocket connection') ||
        message.includes('ws://localhost') ||
        message.includes('ERR_CONNECTION_REFUSED') ||
        message.includes('/ws') ||
        message.includes('Error in connection establishment')
    );
};

const originalError = console.error;
const originalWarn = console.warn;
const originalLog = console.log;

console.error = (...args) => {
    if (isWebSocketError(args[0])) return;
    originalError.apply(console, args);
};

console.warn = (...args) => {
    if (isWebSocketError(args[0])) return;
    originalWarn.apply(console, args);
};

console.log = (...args) => {
    if (isWebSocketError(args[0])) return;
    originalLog.apply(console, args);
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);