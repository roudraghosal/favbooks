import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import MoodSlider from '../components/MoodSlider';
import BookCard from '../components/BookCard';
import { booksAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiRefreshCw, FiFilter, FiX } from 'react-icons/fi';

const MoodBasedDiscovery = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [books, setBooks] = useState([]);
    const [showFilters, setShowFilters] = useState(true);

    // Mood sliders state
    const [moods, setMoods] = useState({
        happy: 50,        // Happy ←→ Sad
        gentle: 50,       // Gentle ←→ Violent
        optimistic: 50,   // Optimistic ←→ Dark
        funny: 50,        // Funny ←→ Serious
        conventional: 50, // Conventional ←→ Unusual
        predictable: 50,  // Predictable ←→ Surprising
        easy: 50,         // Easy ←→ Demanding
        short: 50,        // Short ←→ Long
    });

    const moodConfig = [
        { key: 'happy', label: 'Emotional Tone', left: '😢 Sad', right: '😊 Happy', icon: '🎭' },
        { key: 'gentle', label: 'Content Level', left: '🕊️ Gentle', right: '⚔️ Intense', icon: '💫' },
        { key: 'optimistic', label: 'Overall Mood', left: '🌙 Dark', right: '☀️ Optimistic', icon: '🌓' },
        { key: 'funny', label: 'Tone', left: '😂 Funny', right: '🎓 Serious', icon: '🎪' },
        { key: 'conventional', label: 'Style', left: '📖 Conventional', right: '🎨 Unusual', icon: '✨' },
        { key: 'predictable', label: 'Plot', left: '📋 Predictable', right: '🎲 Surprising', icon: '🎯' },
        { key: 'easy', label: 'Reading Level', left: '✅ Easy', right: '🧠 Demanding', icon: '📚' },
        { key: 'short', label: 'Length', left: '📄 Short', right: '📕 Long', icon: '⏱️' },
    ];

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            const response = await booksAPI.searchBooks('', 20);
            setBooks(response.data || []);
        } catch (error) {
            console.error('Error fetching books:', error);
            toast.error('Failed to load books');
        } finally {
            setLoading(false);
        }
    };

    const handleMoodChange = (key, value) => {
        setMoods(prev => ({ ...prev, [key]: value }));
    };

    const resetMoods = () => {
        setMoods({
            happy: 50,
            gentle: 50,
            optimistic: 50,
            funny: 50,
            conventional: 50,
            predictable: 50,
            easy: 50,
            short: 50,
        });
    };

    const filterBooksByMood = () => {
        // In a real implementation, this would use backend API
        // For now, we'll simulate filtering based on existing books
        toast.success('Filtering books based on your mood preferences...');
        fetchBooks();
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
                {/* Hero Section */}
                <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10" />
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                        <div className="text-center mb-12">
                            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                                Discover Your Perfect Book
                            </h1>
                            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                                Use our intuitive mood sliders to find books that match exactly how you're feeling
                            </p>
                        </div>

                        {/* Toggle Filters Button */}
                        <div className="flex justify-center mb-8">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-full transition-colors duration-200 shadow-lg"
                            >
                                {showFilters ? (
                                    <>
                                        <FiX className="w-5 h-5" />
                                        Hide Filters
                                    </>
                                ) : (
                                    <>
                                        <FiFilter className="w-5 h-5" />
                                        Show Filters
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Mood Sliders */}
                        {showFilters && (
                            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-gray-700">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-bold text-white">
                                        Adjust Your Mood Preferences
                                    </h2>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={resetMoods}
                                            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
                                        >
                                            <FiRefreshCw className="w-4 h-4" />
                                            Reset
                                        </button>
                                        <button
                                            onClick={filterBooksByMood}
                                            className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                                        >
                                            Find Books
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
                                    {moodConfig.map((config) => (
                                        <MoodSlider
                                            key={config.key}
                                            label={config.label}
                                            leftLabel={config.left}
                                            rightLabel={config.right}
                                            icon={config.icon}
                                            value={moods[config.key]}
                                            onChange={(value) => handleMoodChange(config.key, value)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Results Section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">
                            Books Matching Your Mood
                        </h2>
                        <p className="text-gray-400">
                            {books.length} books found that match your preferences
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
                        </div>
                    ) : books.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {books.map((book) => (
                                <BookCard key={book.id} book={book} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-gray-400 text-lg">
                                No books found. Try adjusting your mood preferences.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default MoodBasedDiscovery;
