/**
 * API service for achievements, badges, and stickers
 */
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Get authentication token from localStorage
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const achievementsAPI = {
    // Get user statistics
    getUserStats: async () => {
        const response = await axios.get(`${API_URL}/achievements/stats`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    // Get user achievements
    getUserAchievements: async () => {
        const response = await axios.get(`${API_URL}/achievements/achievements`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    // Check for new achievements
    checkAchievements: async () => {
        const response = await axios.post(`${API_URL}/achievements/achievements/check`, {}, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    // Get achievement progress
    getProgress: async () => {
        const response = await axios.get(`${API_URL}/achievements/progress`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    // Get reading streak
    getStreak: async () => {
        const response = await axios.get(`${API_URL}/achievements/streak`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    // Update reading streak
    updateStreak: async () => {
        const response = await axios.post(`${API_URL}/achievements/streak/update`, {}, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    // Get active challenges
    getChallenges: async () => {
        const response = await axios.get(`${API_URL}/achievements/challenges`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    // Join a challenge
    joinChallenge: async (challengeId) => {
        const response = await axios.post(
            `${API_URL}/achievements/challenges/${challengeId}/join`,
            {},
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    // Get user's challenges
    getMyChallenges: async () => {
        const response = await axios.get(`${API_URL}/achievements/challenges/my`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    // Get available quizzes
    getQuizzes: async () => {
        const response = await axios.get(`${API_URL}/achievements/quizzes`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    // Submit quiz attempt
    submitQuizAttempt: async (quizId, score) => {
        const response = await axios.post(
            `${API_URL}/achievements/quizzes/attempt`,
            { quiz_id: quizId, score },
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    // Generate sticker for achievement
    generateSticker: async (achievementId, platform = 'instagram') => {
        const response = await axios.post(
            `${API_URL}/achievements/stickers/generate`,
            { achievement_id: achievementId, platform },
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    // Download sticker (track download)
    downloadSticker: async (stickerId) => {
        const response = await axios.post(
            `${API_URL}/achievements/stickers/${stickerId}/download`,
            {},
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    // Share sticker
    shareSticker: async (stickerId, platform) => {
        const response = await axios.post(
            `${API_URL}/achievements/stickers/${stickerId}/share`,
            { sticker_id: stickerId, platform },
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    // Get user's stickers
    getMyStickers: async () => {
        const response = await axios.get(`${API_URL}/achievements/stickers/my`, {
            headers: getAuthHeader()
        });
        return response.data;
    }
};

export default achievementsAPI;
