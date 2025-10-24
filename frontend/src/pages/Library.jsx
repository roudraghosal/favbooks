import React, { useState, useEffect } from 'react';
import { FiHeart, FiBook } from 'react-icons/fi';
import Layout from '../components/Layout';
import BookCard from '../components/BookCard';
import { wishlistAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Library = () => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated()) {
            loadWishlist();
        }
    }, [isAuthenticated]);

    const loadWishlist = async () => {
        try {
            setLoading(true);
            const response = await wishlistAPI.getWishlist();
            setWishlist(response.data || []);
        } catch (error) {
            console.error('Error loading wishlist:', error);
            toast.error('Could not load your library');
        } finally {
            setLoading(false);
        }
    };

    const handleWishlistChange = (bookId, action) => {
        if (action === 'remove') {
            setWishlist(wishlist.filter(item => item.book.id !== bookId));
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <FiHeart className="text-4xl text-red-500" />
                        <h1 className="text-4xl font-bold text-white">
                            My Library
                        </h1>
                    </div>
                    <p className="text-spotify-light-gray">
                        {wishlist.length} {wishlist.length === 1 ? 'book' : 'books'} in your collection
                    </p>
                </div>

                {/* Wishlist Books */}
                {wishlist.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {wishlist.map((item) => (
                            <BookCard
                                key={item.book.id}
                                book={item.book}
                                showRemoveFromWishlist={true}
                                onWishlistChange={handleWishlistChange}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="mb-6">
                            <FiBook className="mx-auto text-6xl text-gray-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">
                            Your library is empty
                        </h2>
                        <p className="text-spotify-light-gray mb-8 max-w-md mx-auto">
                            Start adding books to your library by clicking the heart icon on books you love.
                        </p>
                        <a
                            href="/"
                            className="inline-block px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg"
                        >
                            Explore Books
                        </a>
                    </div>
                )}

                {/* Stats Section */}
                {wishlist.length > 0 && (
                    <div className="mt-12 bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-8">
                        <h3 className="text-2xl font-bold text-white mb-6 text-center">
                            Your Reading Stats
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gray-800/50 rounded-xl p-6 text-center">
                                <div className="text-4xl font-bold text-purple-400 mb-2">
                                    {wishlist.length}
                                </div>
                                <div className="text-gray-400">Books Saved</div>
                            </div>
                            <div className="bg-gray-800/50 rounded-xl p-6 text-center">
                                <div className="text-4xl font-bold text-pink-400 mb-2">
                                    {new Set(wishlist.map(item => item.book.author)).size}
                                </div>
                                <div className="text-gray-400">Unique Authors</div>
                            </div>
                            <div className="bg-gray-800/50 rounded-xl p-6 text-center">
                                <div className="text-4xl font-bold text-blue-400 mb-2">
                                    {wishlist.reduce((sum, item) => sum + (item.book.average_rating || 0), 0) / wishlist.length || 0}
                                </div>
                                <div className="text-gray-400">Avg. Rating</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Library;
