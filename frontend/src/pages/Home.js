import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import BookCard from '../components/BookCard';
import NetflixRecommendations from '../components/NetflixRecommendations';
import { booksAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { FiSearch, FiHeart, FiCompass, FiZap, FiBook, FiTrendingUp, FiStar, FiAward } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Home = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [surpriseBooks, setSurpriseBooks] = useState([]);
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        loadBooks();
    }, []);

    const loadBooks = async () => {
        try {
            setLoading(true);
            const response = await booksAPI.getBooks({
                sort_by: 'rating',
                sort_order: 'desc',
                page: 1,
                size: 20
            });
            setBooks(response.data.items || []);
        } catch (error) {
            console.error('Error loading books:', error);
            toast.error('Error loading books');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        if (searchQuery.trim()) {
            navigate(`/browse-external?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleSurpriseMe = async () => {
        try {
            const response = await booksAPI.surpriseMe(8, 4.0);
            setSurpriseBooks(response.data || []);
            window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
            toast.success('✨ Surprise! Here are some amazing books for you!');
        } catch (error) {
            toast.error('Error getting surprise books');
        }
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
                {/* Hero Section - WhichBook Inspired */}
                <div className="relative overflow-hidden py-24">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5" />
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                                    Find Your Perfect Book
                                </span>
                            </h1>
                            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                                Discover books that match your mood, taste, and reading style
                            </p>

                            {/* Discovery Methods */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
                                <button
                                    onClick={() => navigate('/search')}
                                    className="group relative overflow-hidden bg-gradient-to-br from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-2xl p-8 text-left transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-500" />
                                    <FiBook className="text-4xl text-white mb-4 relative z-10" />
                                    <h3 className="text-2xl font-bold text-white mb-2 relative z-10">Search Books</h3>
                                    <p className="text-blue-100 relative z-10">Search by title, author, ISBN with advanced filters</p>
                                </button>

                                <button
                                    onClick={() => navigate('/smart-search')}
                                    className="group relative overflow-hidden bg-gradient-to-br from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 rounded-2xl p-8 text-left transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-500" />
                                    <FiSearch className="text-4xl text-white mb-4 relative z-10" />
                                    <h3 className="text-2xl font-bold text-white mb-2 relative z-10">Smart Search</h3>
                                    <p className="text-green-100 relative z-10">Find books based on YouTube, Instagram, or Google interests</p>
                                </button>

                                <button
                                    onClick={() => navigate('/mood-discovery')}
                                    className="group relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-2xl p-8 text-left transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-500" />
                                    <FiHeart className="text-4xl text-white mb-4 relative z-10" />
                                    <h3 className="text-2xl font-bold text-white mb-2 relative z-10">Mood-Based</h3>
                                    <p className="text-indigo-100 relative z-10">Use sliders to find books that match your current mood</p>
                                </button>

                                <button
                                    onClick={handleSurpriseMe}
                                    className="group relative overflow-hidden bg-gradient-to-br from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 rounded-2xl p-8 text-left transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-500" />
                                    <FiZap className="text-4xl text-white mb-4 relative z-10" />
                                    <h3 className="text-2xl font-bold text-white mb-2 relative z-10">Surprise Me</h3>
                                    <p className="text-pink-100 relative z-10">Get personalized AI-powered book recommendations</p>
                                </button>
                            </div>

                            {/* Creator Portal Banner */}
                            <div className="max-w-4xl mx-auto mb-12">
                                <button
                                    onClick={() => navigate('/creator-portal')}
                                    className="w-full group relative overflow-hidden bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 hover:from-amber-700 hover:via-yellow-700 hover:to-orange-700 rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                                    <div className="flex items-center justify-center gap-4">
                                        <FiBook className="text-4xl text-white" />
                                        <div className="text-left">
                                            <h3 className="text-2xl font-bold text-white mb-1">✍️ Become a Creator</h3>
                                            <p className="text-amber-100">Share your quotes, poems, stories and get published on Flipkart!</p>
                                        </div>
                                        <FiStar className="text-3xl text-white animate-pulse" />
                                    </div>
                                </button>
                            </div>

                            {/* Search Bar */}
                            <div className="max-w-2xl mx-auto">
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FiSearch className="h-6 w-6 text-gray-400 group-hover:text-purple-400 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        className="block w-full pl-12 pr-4 py-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                                        placeholder="Search for books, authors, or genres..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && searchQuery) {
                                                handleSearch();
                                            }
                                        }}
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={handleSearch}
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-medium shadow-lg"
                                        >
                                            Search
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-12">
                                <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                                    <FiBook className="h-8 w-8 text-indigo-400 mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-white">{books.length}+</p>
                                    <p className="text-sm text-gray-400">Books</p>
                                </div>
                                <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                                    <FiTrendingUp className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-white">ML</p>
                                    <p className="text-sm text-gray-400">Powered</p>
                                </div>
                                <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                                    <FiStar className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-white">4.5+</p>
                                    <p className="text-sm text-gray-400">Avg Rating</p>
                                </div>
                                <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                                    <FiAward className="h-8 w-8 text-pink-400 mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-white">10+</p>
                                    <p className="text-sm text-gray-400">Badges</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Recommendations for Authenticated Users */}
                {isAuthenticated && user && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
                        <NetflixRecommendations />
                    </div>
                )}

                {/* Surprise Books Section */}
                {surpriseBooks.length > 0 && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                                <FiZap className="text-yellow-400" />
                                Surprise Recommendations
                            </h2>
                            <p className="text-gray-400">Handpicked books just for you</p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                            {surpriseBooks.map((book) => (
                                <BookCard key={book.id} book={book} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Popular Books */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">
                            Popular Books
                        </h2>
                        <p className="text-gray-400">
                            Highly rated books loved by our community
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {books.slice(0, 15).map((book) => (
                                <BookCard key={book.id} book={book} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Home;
