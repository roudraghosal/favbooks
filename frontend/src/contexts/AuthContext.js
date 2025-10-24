import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, apiHelpers } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Initialize auth state
    useEffect(() => {
        let isMounted = true;

        const initializeAuth = async () => {
            const savedToken = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');

            if (!savedToken) {
                localStorage.removeItem('user');
                if (isMounted) {
                    setToken(null);
                    setUser(null);
                    setLoading(false);
                }
                return;
            }

            if (isMounted) {
                setToken(savedToken);
            }

            let parsedUser = null;

            if (savedUser) {
                try {
                    parsedUser = JSON.parse(savedUser);
                } catch (error) {
                    console.error('Error parsing saved user data:', error);
                }
            }

            if (!parsedUser?.id) {
                try {
                    const profileResponse = await authAPI.getProfile();
                    const refreshedUser = {
                        token_type: parsedUser?.token_type || 'bearer',
                        ...profileResponse.data,
                    };
                    parsedUser = refreshedUser;
                    localStorage.setItem('user', JSON.stringify(refreshedUser));
                } catch (error) {
                    console.error('Failed to refresh user profile:', error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    if (isMounted) {
                        setToken(null);
                        setUser(null);
                        setLoading(false);
                    }
                    return;
                }
            }

            if (isMounted) {
                setUser(parsedUser);
                setLoading(false);
            }
        };

        initializeAuth();

        return () => {
            isMounted = false;
        };
    }, []);

    const login = async (email, password) => {
        try {
            setLoading(true);
            const response = await authAPI.login({ email, password });
            const { access_token, token_type, user: userPayload } = response.data;
            const authTokenType = token_type || 'bearer';

            // Store token for subsequent requests
            localStorage.setItem('token', access_token);
            setToken(access_token);

            let resolvedUser = userPayload;

            if (!resolvedUser) {
                try {
                    const profileResponse = await authAPI.getProfile();
                    resolvedUser = profileResponse.data;
                } catch (profileError) {
                    console.error('Unable to fetch user profile after login:', profileError);
                }
            }

            const userData = resolvedUser
                ? { ...resolvedUser, token_type: authTokenType }
                : { email, token_type: authTokenType };

            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);

            toast.success('Login successful!');
            return { success: true };

        } catch (error) {
            console.error('Login error:', error);
            let errorMessage = 'Login failed. Please check your connection and try again.';

            if (error.response) {
                // Server responded with error
                errorMessage = apiHelpers.formatError(error);
            } else if (error.request) {
                // Request made but no response (network error)
                errorMessage = 'Network error. Please ensure the backend server is running on port 8000.';
            } else {
                // Something else happened
                errorMessage = error.message || 'An unexpected error occurred';
            }

            toast.error(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        try {
            setLoading(true);
            await authAPI.register(userData);

            toast.success('Registration successful! Please log in.');
            return { success: true };

        } catch (error) {
            console.error('Registration error:', error);
            let errorMessage = 'Registration failed. Please check your connection and try again.';

            if (error.response) {
                // Server responded with error
                errorMessage = apiHelpers.formatError(error);
            } else if (error.request) {
                // Request made but no response (network error)
                errorMessage = 'Network error. Please ensure the backend server is running on port 8000.';
            } else {
                // Something else happened
                errorMessage = error.message || 'An unexpected error occurred';
            }

            toast.error(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        toast.success('Logged out successfully');
    };

    const isAuthenticated = () => {
        return !!token && !!user;
    };

    const isAdmin = () => {
        return user?.is_admin || false;
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated,
        isAdmin,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};