import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import MoodSlider from '../components/MoodSlider';
import BookCard from '../components/BookCard';
import { moodAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiRefreshCw, FiFilter, FiX, FiSun, FiMoon, FiCloud, FiZap, FiHeart, FiStar } from 'react-icons/fi';

// Quick emoji mood selector - using backend's 8-dimension vector
// [happy, sad, calm, thrilling, dark, funny, emotional, optimistic]
const emojiMoods = [
    { emoji: '😊', label: 'Happy', description: 'Uplifting & joyful', moods: { happy: 85, sad: 20, calm: 60, optimistic: 80, funny: 70 } },
    { emoji: '😢', label: 'Sad', description: 'Emotional & touching', moods: { happy: 20, sad: 85, calm: 50, emotional: 80, dark: 60 } },
    { emoji: '😂', label: 'Funny', description: 'Hilarious & entertaining', moods: { happy: 80, sad: 10, funny: 95, calm: 40, optimistic: 75 } },
    { emoji: '😰', label: 'Anxious', description: 'Suspenseful & thrilling', moods: { happy: 30, calm: 20, thrilling: 90, dark: 70, emotional: 75 } },
    { emoji: '😍', label: 'Romantic', description: 'Love & passion', moods: { happy: 75, sad: 30, calm: 50, emotional: 85, optimistic: 70 } },
    { emoji: '😎', label: 'Cool', description: 'Action-packed adventure', moods: { happy: 65, calm: 25, thrilling: 85, optimistic: 70, funny: 40 } },
    { emoji: '🤔', label: 'Thoughtful', description: 'Deep & philosophical', moods: { happy: 50, calm: 70, emotional: 75, dark: 55, optimistic: 45 } },
    { emoji: '😱', label: 'Scared', description: 'Horror & mystery', moods: { happy: 15, sad: 30, calm: 10, thrilling: 95, dark: 90 } },
    { emoji: '🥰', label: 'Cozy', description: 'Warm & comforting', moods: { happy: 80, sad: 15, calm: 85, emotional: 60, optimistic: 80 } },
    { emoji: '😤', label: 'Determined', description: 'Inspiring & motivational', moods: { happy: 60, calm: 40, thrilling: 70, optimistic: 85, emotional: 65 } },
    { emoji: '😴', label: 'Relaxed', description: 'Calm & soothing', moods: { happy: 60, sad: 20, calm: 95, thrilling: 10, optimistic: 65 } },
    { emoji: '🤩', label: 'Excited', description: 'Epic & adventurous', moods: { happy: 85, calm: 20, thrilling: 90, optimistic: 90, funny: 60 } },
];

// Mood preset configurations - updated to match backend vector
const moodPresets = [
    {
        name: '☀️ Uplifting & Light',
        description: 'Feel-good stories that lift your spirits',
        color: 'from-yellow-400 to-orange-500',
        icon: '☀️',
        moods: { happy: 80, sad: 20, calm: 60, thrilling: 40, dark: 25, funny: 75, emotional: 50, optimistic: 85 }
    },
    {
        name: '🌙 Dark & Mysterious',
        description: 'Thrilling tales with unexpected twists',
        color: 'from-purple-600 to-indigo-900',
        icon: '🌙',
        moods: { happy: 30, sad: 50, calm: 25, thrilling: 85, dark: 90, funny: 20, emotional: 70, optimistic: 25 }
    },
    {
        name: '❤️ Heartwarming Romance',
        description: 'Love stories to warm your heart',
        color: 'from-pink-400 to-rose-600',
        icon: '❤️',
        moods: { happy: 75, sad: 35, calm: 60, thrilling: 45, dark: 30, funny: 45, emotional: 85, optimistic: 70 }
    },
    {
        name: '⚔️ Epic Adventure',
        description: 'Action-packed journeys and quests',
        color: 'from-red-500 to-orange-600',
        icon: '⚔️',
        moods: { happy: 60, sad: 30, calm: 20, thrilling: 90, dark: 50, funny: 40, emotional: 60, optimistic: 65 }
    },
    {
        name: '🧠 Thought-Provoking',
        description: 'Deep, complex narratives',
        color: 'from-teal-500 to-cyan-700',
        icon: '🧠',
        moods: { happy: 50, sad: 55, calm: 65, thrilling: 40, dark: 60, funny: 25, emotional: 75, optimistic: 45 }
    },
    {
        name: '😂 Fun & Lighthearted',
        description: 'Humorous and entertaining reads',
        color: 'from-green-400 to-emerald-600',
        icon: '😂',
        moods: { happy: 85, sad: 15, calm: 55, thrilling: 30, dark: 20, funny: 90, emotional: 40, optimistic: 80 }
    }
];

