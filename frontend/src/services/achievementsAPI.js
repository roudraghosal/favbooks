/**
 * API service for achievements, badges, and stickers
 */
import api from './api';

export const achievementsAPI = {
    // Get user statistics
    getUserStats: async () => {
        const response = await api.get('/api/achievements/stats');
        return response.data;
    },

    // Get user achievements
    getUserAchievements: async () => {
        const response = await api.get('/api/achievements/achievements');
        return response.data;
    },

    // Check for new achievements
    checkAchievements: async () => {
        const response = await api.post('/achievements/achievements/check');
        return response.data;
    },

    // Get achievement progress
    getProgress: async () => {
        const response = await api.get('/api/achievements/progress');
        return response.data;
    },

    // Get reading streak
    getStreak: async () => {
        const response = await api.get('/api/achievements/streak');
        return response.data;
    },

    // Update reading streak
    updateStreak: async () => {
        const response = await api.post('/achievements/streak/update');
        return response.data;
    },

    // Get active challenges
    getChallenges: async () => {
        const response = await api.get('/api/achievements/challenges');
        return response.data;
    },

    // Join a challenge
    joinChallenge: async (challengeId) => {
        const response = await api.post(`/achievements/challenges/${challengeId}/join`);
        return response.data;
    },

    // Get user's challenges
    getMyChallenges: async () => {
        const response = await api.get('/api/achievements/challenges/my');
        return response.data;
    },

    // Get available quizzes
    getQuizzes: async () => {
        const response = await api.get('/api/achievements/quizzes');
        return response.data;
    },

    // Submit quiz attempt
    submitQuizAttempt: async (quizId, score) => {
        const response = await api.post('/achievements/quizzes/attempt', { quiz_id: quizId, score });
        return response.data;
    },

    // Generate sticker for achievement
    generateSticker: async (achievementId, platform = 'instagram') => {
        const response = await api.post('/achievements/stickers/generate', {
            achievement_id: achievementId,
            platform,
        });
        return response.data;
    },

    // Download sticker (track download)
    downloadSticker: async (stickerId) => {
        const response = await api.post(`/achievements/stickers/${stickerId}/download`);
        return response.data;
    },

    // Share sticker
    shareSticker: async (stickerId, platform) => {
        const response = await api.post(`/achievements/stickers/${stickerId}/share`, {
            sticker_id: stickerId,
            platform,
        });
        return response.data;
    },

    // Get user's stickers
    getMyStickers: async () => {
        const response = await api.get('/api/achievements/stickers/my');
        return response.data;
    }
};

export default achievementsAPI;
