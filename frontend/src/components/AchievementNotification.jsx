import React, { useState, useEffect } from 'react';
import { FiX, FiShare2 } from 'react-icons/fi';
import achievementsAPI from '../services/achievementsAPI';

const AchievementNotification = ({ achievement, onClose, onGenerateSticker }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger animation
        setTimeout(() => setIsVisible(true), 100);
    }, []);

    const getBadgeIcon = (badgeType) => {
        const icons = {
            verified_explorer: '🔖',
            reading_streak: '🔥',
            genre_master: '📚',
            quiz_champion: '🏆',
            challenge_winner: '⭐',
            book_collector: '📖',
            review_expert: '✍️',
            early_bird: '🌅',
            night_owl: '🌙',
            speed_reader: '⚡'
        };
        return icons[badgeType] || '🎖️';
    };

    const getBadgeColor = (badgeType) => {
        const colors = {
            verified_explorer: 'from-purple-600 to-indigo-600',
            reading_streak: 'from-red-600 to-pink-600',
            genre_master: 'from-green-600 to-emerald-600',
            quiz_champion: 'from-blue-600 to-cyan-600',
            challenge_winner: 'from-pink-600 to-rose-600',
            book_collector: 'from-yellow-600 to-amber-600',
            review_expert: 'from-indigo-600 to-purple-600',
            early_bird: 'from-orange-600 to-yellow-600',
            night_owl: 'from-indigo-800 to-purple-800',
            speed_reader: 'from-cyan-600 to-blue-600'
        };
        return colors[badgeType] || 'from-gray-600 to-gray-700';
    };

    return (
        <div
            className={`fixed top-20 right-6 z-50 transition-all duration-500 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
                }`}
        >
            <div className={`bg-gradient-to-br ${getBadgeColor(achievement.badge_type)} rounded-2xl p-6 shadow-2xl border-2 border-white/30 max-w-sm relative overflow-hidden`}>
                {/* Confetti animation background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute animate-ping"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 2}s`,
                                animationDuration: '3s'
                            }}
                        >
                            {['⭐', '✨', '🎉', '🎊'][Math.floor(Math.random() * 4)]}
                        </div>
                    ))}
                </div>

                <div className="relative z-10">
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-0 right-0 text-white/80 hover:text-white"
                    >
                        <FiX className="w-5 h-5" />
                    </button>

                    {/* Content */}
                    <div className="text-center mb-4">
                        <div className="text-6xl mb-3 animate-bounce">
                            {getBadgeIcon(achievement.badge_type)}
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">
                            Achievement Unlocked! 🎉
                        </h3>
                        <p className="text-white/90 text-lg font-semibold capitalize">
                            {achievement.badge_type.replace(/_/g, ' ')}
                        </p>
                        <p className="text-white/70 text-sm mt-2">
                            {achievement.milestone_value} {achievement.milestone_type.replace(/_/g, ' ')}
                        </p>
                    </div>

                    {/* Action button */}
                    <button
                        onClick={() => onGenerateSticker(achievement)}
                        className="w-full px-4 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 backdrop-blur-sm border border-white/30"
                    >
                        <FiShare2 className="w-5 h-5" />
                        Share on Social Media
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AchievementNotification;
