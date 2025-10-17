import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiBook, FiExternalLink, FiBookOpen, FiChevronRight } from 'react-icons/fi';
import { booksAPI } from '../services/api';
import toast from 'react-hot-toast';

const ExternalBooksSection = () => {
    const [trendingBooks, setTrendingBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTrendingBooks();
    }, []);

    const loadTrendingBooks = async () => {
        try {
            setLoading(true);
            const response = await booksAPI.getTrending();
            // Get first 12 books for the homepage
            setTrendingBooks(response.data?.slice(0, 12) || []);
        } catch (error) {
            console.error('Error loading trending books:', error);
            // Silently fail on homepage
        } finally {
            setLoading(false);
        }
    };

    const openBookReader = (book) => {
        if (book.preview_link) {
            window.open(book.preview_link, '_blank');
            toast.success('Opening book preview...');
        } else if (book.info_link) {
            window.open(book.info_link, '_blank');
            toast.info('Opening book information page...');
        } else {
            toast.error('No preview available for this book');
        }
    };

    const BookCard = ({ book }) => (
        <div className="bg-spotify-gray rounded-lg overflow-hidden hover:bg-opacity-80 transition-all duration-300 group cursor-pointer">
            <div
                onClick={() => openBookReader(book)}
                className="aspect-[2/3] overflow-hidden bg-gray-800"
            >
                {book.cover_url ? (
                    <img
                        src={book.cover_url}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/300x450?text=No+Cover';
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
                        <FiBook size={48} className="text-gray-600" />
                    </div>
                )}
            </div>

            <div className="p-3">
                <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2 h-10">
                    {book.title}
                </h3>
                <p className="text-spotify-light-gray text-xs mb-2 line-clamp-1">
                    {book.author || 'Unknown Author'}
                </p>

                {book.average_rating && (
                    <div className="flex items-center mb-2">
                        <span className="text-yellow-400 text-xs">★</span>
                        <span className="text-white text-xs ml-1">{book.average_rating.toFixed(1)}</span>
                    </div>
                )}

                <button
                    onClick={() => openBookReader(book)}
                    className="w-full flex items-center justify-center gap-2 bg-spotify-green text-spotify-black font-semibold py-2 px-3 rounded-full hover:scale-105 transition-transform text-xs"
                >
                    <FiBookOpen size={14} />
                    <span>Read Now</span>
                </button>
            </div>
        </div>
    );

    const LoadingSkeleton = () => (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                    <div className="bg-gray-700 aspect-[2/3] rounded-lg mb-3"></div>
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                </div>
            ))}
        </div>
    );

    if (loading) {
        return (
            <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">
                        🌍 External Library - Millions of Books
                    </h2>
                </div>
                <LoadingSkeleton />
            </section>
        );
    }

    if (trendingBooks.length === 0) {
        return null; // Don't show section if no books
    }

    return (
        <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                        🌍 Trending Books from External APIs
                    </h2>
                    <p className="text-spotify-light-gray text-sm">
                        Access millions of books from Google Books & Open Library
                    </p>
                </div>
                <Link
                    to="/browse"
                    className="flex items-center space-x-1 text-spotify-green hover:text-green-400 transition-colors font-semibold"
                >
                    <span>Browse All</span>
                    <FiChevronRight size={20} />
                </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {trendingBooks.map((book, index) => (
                    <BookCard key={`${book.external_id}-${index}`} book={book} />
                ))}
            </div>

            {/* Call to Action */}
            <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-center">
                <h3 className="text-2xl font-bold text-white mb-2">
                    📚 Want to Read More?
                </h3>
                <p className="text-blue-100 mb-4">
                    Search millions of books, browse by genre, and read instantly - no download required!
                </p>
                <Link
                    to="/browse"
                    className="inline-flex items-center gap-2 bg-white text-blue-600 font-bold px-8 py-3 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <FiBook size={20} />
                    <span>Explore External Library</span>
                    <FiExternalLink size={16} />
                </Link>
            </div>
        </section>
    );
};

export default ExternalBooksSection;
