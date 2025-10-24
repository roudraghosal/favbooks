import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import BookDetails from './pages/BookDetails';
import BrowseExternal from './pages/BrowseExternal';
import AchievementsDashboard from './pages/AchievementsDashboard';
import MoodBasedDiscovery from './pages/MoodBasedDiscovery';
import Resources from './pages/Resources';
import SmartSearch from './pages/SmartSearch';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import Library from './pages/Library';
// import Search from './pages/Search';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { isAuthenticated, isAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-spotify-dark">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spotify-green"></div>
            </div>
        );
    }

    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && !isAdmin()) {
        return <Navigate to="/" replace />;
    }

    return children;
};

// App Router Component
const AppRouter = () => {
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes */}
                <Route
                    path="/library"
                    element={
                        <ProtectedRoute>
                            <Library />
                        </ProtectedRoute>
                    }
                />

                {/* Admin Routes */}
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/admin" element={<Admin />} />

                {/* Public Book Routes */}
                <Route path="/books/:id" element={<BookDetails />} />
                <Route path="/browse-external" element={<BrowseExternal />} />
                <Route path="/mood-discovery" element={<MoodBasedDiscovery />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/smart-search" element={<SmartSearch />} />

                {/* Achievements Route */}
                <Route
                    path="/achievements"
                    element={
                        <ProtectedRoute>
                            <AchievementsDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* <Route path="/search" element={<Search />} /> */}

                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
};

function App() {
    return (
        <AuthProvider>
            <div className="App">
                <AppRouter />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#282828',
                            color: '#fff',
                            border: '1px solid #404040',
                        },
                        success: {
                            style: {
                                background: '#1db954',
                            },
                        },
                        error: {
                            style: {
                                background: '#e22134',
                            },
                        },
                    }}
                />
            </div>
        </AuthProvider>
    );
}

export default App;