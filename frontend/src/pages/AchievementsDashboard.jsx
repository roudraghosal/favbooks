import React, { useState, useEffect } from 'react';
import { FiAward, FiTrendingUp, FiTarget, FiStar, FiDownload, FiShare2, FiInstagram, FiTwitter } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import achievementsAPI from '../services/achievementsAPI';

const AchievementsDashboard = () => {
    const [stats, setStats] = useState(null);
    const [achievements, setAchievements] = useState([]);
    const [progress, setProgress] = useState({});
    const [streak, setStreak] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedAchievement, setSelectedAchievement] = useState(null);
    const [generatedSticker, setGeneratedSticker] = useState(null);
    const [showStickerModal, setShowStickerModal] = useState(false);
    const [generatingSticker, setGeneratingSticker] = useState(false);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [statsData, achievementsData, progressData, streakData] = await Promise.all([
                achievementsAPI.getUserStats(),
                achievementsAPI.getUserAchievements(),
                achievementsAPI.getProgress(),
                achievementsAPI.getStreak()
            ]);

            setStats(statsData);
            setAchievements(achievementsData);
            setProgress(progressData.progress);
            setStreak(streakData);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckAchievements = async () => {
        try {
            const result = await achievementsAPI.checkAchievements();
            if (result.newly_unlocked > 0) {
                alert(`🎉 Congratulations! You unlocked ${result.newly_unlocked} new achievement(s)!`);
                loadDashboardData();
            } else {
                alert('No new achievements unlocked yet. Keep going! 💪');
            }
        } catch (error) {
            console.error('Error checking achievements:', error);
        }
    };

    const handleGenerateSticker = async (achievement) => {
        try {
            setGeneratingSticker(true);
            setSelectedAchievement(achievement);

            const sticker = await achievementsAPI.generateSticker(achievement.id, 'instagram');
            setGeneratedSticker(sticker);
            setShowStickerModal(true);
        } catch (error) {
            console.error('Error generating sticker:', error);
            alert('Failed to generate sticker. Please try again.');
        } finally {
            setGeneratingSticker(false);
        }
    };

    const handleDownloadSticker = async () => {
        if (!generatedSticker) return;

        try {
            // Track download
            await achievementsAPI.downloadSticker(generatedSticker.id);

            // Download the image
            const link = document.createElement('a');
            link.href = generatedSticker.image_data;
            link.download = `achievement-${selectedAchievement.badge_type}-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            alert('Sticker downloaded! 📥');
        } catch (error) {
            console.error('Error downloading sticker:', error);
        }
    };

    const handleShareSticker = async (platform) => {
        if (!generatedSticker) return;

        try {
            const result = await achievementsAPI.shareSticker(generatedSticker.id, platform);

            // Copy share message to clipboard
            if (result.message) {
                navigator.clipboard.writeText(result.message);
            }

            // Platform-specific share actions
            if (platform === 'instagram') {
                alert('📋 Share message copied! Now:\n1. Download the sticker\n2. Open Instagram\n3. Create a new Story\n4. Add the downloaded image\n5. Paste the message');
            } else if (platform === 'whatsapp') {
                alert('📋 Share message copied! Now download the sticker and share it on WhatsApp!');
            } else if (platform === 'twitter') {
                alert('📋 Share message copied! Now download the sticker and share it on Twitter!');
            }
        } catch (error) {
            console.error('Error sharing sticker:', error);
        }
    };

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

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
                <div className="text-white text-2xl">Loading achievements...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">🏆 Achievements</h1>
                        <p className="text-gray-300">Track your reading journey and unlock badges</p>
                    </div>
                    <button
                        onClick={handleCheckAchievements}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg flex items-center gap-2"
                    >
                        <FiAward className="w-5 h-5" />
                        Check for New Achievements
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="max-w-7xl mx-auto mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-300 text-sm">Books Read</p>
                                <p className="text-3xl font-bold text-white">{stats.books_read}</p>
                            </div>
                            <div className="text-4xl">📚</div>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-300 text-sm">Current Streak</p>
                                <p className="text-3xl font-bold text-white">{streak?.current_streak || 0} days</p>
                            </div>
                            <div className="text-4xl">🔥</div>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-300 text-sm">Reviews Written</p>
                                <p className="text-3xl font-bold text-white">{stats.reviews_written}</p>
                            </div>
                            <div className="text-4xl">✍️</div>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-300 text-sm">Achievements</p>
                                <p className="text-3xl font-bold text-white">{achievements.length}</p>
                            </div>
                            <div className="text-4xl">🏆</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Unlocked Achievements */}
            {achievements.length > 0 && (
                <div className="max-w-7xl mx-auto mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <FiStar className="text-yellow-400" />
                        Unlocked Achievements
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {achievements.map((achievement) => (
                            <div
                                key={achievement.id}
                                className={`bg-gradient-to-br ${getBadgeColor(achievement.badge_type)} rounded-xl p-6 border border-white/20 hover:scale-105 transition-all cursor-pointer relative overflow-hidden`}
                            >
                                {/* Background decoration */}
                                <div className="absolute top-0 right-0 text-8xl opacity-10">
                                    {getBadgeIcon(achievement.badge_type)}
                                </div>

                                <div className="relative z-10">
                                    <div className="text-5xl mb-3">{getBadgeIcon(achievement.badge_type)}</div>
                                    <h3 className="text-xl font-bold text-white mb-2 capitalize">
                                        {achievement.badge_type.replace(/_/g, ' ')}
                                    </h3>
                                    <p className="text-white/80 text-sm mb-1">
                                        {achievement.milestone_value} {achievement.milestone_type.replace(/_/g, ' ')}
                                    </p>
                                    <p className="text-white/60 text-xs mb-4">
                                        Unlocked: {new Date(achievement.unlocked_at).toLocaleDateString()}
                                    </p>

                                    <button
                                        onClick={() => handleGenerateSticker(achievement)}
                                        disabled={generatingSticker}
                                        className="w-full px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
                                    >
                                        <FiShare2 className="w-4 h-4" />
                                        Generate Sticker
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Achievement Progress */}
            {Object.keys(progress).length > 0 && (
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <FiTarget className="text-green-400" />
                        Achievement Progress
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(progress).map(([badgeType, data]) => (
                            !data.unlocked && (
                                <div
                                    key={badgeType}
                                    className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-white capitalize">
                                                {badgeType.replace(/_/g, ' ')}
                                            </h3>
                                            <p className="text-gray-300 text-sm">Keep going to unlock this badge!</p>
                                        </div>
                                        <div className="text-3xl">{getBadgeIcon(badgeType)}</div>
                                    </div>

                                    {Object.entries(data.requirements).map(([milestone, info]) => (
                                        <div key={milestone} className="mb-3">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-300 capitalize">{milestone.replace(/_/g, ' ')}</span>
                                                <span className="text-white font-semibold">
                                                    {info.current} / {info.required}
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-700 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                                                    style={{ width: `${info.percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        ))}
                    </div>
                </div>
            )}

            {/* Sticker Modal */}
            {showStickerModal && generatedSticker && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gradient-to-br from-gray-900 to-purple-900 rounded-2xl p-8 max-w-2xl w-full border border-white/20">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">🎉 Your Achievement Sticker</h2>
                            <button
                                onClick={() => setShowStickerModal(false)}
                                className="text-gray-400 hover:text-white text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        {/* Sticker Preview */}
                        <div className="mb-6 flex justify-center">
                            <div className="bg-white rounded-xl p-4 shadow-2xl">
                                <img
                                    src={generatedSticker.image_data}
                                    alt="Achievement Sticker"
                                    className="max-w-sm w-full rounded-lg"
                                    style={{ maxHeight: '600px', objectFit: 'contain' }}
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <button
                                onClick={handleDownloadSticker}
                                className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
                            >
                                <FiDownload className="w-5 h-5" />
                                Download Sticker
                            </button>

                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    onClick={() => handleShareSticker('instagram')}
                                    className="px-4 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg font-semibold hover:from-pink-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
                                >
                                    <FiInstagram className="w-5 h-5" />
                                    Instagram
                                </button>

                                <button
                                    onClick={() => handleShareSticker('whatsapp')}
                                    className="px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-2"
                                >
                                    <FaWhatsapp className="w-5 h-5" />
                                    WhatsApp
                                </button>

                                <button
                                    onClick={() => handleShareSticker('twitter')}
                                    className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
                                >
                                    <FiTwitter className="w-5 h-5" />
                                    Twitter
                                </button>
                            </div>

                            <p className="text-gray-300 text-sm text-center mt-4">
                                💡 Tip: Instagram Stories are 1080x1920px - this sticker is perfectly sized!
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AchievementsDashboard;
