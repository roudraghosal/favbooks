import React, { useState, useEffect } from 'react';
import { recommendationsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import BookCard from './BookCard';
import toast from 'react-hot-toast';

const RecommendationSelector = () => {
    const { user, isAuthenticated } = useAuth();
    const [strategy, setStrategy] = useState('hybrid');
    const [context, setContext] = useState('');
    const [personality, setPersonality] = useState('');
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const strategies = [
        { value: 'hybrid', label: '🎯 Smart Hybrid', description: 'Best overall recommendations combining all strategies' },
        { value: 'popularity', label: '⭐ Popular', description: 'Top-rated and most loved books' },
        { value: 'trending', label: '🔥 Trending', description: 'What\'s hot right now' },
        { value: 'content', label: '📚 Similar Books', description: 'Based on books you\'ve liked' },
        { value: 'collaborative', label: '👥 Community Picks', description: 'Based on similar readers' },
        { value: 'context', label: '🕐 Time-Based', description: 'Perfect for current time/mood' },
        { value: 'quiz', label: '🎭 Personality Match', description: 'Based on your reading personality' },
        { value: 'association', label: '🔗 Bought Together', description: 'Books often enjoyed together' }
    ];

    const contexts = [
        { value: '', label: 'Any Time' },
        { value: 'morning', label: '🌅 Morning' },
        { value: 'afternoon', label: '☀️ Afternoon' },
        { value: 'evening', label: '🌆 Evening' },
        { value: 'night', label: '🌙 Night' },
        { value: 'weekend', label: '🎉 Weekend' },
        { value: 'workday', label: '💼 Workday' }
    ];

    const personalities = [
        { value: '', label: 'None Selected' },
        { value: 'adventurous', label: '🗺️ Adventurous' },
        { value: 'intellectual', label: '🧠 Intellectual' },
        { value: 'creative', label: '🎨 Creative' },
        { value: 'romantic', label: '💕 Romantic' },
        { value: 'analytical', label: '🔬 Analytical' }
    ];

    useEffect(() => {
        if (isAuthenticated() && user) {
            loadRecommendations();
        }
    }, [strategy, context, personality, isAuthenticated, user]);

    const loadRecommendations = async () => {
        try {
            setLoading(true);
            const params = {
                n_recommendations: 12
            };

            if (strategy !== 'hybrid') {
                params.strategy = strategy;
            }
            if (context) params.context = context;
            if (personality) params.personality = personality;

            const response = await recommendationsAPI.getUserRecommendations(user.id, 12, params);
            setRecommendations(response.data || []);
        } catch (error) {
            console.error('Error loading recommendations:', error);
            toast.error('Failed to load recommendations');
        } finally {
            setLoading(false);
        }
    };

    const selectedStrategy = strategies.find(s => s.value === strategy);

    if (!isAuthenticated() || !user) {
        return (
            <div className="bg-gray-800/50 rounded-2xl p-8 text-center">
                <h3 className="text-2xl font-bold text-white mb-4">🎯 Advanced Recommendations</h3>
                <p className="text-gray-400 mb-6">
                    Sign in to unlock 15+ AI-powered recommendation strategies personalized just for you!
                </p>
                <a
                    href="/login"
                    className="inline-block px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-full font-semibold transition"
                >
                    Sign In to Get Started
                </a>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Strategy Selector */}
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-white">🎯 Choose Your Recommendation Style</h3>
                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="text-sm px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition"
                    >
                        {showAdvanced ? '🔽 Hide' : '🔧 Advanced'} Options
                    </button>
                </div>

                {/* Strategy Pills */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {strategies.map((s) => (
                        <button
                            key={s.value}
                            onClick={() => setStrategy(s.value)}
                            className={`p-4 rounded-xl border-2 transition transform hover:scale-105 ${strategy === s.value
                                    ? 'bg-green-500/20 border-green-500 text-green-400'
                                    : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:border-gray-600'
                                }`}
                        >
                            <div className="font-semibold text-sm mb-1">{s.label}</div>
                            <div className="text-xs opacity-75 line-clamp-2">{s.description}</div>
                        </button>
                    ))}
                </div>

                {/* Advanced Options */}
                {showAdvanced && (
                    <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-900/50 rounded-xl border border-gray-700">
                        {/* Context Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-2">
                                📅 Context (When are you reading?)
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {contexts.map((c) => (
                                    <button
                                        key={c.value}
                                        onClick={() => setContext(c.value)}
                                        className={`px-3 py-2 rounded-lg text-sm transition ${context === c.value
                                                ? 'bg-blue-500/20 border border-blue-500 text-blue-400'
                                                : 'bg-gray-800 border border-gray-700 text-gray-400 hover:border-gray-600'
                                            }`}
                                    >
                                        {c.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Personality Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-2">
                                🎭 Personality Type
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {personalities.map((p) => (
                                    <button
                                        key={p.value}
                                        onClick={() => setPersonality(p.value)}
                                        className={`px-3 py-2 rounded-lg text-sm transition ${personality === p.value
                                                ? 'bg-purple-500/20 border border-purple-500 text-purple-400'
                                                : 'bg-gray-800 border border-gray-700 text-gray-400 hover:border-gray-600'
                                            }`}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Current Selection Info */}
                <div className="mt-4 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                    <div className="text-sm text-gray-400">
                        <span className="font-semibold text-green-400">Active Strategy:</span> {selectedStrategy?.label}
                        {context && <span className="ml-2">• <span className="text-blue-400">Context:</span> {contexts.find(c => c.value === context)?.label}</span>}
                        {personality && <span className="ml-2">• <span className="text-purple-400">Personality:</span> {personalities.find(p => p.value === personality)?.label}</span>}
                    </div>
                </div>
            </div>

            {/* Recommendations Grid */}
            <div>
                <h4 className="text-xl font-bold text-white mb-4">
                    {selectedStrategy?.label} Recommendations
                </h4>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-gray-700 aspect-[3/4] rounded-lg mb-2"></div>
                                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : recommendations.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {recommendations.map((book) => (
                            <div key={book.id} className="relative">
                                <BookCard book={book} />
                                {book.recommendation_score && (
                                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                        {(book.recommendation_score * 100).toFixed(0)}%
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-800/50 rounded-xl">
                        <p className="text-gray-400">No recommendations available with current filters.</p>
                        <p className="text-sm text-gray-500 mt-2">Try rating some books first!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecommendationSelector;
