import React, { useState, useEffect } from 'react';
import { FiSearch, FiYoutube, FiInstagram, FiGlobe, FiBookOpen, FiTrendingUp, FiZap, FiClock, FiTarget } from 'react-icons/fi';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const SmartSearch = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchSource, setSearchSource] = useState('general'); // general, youtube, instagram, google
    const [recommendations, setRecommendations] = useState([]);
    const [autoRecommendations, setAutoRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchHistory, setSearchHistory] = useState([]);
    const [searchPatterns, setSearchPatterns] = useState({});
    const [showAutoRecommendations, setShowAutoRecommendations] = useState(false);

    // Sample trending topics
    const trendingTopics = [
        'Self improvement',
        'AI and Technology',
        'Mental health',
        'Productivity',
        'History',
        'Science fiction',
        'Business strategy',
        'Philosophy'
    ];

    // Analyze search patterns and generate keywords
    const analyzeSearchPatterns = (history) => {
        const patterns = {};
        const keywords = [];

        history.forEach(item => {
            const words = item.query.toLowerCase().split(' ');
            words.forEach(word => {
                if (word.length > 3) { // Only meaningful words
                    patterns[word] = (patterns[word] || 0) + 1;
                    if (!keywords.includes(word)) {
                        keywords.push(word);
                    }
                }
            });
        });

        return { patterns, keywords };
    };

    // Generate automated recommendations based on search history
    const generateAutoRecommendations = async (history) => {
        if (history.length < 2) return; // Need at least 2 searches

        const { patterns, keywords } = analyzeSearchPatterns(history);

        // Find most searched topics
        const topKeywords = Object.entries(patterns)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([word]) => word);

        if (topKeywords.length === 0) return;

        try {
            // Search for books based on patterns
            const searchQuery = topKeywords.join(' ');
            const response = await api.get('/api/books/search', {
                params: { q: searchQuery, limit: 8 }
            });

            if (response.data && response.data.length > 0) {
                setAutoRecommendations(response.data);
                setSearchPatterns(patterns);
                setShowAutoRecommendations(true);

                // Store patterns
                localStorage.setItem('searchPatterns', JSON.stringify(patterns));

                toast.success(`🎯 Found ${response.data.length} books based on your interests!`, {
                    duration: 5000
                });
            }
        } catch (error) {
            console.error('Auto-recommendation error:', error);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        try {
            // Search for books based on the query
            const response = await api.get('/api/books/search', {
                params: { q: searchQuery, limit: 20 }
            });

            setRecommendations(response.data || []);

            // Add to search history with metadata
            const newHistory = [
                {
                    query: searchQuery,
                    source: searchSource,
                    timestamp: new Date().toISOString(),
                    resultCount: response.data?.length || 0
                },
                ...searchHistory.slice(0, 19) // Keep last 20 searches
            ];
            setSearchHistory(newHistory);
            localStorage.setItem('searchHistory', JSON.stringify(newHistory));

            // Trigger auto-recommendations if we have enough history
            if (newHistory.length >= 3) {
                setTimeout(() => generateAutoRecommendations(newHistory), 1000);
            }

        } catch (error) {
            console.error('Search error:', error);
            setRecommendations([]);
            toast.error('Search failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleTrendingClick = (topic) => {
        setSearchQuery(topic);
        setSearchSource('general');
    };

    const getSourceIcon = (source) => {
        switch (source) {
            case 'youtube': return <FiYoutube className="text-red-500" />;
            case 'instagram': return <FiInstagram className="text-pink-500" />;
            case 'google': return <FiGlobe className="text-blue-500" />;
            default: return <FiSearch className="text-green-500" />;
        }
    };

    // Load search history on mount and generate auto-recommendations
    useEffect(() => {
        const saved = localStorage.getItem('searchHistory');
        const savedPatterns = localStorage.getItem('searchPatterns');

        if (saved) {
            const history = JSON.parse(saved);
            setSearchHistory(history);

            // Auto-generate recommendations on page load if we have history
            if (history.length >= 3) {
                setTimeout(() => {
                    generateAutoRecommendations(history);
                }, 500);
            }
        }

        if (savedPatterns) {
            setSearchPatterns(JSON.parse(savedPatterns));
        }
    }, []);

    // Get top interests from patterns
    const getTopInterests = () => {
        if (!searchPatterns || Object.keys(searchPatterns).length === 0) return [];

        return Object.entries(searchPatterns)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([word, count]) => ({ word, count }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mb-6">
                        <FiZap className="text-white text-4xl" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Smart Book Discovery
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Find books based on your interests from YouTube videos, Instagram posts, Google searches, or any topic you're curious about
                    </p>

                    {/* Tracking indicator */}
                    {searchHistory.length > 0 && (
                        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-purple-900/30 border border-purple-500/50 rounded-full">
                            <FiClock className="text-purple-400" />
                            <span className="text-purple-300 text-sm">
                                📊 Tracking {searchHistory.length} {searchHistory.length === 1 ? 'search' : 'searches'} •
                                {searchHistory.length >= 3 ? ' Auto-recommendations active' : ` ${3 - searchHistory.length} more for auto-recommendations`}
                            </span>
                        </div>
                    )}
                </div>

                {/* Search Form */}
                <div className="max-w-4xl mx-auto mb-12">
                    <form onSubmit={handleSearch} className="space-y-4">
                        {/* Search Source Selector */}
                        <div className="flex flex-wrap gap-2 justify-center mb-4">
                            <button
                                type="button"
                                onClick={() => setSearchSource('general')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${searchSource === 'general'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                    }`}
                            >
                                <FiSearch /> General Search
                            </button>
                            <button
                                type="button"
                                onClick={() => setSearchSource('youtube')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${searchSource === 'youtube'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                    }`}
                            >
                                <FiYoutube /> YouTube Interest
                            </button>
                            <button
                                type="button"
                                onClick={() => setSearchSource('instagram')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${searchSource === 'instagram'
                                    ? 'bg-pink-500 text-white'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                    }`}
                            >
                                <FiInstagram /> Instagram Interest
                            </button>
                            <button
                                type="button"
                                onClick={() => setSearchSource('google')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${searchSource === 'google'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                    }`}
                            >
                                <FiGlobe /> Google Search
                            </button>
                        </div>

                        {/* Search Input */}
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                {getSourceIcon(searchSource)}
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={
                                    searchSource === 'youtube'
                                        ? "e.g., productivity tips, cooking tutorials..."
                                        : searchSource === 'instagram'
                                            ? "e.g., fitness inspiration, travel photography..."
                                            : searchSource === 'google'
                                                ? "e.g., how to learn programming, best diet plans..."
                                                : "Enter any topic, interest, or keyword..."
                                }
                                className="w-full pl-12 pr-4 py-4 bg-gray-800 text-white text-lg rounded-2xl border-2 border-gray-700 focus:outline-none focus:border-green-500 transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={loading || !searchQuery.trim()}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white px-6 py-2 rounded-xl transition-colors"
                            >
                                {loading ? 'Searching...' : 'Search'}
                            </button>
                        </div>
                    </form>

                    {/* Info based on source */}
                    <div className="mt-4 text-center text-sm text-gray-400">
                        {searchSource === 'youtube' && "💡 Enter topics from videos you watch"}
                        {searchSource === 'instagram' && "💡 Enter topics from posts you like"}
                        {searchSource === 'google' && "💡 Enter what you search for on Google"}
                        {searchSource === 'general' && "💡 Enter any topic you're interested in"}
                    </div>
                </div>

                {/* Auto-Generated Recommendations based on search patterns */}
                {showAutoRecommendations && autoRecommendations.length > 0 && recommendations.length === 0 && !loading && (
                    <div className="max-w-6xl mx-auto mb-12">
                        <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/50 rounded-2xl p-6 mb-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-purple-500/20 rounded-full">
                                    <FiTarget className="text-purple-400 text-2xl" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Personalized For You</h2>
                                    <p className="text-gray-300 text-sm">Based on your search history and interests</p>
                                </div>
                            </div>

                            {/* Show detected interests */}
                            {getTopInterests().length > 0 && (
                                <div className="mb-4">
                                    <p className="text-sm text-gray-400 mb-2">🎯 Your Top Interests:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {getTopInterests().map(({ word, count }) => (
                                            <span
                                                key={word}
                                                className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30"
                                            >
                                                {word} ({count}x)
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between mb-4">
                                <span className="text-green-400 font-semibold">
                                    {autoRecommendations.length} books recommended
                                </span>
                                <button
                                    onClick={() => setShowAutoRecommendations(false)}
                                    className="text-gray-400 hover:text-white text-sm"
                                >
                                    Hide
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {autoRecommendations.map((book) => (
                                <Link
                                    key={book.id}
                                    to={`/books/${book.id}`}
                                    className="group bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all transform hover:scale-105"
                                >
                                    <div className="relative aspect-[2/3] overflow-hidden">
                                        <img
                                            src={book.cover_image_url || 'https://via.placeholder.com/300x450'}
                                            alt={book.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                        <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                                            Auto
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="absolute bottom-0 p-4 w-full">
                                                <FiTarget className="text-purple-400 text-2xl mb-2" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-white font-semibold line-clamp-2 mb-1">
                                            {book.title}
                                        </h3>
                                        <p className="text-gray-400 text-sm mb-2">{book.author}</p>
                                        {book.average_rating > 0 && (
                                            <div className="flex items-center gap-1">
                                                <span className="text-yellow-400">★</span>
                                                <span className="text-white text-sm">{book.average_rating.toFixed(1)}</span>
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Trending Topics */}
                {recommendations.length === 0 && !loading && (
                    <div className="max-w-4xl mx-auto mb-12">
                        <div className="flex items-center gap-2 mb-4">
                            <FiTrendingUp className="text-green-400 text-xl" />
                            <h2 className="text-xl font-semibold text-white">Trending Topics</h2>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {trendingTopics.map((topic, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleTrendingClick(topic)}
                                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full text-sm transition-colors"
                                >
                                    {topic}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Search History */}
                {searchHistory.length > 0 && recommendations.length === 0 && !loading && (
                    <div className="max-w-4xl mx-auto mb-12">
                        <h2 className="text-xl font-semibold text-white mb-4">Recent Searches</h2>
                        <div className="space-y-2">
                            {searchHistory.slice(0, 5).map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setSearchQuery(item.query);
                                        setSearchSource(item.source);
                                    }}
                                    className="flex items-center gap-3 w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-left"
                                >
                                    <div className="flex-shrink-0">
                                        {getSourceIcon(item.source)}
                                    </div>
                                    <span className="text-gray-300">{item.query}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-green-500"></div>
                        <p className="text-gray-400 mt-4">Finding perfect books for you...</p>
                    </div>
                )}

                {/* Search Results */}
                {recommendations.length > 0 && !loading && (
                    <div className="max-w-6xl mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white">
                                    Recommended Books
                                </h2>
                                <p className="text-gray-400 mt-1">
                                    Based on "{searchQuery}" from {searchSource === 'youtube' ? 'YouTube' : searchSource === 'instagram' ? 'Instagram' : searchSource === 'google' ? 'Google' : 'your interests'}
                                </p>
                            </div>
                            <span className="text-green-400 font-semibold">
                                {recommendations.length} books found
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {recommendations.map((book) => (
                                <Link
                                    key={book.id}
                                    to={`/books/${book.id}`}
                                    className="group bg-gray-800 rounded-xl overflow-hidden hover:ring-2 hover:ring-green-500 transition-all transform hover:scale-105"
                                >
                                    <div className="relative aspect-[2/3] overflow-hidden">
                                        <img
                                            src={book.cover_image_url || 'https://via.placeholder.com/300x450'}
                                            alt={book.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="absolute bottom-0 p-4 w-full">
                                                <FiBookOpen className="text-white text-2xl mb-2" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-white font-semibold line-clamp-2 mb-1">
                                            {book.title}
                                        </h3>
                                        <p className="text-gray-400 text-sm mb-2">{book.author}</p>
                                        {book.average_rating > 0 && (
                                            <div className="flex items-center gap-1">
                                                <span className="text-yellow-400">★</span>
                                                <span className="text-white text-sm">{book.average_rating.toFixed(1)}</span>
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* No Results */}
                {recommendations.length === 0 && !loading && searchQuery && (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800 rounded-full mb-4">
                            <FiBookOpen className="text-gray-400 text-2xl" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No books found</h3>
                        <p className="text-gray-400">Try a different search term or topic</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SmartSearch;
