import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Hide the noisy dev-server socket errors that bubble up via console.*
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

// Provide a lightweight mock WebSocket for the CRA dev client so the browser
// no longer reports connection-refused errors in the devtools console.
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined' && window.WebSocket) {
    const OriginalWebSocket = window.WebSocket;
    const suppressedSocketMatchers = [/^ws:\/\/(?:localhost|127(?:\.0+)?\.0\.1):3000\/ws\b/i];

    const shouldSuppress = (url) => {
        if (typeof url !== 'string') return false;
        return suppressedSocketMatchers.some((regex) => regex.test(url));
    };

    const createSilentSocket = () => {
        const listeners = {
            open: [],
            message: [],
            error: [],
            close: [],
        };

        const fire = (type, event) => {
            listeners[type].forEach((handler) => {
                try {
                    handler(event);
                } catch (err) {
                    // Keep handlers isolated so a faulty listener does not break others.
                    originalError('Silent socket listener error', err);
                }
            });
        };

        const socket = {
            readyState: OriginalWebSocket.OPEN,
            bufferedAmount: 0,
            extensions: '',
            protocol: '',
            binaryType: 'blob',
            CLOSED: OriginalWebSocket.CLOSED,
            CLOSING: OriginalWebSocket.CLOSING,
            CONNECTING: OriginalWebSocket.CONNECTING,
            OPEN: OriginalWebSocket.OPEN,
            close: () => {
                socket.readyState = OriginalWebSocket.CLOSED;
                fire('close', { type: 'close', target: socket, code: 1000, reason: 'dev-suppress' });
                if (typeof socket.onclose === 'function') {
                    socket.onclose({ type: 'close', target: socket, code: 1000, reason: 'dev-suppress' });
                }
            },
            send: () => {
                /* noop */
            },
            addEventListener: (type, handler) => {
                if (listeners[type]) listeners[type].push(handler);
            },
            removeEventListener: (type, handler) => {
                if (!listeners[type]) return;
                listeners[type] = listeners[type].filter((listener) => listener !== handler);
            },
            dispatchEvent: (event) => {
                if (!event || !event.type || !listeners[event.type]) return true;
                fire(event.type, event);
                return true;
            },
            onopen: null,
            onmessage: null,
            onerror: null,
            onclose: null,
        };

        setTimeout(() => {
            const openEvent = { type: 'open', target: socket };
            fire('open', openEvent);
            if (typeof socket.onopen === 'function') {
                socket.onopen(openEvent);
            }
        }, 0);

        return socket;
    };

    const SilentWebSocket = function (url, protocols) {
        if (shouldSuppress(url)) {
            return createSilentSocket();
        }
        return new OriginalWebSocket(url, protocols);
    };

    SilentWebSocket.prototype = OriginalWebSocket.prototype;
    SilentWebSocket.OPEN = OriginalWebSocket.OPEN;
    SilentWebSocket.CLOSED = OriginalWebSocket.CLOSED;
    SilentWebSocket.CLOSING = OriginalWebSocket.CLOSING;
    SilentWebSocket.CONNECTING = OriginalWebSocket.CONNECTING;

    window.WebSocket = SilentWebSocket;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