const MoodBasedDiscovery = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [books, setBooks] = useState([]);
    const [showFilters, setShowFilters] = useState(true);

    // Mood sliders state - matching backend's 8-dimension vector
    // [happy, sad, calm, thrilling, dark, funny, emotional, optimistic]
    const [moods, setMoods] = useState({
        happy: 50,
        sad: 50,
        calm: 50,
        thrilling: 50,
        dark: 50,
        funny: 50,
        emotional: 50,
        optimistic: 50,
    });

    const moodConfig = [
        { key: 'happy', label: 'Emotional Tone', left: '😢 Sad', right: '😊 Happy', icon: '🎭' },
        { key: 'calm', label: 'Energy Level', left: '� Calm', right: '⚡ Thrilling', icon: '💫' },
        { key: 'optimistic', label: 'Overall Mood', left: '🌙 Dark', right: '☀️ Optimistic', icon: '🌓' },
        { key: 'funny', label: 'Tone', left: '😂 Funny', right: '🎓 Serious', icon: '🎪' },
        { key: 'emotional', label: 'Depth', left: '📖 Light', right: '💔 Emotional', icon: '✨' },
        { key: 'thrilling', label: 'Intensity', left: '�️ Gentle', right: '� Intense', icon: '🎯' },
        { key: 'dark', label: 'Atmosphere', left: '☀️ Bright', right: '🌑 Dark', icon: '🌅' },
        { key: 'sad', label: 'Feeling', left: '� Uplifting', right: '� Sad', icon: '⏱️' },
    ];

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            // Get all mood books initially
            const response = await moodAPI.getAllMoodBooks(0, 20);
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
            sad: 50,
            calm: 50,
            thrilling: 50,
            dark: 50,
            funny: 50,
            emotional: 50,
            optimistic: 50,
        });
        toast.success('Mood preferences reset to neutral');
    };

    const applyPreset = (preset) => {
        // Update all mood values from preset, keeping defaults for missing ones
        setMoods(prev => ({
            ...prev,
            ...preset.moods
        }));
        toast.success(`Applied "${preset.name || preset.label}" mood!`);
        // Automatically filter books after applying preset
        setTimeout(() => filterBooksByMood(), 500);
    };

    const filterBooksByMood = async () => {
        try {
            setLoading(true);
            toast.loading('Finding books matching your mood...', { id: 'mood-search' });

            // Call mood recommendation API
            const response = await moodAPI.getMoodRecommendations(moods, 20);

            setBooks(response.data || []);
            toast.success(`Found ${response.data?.length || 0} books matching your mood!`, { id: 'mood-search' });
        } catch (error) {
            console.error('Error filtering books:', error);
            toast.error('Failed to find books. Please try again.', { id: 'mood-search' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
                {/* Hero Section with Animated Background */}
                <div className="relative overflow-hidden">
                    {/* Animated Gradient Background */}
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 animate-pulse" />
                        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/30 rounded-full filter blur-3xl animate-blob" />
                        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/30 rounded-full filter blur-3xl animate-blob animation-delay-2000" />
                        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-500/30 rounded-full filter blur-3xl animate-blob animation-delay-4000" />
                    </div>

                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                        {/* Header */}
                        <div className="text-center mb-12">
                            <div className="flex items-center justify-center gap-3 mb-6">
                                <span className="text-6xl animate-bounce">🎭</span>
                                <h1 className="text-5xl md:text-6xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                                    Mood Discovery
                                </h1>
                                <span className="text-6xl animate-bounce animation-delay-1000">📚</span>
                            </div>
                            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                                Find books that perfectly match your current mood and preferences
                            </p>
                        </div>

                        {/* Quick Emoji Mood Selector */}
                        <div className="mb-12">
                            <h2 className="text-2xl font-bold text-white text-center mb-3">
                                😊 How are you feeling today?
                            </h2>
                            <p className="text-gray-400 text-center mb-6">
                                Click an emoji to instantly find books matching your mood
                            </p>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-3">
                                {emojiMoods.map((mood, index) => (
                                    <button
                                        key={index}
                                        onClick={() => applyPreset(mood)}
                                        className="group relative bg-gray-800/60 hover:bg-gray-700/80 backdrop-blur-sm rounded-2xl p-4 transition-all duration-300 hover:scale-110 hover:shadow-xl border border-gray-700/50 hover:border-purple-500/50"
                                        title={mood.description}
                                    >
                                        <div className="text-center">
                                            <div className="text-4xl mb-2 transform group-hover:scale-125 transition-transform duration-300">
                                                {mood.emoji}
                                            </div>
                                            <div className="text-xs text-gray-300 font-medium group-hover:text-white transition-colors">
                                                {mood.label}
                                            </div>
                                        </div>
                                        {/* Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-10">
                                            {mood.description}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Mood Preset Cards */}
                        <div className="mb-12">
                            <h2 className="text-2xl font-bold text-white text-center mb-6">
                                ✨ Quick Mood Presets
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                {moodPresets.map((preset, index) => (
                                    <button
                                        key={index}
                                        onClick={() => applyPreset(preset)}
                                        className={`group relative overflow-hidden bg-gradient-to-br ${preset.color} rounded-xl p-6 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl`}
                                    >
                                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                                        <div className="relative text-center">
                                            <div className="text-4xl mb-3">{preset.icon}</div>
                                            <h3 className="text-white font-bold text-sm mb-1 leading-tight">
                                                {preset.name.replace(/^[^\s]+\s/, '')}
                                            </h3>
                                            <p className="text-white/80 text-xs line-clamp-2">
                                                {preset.description}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Toggle Filters Button */}
                        <div className="flex justify-center mb-8">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full transition-all duration-200 shadow-lg hover:shadow-2xl transform hover:scale-105"
                            >
                                {showFilters ? (
                                    <>
                                        <FiX className="w-5 h-5" />
                                        Hide Custom Settings
                                    </>
                                ) : (
                                    <>
                                        <FiFilter className="w-5 h-5" />
                                        Customize Your Mood
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Mood Sliders */}
                        {showFilters && (
                            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-700/50">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                                            <span className="text-4xl">🎨</span>
                                            Custom Mood Settings
                                        </h2>
                                        <p className="text-gray-400">Fine-tune each aspect to find your perfect match</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={resetMoods}
                                            className="flex items-center gap-2 px-5 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all duration-200 hover:scale-105 shadow-md"
                                        >
                                            <FiRefreshCw className="w-4 h-4" />
                                            Reset
                                        </button>
                                        <button
                                            onClick={filterBooksByMood}
                                            className="px-8 py-3 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:from-indigo-600 hover:via-purple-700 hover:to-pink-600 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-2xl hover:scale-105"
                                        >
                                            🔍 Find Books
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
                                    {moodConfig.map((config) => (
                                        <div
                                            key={config.key}
                                            className="group p-6 bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-2xl hover:from-gray-700/70 hover:to-gray-800/70 transition-all duration-300 border border-gray-600/30 hover:border-purple-500/50 hover:shadow-xl"
                                        >
                                            <MoodSlider
                                                label={config.label}
                                                leftLabel={config.left}
                                                rightLabel={config.right}
                                                icon={config.icon}
                                                value={moods[config.key]}
                                                onChange={(value) => handleMoodChange(config.key, value)}
                                            />
                                        </div>
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
