import React, { useState, useEffect } from 'react';
import { FiSearch, FiBook, FiExternalLink, FiBookOpen } from 'react-icons/fi';
import { booksAPI } from '../services/api';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

const BrowseExternal = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [trendingBooks, setTrendingBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('trending'); // trending, search, genres
    const [selectedGenre, setSelectedGenre] = useState('fiction');
    const [genreBooks, setGenreBooks] = useState([]);

    const genres = [
        'Fiction', 'Non-Fiction', 'Science Fiction', 'Fantasy', 'Mystery',
        'Romance', 'Thriller', 'Biography', 'History', 'Self-Help',
        'Technology', 'Science', 'Philosophy', 'Poetry', 'Drama'
    ];

    useEffect(() => {
        loadTrendingBooks();
    }, []);

    const loadTrendingBooks = async () => {
        try {
            setLoading(true);
            const response = await booksAPI.getTrending();
            setTrendingBooks(response.data || []);
        } catch (error) {
            console.error('Error loading trending books:', error);
            toast.error('Could not load trending books');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            toast.error('Please enter a search query');
            return;
        }

        try {
            setLoading(true);
            setActiveTab('search');
            const response = await booksAPI.searchExternal(searchQuery, 'both', 40);
            setSearchResults(response.data || []);
            if (response.data.length === 0) {
                toast.info('No books found. Try a different search term.');
            }
        } catch (error) {
            console.error('Error searching books:', error);
            toast.error('Search failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const loadGenreBooks = async (genre) => {
        try {
            setLoading(true);
            setSelectedGenre(genre);
            setActiveTab('genres');
            const response = await booksAPI.getByGenre(genre, 40);
            setGenreBooks(response.data || []);
        } catch (error) {
            console.error('Error loading genre books:', error);
            toast.error('Could not load books for this genre');
        } finally {
            setLoading(false);
        }
    };

    const openBookReader = (book) => {
        // Open book in new tab for reading
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
        <div className="bg-spotify-gray rounded-lg overflow-hidden hover:bg-opacity-80 transition-all duration-300 group">
            <div className="aspect-[2/3] overflow-hidden bg-gray-800">
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

            <div className="p-4">
                <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2 h-10">
                    {book.title}
                </h3>
                <p className="text-spotify-light-gray text-xs mb-2 line-clamp-1">
                    {book.author || 'Unknown Author'}
                </p>

                {book.average_rating && (
                    <div className="flex items-center mb-3">
                        <span className="text-yellow-400 text-xs">★</span>
                        <span className="text-white text-xs ml-1">{book.average_rating.toFixed(1)}</span>
                        {book.ratings_count && (
                            <span className="text-spotify-light-gray text-xs ml-1">
                                ({book.ratings_count})
                            </span>
                        )}
                    </div>
                )}

                {book.description && (
                    <p className="text-spotify-light-gray text-xs mb-3 line-clamp-3">
                        {book.description}
                    </p>
                )}

                <div className="flex gap-2">
                    <button
                        onClick={() => openBookReader(book)}
                        className="flex-1 flex items-center justify-center gap-2 bg-spotify-green text-spotify-black font-semibold py-2 px-3 rounded-full hover:scale-105 transition-transform text-sm"
                    >
                        <FiBookOpen size={14} />
                        <span>Read</span>
                    </button>

                    {book.info_link && (
                        <button
                            onClick={() => window.open(book.info_link, '_blank')}
                            className="flex items-center justify-center bg-spotify-gray-light text-white py-2 px-3 rounded-full hover:bg-opacity-80 transition-colors"
                            title="More Info"
                        >
                            <FiExternalLink size={14} />
                        </button>
                    )}
                </div>

                <div className="mt-2 text-xs text-spotify-light-gray">
                    Source: {book.source === 'google_books' ? '📚 Google Books' : '📖 Open Library'}
                </div>
            </div>
        </div>
    );

    const LoadingSkeleton = () => (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                    <div className="bg-gray-700 aspect-[2/3] rounded-lg mb-3"></div>
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                </div>
            ))}
        </div>
    );

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        📚 Browse External Books
                    </h1>
                    <p className="text-spotify-light-gray">
                        Explore millions of books from Google Books and Open Library. Read previews instantly!
                    </p>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="mb-8">
                    <div className="relative max-w-2xl">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for books, authors, ISBN..."
                            className="w-full bg-spotify-gray text-white pl-12 pr-4 py-4 rounded-full focus:outline-none focus:ring-2 focus:ring-spotify-green"
                        />
                        <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-spotify-light-gray" size={20} />
                        <button
                            type="submit"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-spotify-green text-spotify-black font-semibold px-6 py-2 rounded-full hover:scale-105 transition-transform"
                        >
                            Search
                        </button>
                    </div>
                </form>

                {/* Tabs */}
                <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
                    <button
                        onClick={() => setActiveTab('trending')}
                        className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-colors ${activeTab === 'trending'
                            ? 'bg-spotify-green text-spotify-black'
                            : 'bg-spotify-gray text-white hover:bg-opacity-80'
                            }`}
                    >
                        🔥 Trending
                    </button>
                    <button
                        onClick={() => setActiveTab('search')}
                        className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-colors ${activeTab === 'search'
                            ? 'bg-spotify-green text-spotify-black'
                            : 'bg-spotify-gray text-white hover:bg-opacity-80'
                            }`}
                        disabled={searchResults.length === 0}
                    >
                        🔍 Search Results
                    </button>
                    <button
                        onClick={() => setActiveTab('genres')}
                        className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-colors ${activeTab === 'genres'
                            ? 'bg-spotify-green text-spotify-black'
                            : 'bg-spotify-gray text-white hover:bg-opacity-80'
                            }`}
                    >
                        🎭 Genres
                    </button>
                </div>

                {/* Genre Pills (shown when genres tab is active) */}
                {activeTab === 'genres' && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {genres.map((genre) => (
                            <button
                                key={genre}
                                onClick={() => loadGenreBooks(genre)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedGenre.toLowerCase() === genre.toLowerCase()
                                    ? 'bg-spotify-green text-spotify-black'
                                    : 'bg-spotify-gray text-white hover:bg-opacity-80'
                                    }`}
                            >
                                {genre}
                            </button>
                        ))}
                    </div>
                )}

                {/* Content */}
                <div className="mt-8">
                    {loading ? (
                        <LoadingSkeleton />
                    ) : (
                        <>
                            {activeTab === 'trending' && (
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-6">
                                        Trending Books Right Now
                                    </h2>
                                    {trendingBooks.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                            {trendingBooks.map((book, index) => (
                                                <BookCard key={`${book.external_id}-${index}`} book={book} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-spotify-light-gray">
                                            <FiBook size={48} className="mx-auto mb-4 opacity-50" />
                                            <p>No trending books available at the moment.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'search' && (
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-6">
                                        Search Results for "{searchQuery}"
                                    </h2>
                                    {searchResults.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                            {searchResults.map((book, index) => (
                                                <BookCard key={`${book.external_id}-${index}`} book={book} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-spotify-light-gray">
                                            <FiSearch size={48} className="mx-auto mb-4 opacity-50" />
                                            <p>No results found. Try a different search term.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'genres' && (
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-6 capitalize">
                                        {selectedGenre} Books
                                    </h2>
                                    {genreBooks.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                            {genreBooks.map((book, index) => (
                                                <BookCard key={`${book.external_id}-${index}`} book={book} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-spotify-light-gray">
                                            <FiBook size={48} className="mx-auto mb-4 opacity-50" />
                                            <p>No books found for this genre. Try another one!</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Info Box */}
                <div className="mt-12 bg-gradient-to-r from-spotify-green to-green-400 rounded-2xl p-6 text-center">
                    <h3 className="text-2xl font-bold text-spotify-black mb-2">
                        📖 How to Read Books
                    </h3>
                    <p className="text-green-900 mb-4">
                        Click the "Read" button to open book previews from Google Books or Open Library.
                        Many books offer full previews or sample chapters you can read instantly!
                    </p>
                    <div className="flex gap-4 justify-center text-sm text-green-900">
                        <span>✅ Instant Access</span>
                        <span>✅ No Download Required</span>
                        <span>✅ Millions of Books</span>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default BrowseExternal;
