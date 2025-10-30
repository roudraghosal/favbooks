import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear token and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
    getProfile: () => api.get('/auth/me'),
};

// Books API
export const booksAPI = {
    getBooks: (params) => api.get('/books', { params }),
    getBook: (id) => api.get(`/books/${id}`),
    getBookPreview: (id) => api.get(`/books/${id}/preview`),
    createBook: (bookData) => api.post('/books', bookData),
    updateBook: (id, bookData) => api.put(`/books/${id}`, bookData),
    deleteBook: (id) => api.delete(`/books/${id}`),
    searchBooks: (query, limit = 10) =>
        api.get('/books/search', { params: { q: query, limit } }),
    surpriseMe: (count = 5, minRating = 4.0) =>
        api.get('/books/surprise', { params: { count, min_rating: minRating } }),

    // External API endpoints
    searchExternal: (query, source = 'google', limit = 20) =>
        api.get('/books/external/search', { params: { query, source, limit } }),
    getTrending: () => api.get('/books/external/trending'),
    getByGenre: (genre, limit = 20) =>
        api.get(`/books/external/genre/${genre}`, { params: { limit } }),
    getByAuthor: (author, limit = 20) =>
        api.get(`/books/external/author/${author}`, { params: { limit } }),
    importExternal: (externalId, source) =>
        api.post('/books/import/external', null, { params: { external_id: externalId, source } }),
    enrichBook: (bookId) => api.post(`/books/enrich/${bookId}`),
};

// Ratings API
export const ratingsAPI = {
    createRating: (ratingData) => api.post('/ratings', ratingData),
    getUserRatings: (userId) => api.get(`/ratings/user/${userId}`),
    getBookRatings: (bookId) => api.get(`/ratings/book/${bookId}`),
};

// Wishlist API
export const wishlistAPI = {
    addToWishlist: (bookId) => api.post('/wishlist', { book_id: bookId }),
    getWishlist: () => api.get('/wishlist'),
    removeFromWishlist: (bookId) => api.delete(`/wishlist/${bookId}`),
};

// Recommendations API
export const recommendationsAPI = {
    getUserRecommendations: (userId, nRecommendations = 10, extraParams = {}) =>
        api.get(`/recommend/${userId}`, {
            params: {
                n_recommendations: nRecommendations,
                ...extraParams
            }
        }),
    retrainModels: () => api.post('/recommend/retrain'),
};

// Mood-based discovery API
export const moodAPI = {
    getMoodRecommendations: (moodSliders, limit = 20, filters = {}) => {
        // Convert slider values (0-100) to backend scale (0-10)
        const scaledMoods = {
            happy: moodSliders.happy / 10,
            sad: moodSliders.sad / 10,
            calm: moodSliders.calm / 10,
            thrilling: moodSliders.thrilling / 10,
            dark: moodSliders.dark / 10,
            funny: moodSliders.funny / 10,
            emotional: moodSliders.emotional / 10,
            optimistic: moodSliders.optimistic / 10
        };

        return api.post('/api/mood/recommend', {
            mood_sliders: scaledMoods,
            limit,
            country_filter: filters.country || null,
            complexity_min: filters.complexityMin || 1,
            complexity_max: filters.complexityMax || 10
        });
    },
    getAllMoodBooks: (skip = 0, limit = 100, country = null) =>
        api.get('/api/mood/books', { params: { skip, limit, country } }),
    getMoodBook: (bookId) => api.get(`/api/mood/books/${bookId}`),
    autoTagMood: (description) =>
        api.post('/api/mood/auto-tag-mood', null, { params: { description } }),
};

// Generic API helper functions
export const apiHelpers = {
    handleError: (error) => {
        console.error('API Error:', error);

        if (error.response) {
            // Server responded with error status
            const message = error.response.data?.detail || error.response.data?.message || 'An error occurred';
            return { success: false, message, status: error.response.status };
        } else if (error.request) {
            // Request made but no response
            return { success: false, message: 'Network error. Please check your connection.' };
        } else {
            // Something else happened
            return { success: false, message: error.message || 'An unexpected error occurred' };
        }
    },

    formatError: (error) => {
        if (typeof error === 'string') return error;
        if (error.response?.data?.detail) return error.response.data.detail;
        if (error.response?.data?.message) return error.response.data.message;
        if (error.message) return error.message;
        return 'An unexpected error occurred';
    }
};

export default api;