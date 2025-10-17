import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiShuffle, FiChevronRight, FiBook } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { booksAPI } from '../services/api';
import BookCard from '../components/BookCard';
import Layout from '../components/Layout';
import NetflixRecommendations from '../components/NetflixRecommendations';
import ExternalBooksSection from '../components/ExternalBooksSection';
import toast from 'react-hot-toast';

const Home = () => {
    const { isAuthenticated, user } = useAuth();
    const [featuredBooks, setFeaturedBooks] = useState([]);
    const [popularBooks, setPopularBooks] = useState([]);
    const [recentBooks, setRecentBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [surpriseBooks, setSurpriseBooks] = useState([]);

    useEffect(() => {
        loadHomeData();
    }, [isAuthenticated, user]);

    const loadHomeData = async () => {
        try {
            setLoading(true);

            // Only load basic books for non-authenticated users
            // Netflix-style recommendations will load separately for authenticated users

            // Load popular books (high rating + many ratings)
            const popularResponse = await booksAPI.getBooks({
                sort_by: 'rating',
                sort_order: 'desc',
                min_rating: 4.0,
                page: 1,
                size: 12
            });
            setPopularBooks(popularResponse.data.items || []);

            // Load recent books
            const recentResponse = await booksAPI.getBooks({
                sort_by: 'created_at',
                sort_order: 'desc',
                page: 1,
                size: 12
            });
            setRecentBooks(recentResponse.data.items || []);

            // Set featured books (subset of popular books)
            setFeaturedBooks(popularResponse.data.items?.slice(0, 6) || []);

        } catch (error) {
            console.error('Error loading home data:', error);
            toast.error('Error loading books');
        } finally {
            setLoading(false);
        }
    };

    const handleSurpriseMe = async () => {
        try {
            const response = await booksAPI.surpriseMe(6, 3.5);
            setSurpriseBooks(response.data || []);
            toast.success('Surprise! Here are some great books for you!');
        } catch (error) {
            toast.error('Error getting surprise books');
        }
    };

    const LoadingSkeleton = ({ count = 6 }) => (
        <div className="book-grid">
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="animate-pulse">
                    <div className="bg-gray-700 aspect-[3/4] rounded-lg mb-4"></div>
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                    </div>
                </div>
            ))}
        </div>
    );

    const BookSection = ({ title, books, linkTo, linkText, showSeeAll = true }) => (
        <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">{title}</h2>
                {showSeeAll && linkTo && (
                    <Link
                        to={linkTo}
                        className="flex items-center space-x-1 text-spotify-light-gray hover:text-white transition-colors"
                    >
                        <span>{linkText}</span>
                        <FiChevronRight size={16} />
                    </Link>
                )}
            </div>

            {loading ? (
                <LoadingSkeleton />
            ) : books.length > 0 ? (
                <div className="book-grid">
                    {books.map((book) => (
                        <BookCard key={book.id} book={book} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-spotify-light-gray">
                    <p>No books available at the moment.</p>
                </div>
            )}
        </section>
    );

    return (
        <Layout>
            {/* Netflix-Style Recommendations for Authenticated Users */}
            {isAuthenticated() && user ? (
                <NetflixRecommendations />
            ) : (
                <>
                    {/* Original Homepage for Non-Authenticated Users */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {/* Hero Section */}
                        <section className="mb-12">
                            <div className="bg-gradient-to-r from-spotify-green to-green-400 rounded-2xl p-8 md:p-12 text-white">
                                <div className="max-w-2xl">
                                    <h1 className="text-4xl md:text-6xl font-bold mb-4">
                                        Discover Your Next
                                        <span className="block text-spotify-black">Great Read</span>
                                    </h1>
                                    <p className="text-lg md:text-xl mb-8 text-green-100">
                                        Get personalized book recommendations powered by AI.
                                        Join thousands of readers finding their perfect books.
                                    </p>

                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <button
                                            onClick={handleSurpriseMe}
                                            className="flex items-center justify-center space-x-2 bg-white text-spotify-green font-semibold py-3 px-8 rounded-full hover:bg-gray-100 transition-colors"
                                        >
                                            <FiShuffle size={20} />
                                            <span>Surprise Me!</span>
                                        </button>

                                        <Link
                                            to="/browse"
                                            className="flex items-center justify-center space-x-2 bg-spotify-green text-white font-semibold py-3 px-8 rounded-full hover:bg-green-600 transition-colors"
                                        >
                                            <FiBook size={20} />
                                            <span>Browse External Books</span>
                                        </Link>

                                        <Link
                                            to="/search"
                                            className="flex items-center justify-center space-x-2 bg-transparent border-2 border-white text-white font-semibold py-3 px-8 rounded-full hover:bg-white hover:text-spotify-green transition-colors"
                                        >
                                            <span>Search Library</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Surprise Books */}
                        {surpriseBooks.length > 0 && (
                            <BookSection
                                title="🎲 Surprise Selection"
                                books={surpriseBooks}
                                showSeeAll={false}
                            />
                        )}

                        {/* External Books Section - Trending from APIs */}
                        <ExternalBooksSection />

                        {/* Featured Books */}
                        <BookSection
                            title="⭐ Featured Books"
                            books={featuredBooks}
                            linkTo="/search?sort_by=rating&sort_order=desc"
                            linkText="See all featured"
                        />

                        {/* Popular Books */}
                        <BookSection
                            title="🔥 Trending Now"
                            books={popularBooks}
                            linkTo="/search?sort_by=rating&sort_order=desc&min_rating=4"
                            linkText="See all trending"
                        />

                        {/* Recent Books */}
                        <BookSection
                            title="🆕 Recently Added"
                            books={recentBooks}
                            linkTo="/search?sort_by=created_at&sort_order=desc"
                            linkText="See all recent"
                        />

                        {/* Call to Action for non-authenticated users */}
                        <section className="bg-spotify-gray rounded-2xl p-8 md:p-12 text-center">
                            <h2 className="text-3xl font-bold text-white mb-4">
                                Get Personalized Recommendations
                            </h2>
                            <p className="text-spotify-light-gray text-lg mb-8 max-w-2xl mx-auto">
                                Create an account to receive AI-powered book recommendations
                                tailored to your reading preferences and history.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    to="/register"
                                    className="btn-primary inline-flex items-center justify-center"
                                >
                                    Sign Up Free
                                </Link>
                                <Link
                                    to="/login"
                                    className="btn-secondary inline-flex items-center justify-center"
                                >
                                    Log In
                                </Link>
                            </div>
                        </section>
                    </div>
                </>
            )}
        </Layout>
    );
};

export default Home;