import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiX, FiBook, FiUser, FiCalendar, FiStar } from 'react-icons/fi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import BookCard from '../components/BookCard';
import api from '../services/api';
import toast from 'react-hot-toast';

const SearchBooks = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        author: '',
        minYear: '',
        maxYear: '',
        minRating: 0,
        genre: ''
    });
    const [totalResults, setTotalResults] = useState(0);

    useEffect(() => {
        const query = searchParams.get('q');
        if (query) {
            setSearchQuery(query);
            performSearch(query);
        }
    }, [searchParams]);

    const performSearch = async (query = searchQuery, appliedFilters = filters) => {
        if (!query.trim()) {
            toast.error('Please enter a search term');
            return;
        }

        try {
            setLoading(true);
            const res = await api.get('/books/search', {
                params: {
                    q: query,
                    limit: 50,
                    author: appliedFilters.author || undefined,
                    min_year: appliedFilters.minYear || undefined,
                    max_year: appliedFilters.maxYear || undefined,
                    min_rating: appliedFilters.minRating || undefined,
                    genre: appliedFilters.genre || undefined
                }
            });

            const booksData = res.data?.items || res.data?.books || res.data || [];
            setBooks(booksData);
            setTotalResults(booksData.length);

            if (booksData.length === 0) {
                toast.error('No books found. Try a different search term.');
            } else {
                toast.success(`Found ${booksData.length} books!`);
            }
        } catch (error) {
            console.error('Search error:', error);
            toast.error('Search failed. Please try again.');
            setBooks([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setSearchParams({ q: searchQuery });
        performSearch();
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        performSearch(searchQuery, filters);
        setShowFilters(false);
    };

    const clearFilters = () => {
        setFilters({
            author: '',
            minYear: '',
            maxYear: '',
            minRating: 0,
            genre: ''
        });
        performSearch(searchQuery, {
            author: '',
            minYear: '',
            maxYear: '',
            minRating: 0,
            genre: ''
        });
    };

    const hasActiveFilters = filters.author || filters.minYear || filters.maxYear || filters.minRating > 0 || filters.genre;

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                            <FiSearch className="w-12 h-12 text-purple-400" />
                            Search Books
                        </h1>
                        <p className="text-gray-400 text-lg">
                            Search through our collection of {totalResults > 0 ? 'thousands of' : ''} books
                        </p>
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="mb-8">
                        <div className="max-w-3xl mx-auto">
                            <div className="relative">
                                <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
                                <input
                                    type="text"
                                    placeholder="Search by title, author, ISBN, or keywords..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-gray-800/80 border-2 border-gray-700 rounded-2xl pl-16 pr-32 py-5 text-white text-lg placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowFilters(!showFilters)}
                                        className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${showFilters || hasActiveFilters
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            }`}
                                    >
                                        <FiFilter className="w-4 h-4" />
                                        {hasActiveFilters && <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                                    >
                                        {loading ? 'Searching...' : 'Search'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>

                    {/* Filters Panel */}
                    {showFilters && (
                        <div className="max-w-3xl mx-auto mb-8 bg-gray-800/60 border border-gray-700 rounded-2xl p-6 animate-fadeIn">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <FiFilter className="w-5 h-5" />
                                    Advanced Filters
                                </h3>
                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <FiX className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                {/* Author Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        <FiUser className="inline w-4 h-4 mr-1" />
                                        Author
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Filter by author name"
                                        value={filters.author}
                                        onChange={(e) => handleFilterChange('author', e.target.value)}
                                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                    />
                                </div>

                                {/* Genre Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        <FiBook className="inline w-4 h-4 mr-1" />
                                        Genre
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Filter by genre"
                                        value={filters.genre}
                                        onChange={(e) => handleFilterChange('genre', e.target.value)}
                                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                    />
                                </div>

                                {/* Year Range */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        <FiCalendar className="inline w-4 h-4 mr-1" />
                                        Year Range
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            placeholder="From"
                                            value={filters.minYear}
                                            onChange={(e) => handleFilterChange('minYear', e.target.value)}
                                            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                        />
                                        <input
                                            type="number"
                                            placeholder="To"
                                            value={filters.maxYear}
                                            onChange={(e) => handleFilterChange('maxYear', e.target.value)}
                                            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                        />
                                    </div>
                                </div>

                                {/* Minimum Rating */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        <FiStar className="inline w-4 h-4 mr-1" />
                                        Minimum Rating
                                    </label>
                                    <select
                                        value={filters.minRating}
                                        onChange={(e) => handleFilterChange('minRating', parseFloat(e.target.value))}
                                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                    >
                                        <option value="0">Any Rating</option>
                                        <option value="1">1+ Stars</option>
                                        <option value="2">2+ Stars</option>
                                        <option value="3">3+ Stars</option>
                                        <option value="4">4+ Stars</option>
                                        <option value="4.5">4.5+ Stars</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={applyFilters}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all"
                                >
                                    Apply Filters
                                </button>
                                <button
                                    onClick={clearFilters}
                                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all"
                                >
                                    Clear All
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Results Section */}
                    <div>
                        {/* Results Header */}
                        {totalResults > 0 && (
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    Search Results
                                </h2>
                                <p className="text-gray-400">
                                    Found {totalResults} book{totalResults !== 1 ? 's' : ''}
                                    {searchQuery && ` for "${searchQuery}"`}
                                    {hasActiveFilters && ' with filters applied'}
                                </p>
                            </div>
                        )}

                        {/* Loading State */}
                        {loading && (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mb-4"></div>
                                <p className="text-gray-400">Searching books...</p>
                            </div>
                        )}

                        {/* Books Grid */}
                        {!loading && books.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {books.map((book) => (
                                    <BookCard key={book.id} book={book} />
                                ))}
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && books.length === 0 && searchQuery && (
                            <div className="text-center py-20">
                                <div className="text-6xl mb-4">📚</div>
                                <h3 className="text-2xl font-bold text-white mb-2">No Books Found</h3>
                                <p className="text-gray-400 mb-6">
                                    We couldn't find any books matching "{searchQuery}"
                                    {hasActiveFilters && ' with the applied filters'}
                                </p>
                                <div className="flex gap-3 justify-center">
                                    <button
                                        onClick={() => {
                                            setSearchQuery('');
                                            setBooks([]);
                                        }}
                                        className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
                                    >
                                        Clear Search
                                    </button>
                                    {hasActiveFilters && (
                                        <button
                                            onClick={clearFilters}
                                            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
                                        >
                                            Clear Filters
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Initial State */}
                        {!loading && books.length === 0 && !searchQuery && (
                            <div className="text-center py-20">
                                <div className="text-6xl mb-4">🔍</div>
                                <h3 className="text-2xl font-bold text-white mb-2">Start Your Search</h3>
                                <p className="text-gray-400 mb-6">
                                    Enter a book title, author name, ISBN, or keywords to begin
                                </p>
                                <div className="flex gap-3 justify-center flex-wrap">
                                    <button
                                        onClick={() => {
                                            setSearchQuery('fiction');
                                            performSearch('fiction');
                                        }}
                                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-all border border-gray-700"
                                    >
                                        Search "fiction"
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSearchQuery('novel');
                                            performSearch('novel');
                                        }}
                                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-all border border-gray-700"
                                    >
                                        Search "novel"
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSearchQuery('poetry');
                                            performSearch('poetry');
                                        }}
                                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-all border border-gray-700"
                                    >
                                        Search "poetry"
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default SearchBooks;
