import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { bookResourceMap, genreResourceMap, normalizeKey } from '../data/resourceRecommendations';
import { Link } from 'react-router-dom';
import { FiSearch, FiTwitter, FiInstagram, FiThumbsUp, FiMessageCircle, FiExternalLink } from 'react-icons/fi';

const Resources = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBook, setSelectedBook] = useState(null);
    const [socialReviews, setSocialReviews] = useState([]);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                // Request more books with pagination
                const res = await api.get('/books', {
                    params: {
                        page: 1,
                        size: 100,
                        sort_by: 'rating',
                        sort_order: 'desc'
                    }
                });
                console.log('Books API Response:', res.data);

                // Handle paginated response structure
                const booksData = res.data?.items || [];

                console.log('Extracted books:', booksData.length, 'books');
                setBooks(booksData);
            } catch (err) {
                console.error('Failed to load books for resources page', err);
                setError('Could not load books');
                setBooks([]); // Ensure books is always an array
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // Mock social media reviews data (in production, this would come from an API)
    const generateSocialReviews = (bookTitle) => {
        const mockReviews = [
            {
                id: 1,
                platform: 'twitter',
                username: 'BookLover2024',
                avatar: 'https://i.pravatar.cc/150?img=1',
                text: `Just finished reading "${bookTitle}" and WOW! This book completely changed my perspective. The character development is absolutely stunning! 📚✨ #BookReview #MustRead`,
                likes: 234,
                comments: 45,
                timestamp: '2 hours ago',
                rating: 5
            },
            {
                id: 2,
                platform: 'instagram',
                username: 'ReadingCorner',
                avatar: 'https://i.pravatar.cc/150?img=2',
                text: `"${bookTitle}" is a masterpiece! The writing style is beautiful and the plot keeps you hooked from start to finish. Highly recommend! 🌟📖`,
                likes: 567,
                comments: 89,
                timestamp: '5 hours ago',
                rating: 5
            },
            {
                id: 3,
                platform: 'twitter',
                username: 'LiteraryNerd',
                avatar: 'https://i.pravatar.cc/150?img=3',
                text: `Review of "${bookTitle}": Great themes and beautiful prose. Some pacing issues in the middle, but overall a solid read. 4/5 stars! #BookTwitter`,
                likes: 123,
                comments: 28,
                timestamp: '1 day ago',
                rating: 4
            },
            {
                id: 4,
                platform: 'instagram',
                username: 'BookwormLife',
                avatar: 'https://i.pravatar.cc/150?img=4',
                text: `Can't stop thinking about "${bookTitle}"! The ending left me speechless. This is going straight to my favorites shelf! 💕📚 #Bookstagram`,
                likes: 892,
                comments: 156,
                timestamp: '2 days ago',
                rating: 5
            },
            {
                id: 5,
                platform: 'twitter',
                username: 'ClassicReads',
                avatar: 'https://i.pravatar.cc/150?img=5',
                text: `"${bookTitle}" - A powerful narrative that stays with you long after you finish. Tackles important themes with grace and insight. Recommended! 👏`,
                likes: 445,
                comments: 67,
                timestamp: '3 days ago',
                rating: 5
            },
            {
                id: 6,
                platform: 'instagram',
                username: 'PageTurner',
                avatar: 'https://i.pravatar.cc/150?img=6',
                text: `Just added "${bookTitle}" to my top 10 of the year! The emotional depth and storytelling are incredible. A must-read for everyone! 🎭✨`,
                likes: 678,
                comments: 94,
                timestamp: '4 days ago',
                rating: 5
            }
        ];
        return mockReviews;
    };

    const handleSearchBook = (book) => {
        setSelectedBook(book);
        setSocialReviews(generateSocialReviews(book.title));
    };

    const filteredBooks = books.filter(book =>
        book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    console.log('Resources Debug:', {
        totalBooks: books.length,
        searchQuery,
        filteredCount: filteredBooks.length,
        sampleBook: books[0]
    });

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading resources…</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
            <div className="text-center text-red-400">{error}</div>
        </div>
    );

    const genreKeys = Object.keys(genreResourceMap);
    const booksArray = Array.isArray(books) ? books : [];

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white py-8">
            <div className="max-w-6xl mx-auto px-4">
                <h1 className="text-3xl font-bold mb-4">Resource Hub</h1>
                <p className="text-gray-400 mb-8">Curated websites, articles, videos, and social media reviews grouped by book and genre.</p>

                {/* Social Media Reviews Section */}
                <section className="mb-12 bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border border-purple-700/50 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="text-4xl">💬</div>
                        <div>
                            <h2 className="text-2xl font-semibold">Social Media Reviews</h2>
                            <p className="text-gray-400 text-sm">Search for a book to see what readers are saying on social media</p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative mb-6">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search for a book to see social media reviews..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-800/60 border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                        />
                    </div>

                    {/* Search Results */}
                    {searchQuery && (
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-gray-400 mb-3">
                                Search Results ({filteredBooks.length})
                            </h3>
                            {filteredBooks.length > 0 ? (
                                <div className="grid gap-2 max-h-60 overflow-y-auto">
                                    {filteredBooks.slice(0, 5).map((book) => (
                                        <button
                                            key={book.id}
                                            onClick={() => {
                                                handleSearchBook(book);
                                                setSearchQuery(''); // Clear search after selection
                                            }}
                                            className="flex items-center gap-3 p-3 bg-gray-800/60 hover:bg-gray-700/60 rounded-lg transition-all text-left border border-gray-700 hover:border-purple-500"
                                        >
                                            <img
                                                src={book.cover_image_url || 'https://via.placeholder.com/50x70'}
                                                alt={book.title}
                                                className="w-12 h-16 object-cover rounded"
                                            />
                                            <div className="flex-1">
                                                <div className="font-semibold text-white">{book.title}</div>
                                                <div className="text-sm text-gray-400">by {book.author}</div>
                                            </div>
                                            <FiSearch className="text-purple-400 w-5 h-5" />
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-gray-800/40 border border-gray-700 rounded-lg p-6 text-center">
                                    <div className="text-4xl mb-2">📚</div>
                                    <p className="text-gray-400">No books found matching "{searchQuery}"</p>
                                    <p className="text-gray-500 text-sm mt-1">Try a different search term</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Social Reviews Display */}
                    {selectedBook && (
                        <div className="border-t border-gray-700/50 pt-6">
                            <div className="flex items-center gap-4 mb-6">
                                <img
                                    src={selectedBook.cover_image_url || 'https://via.placeholder.com/80x120'}
                                    alt={selectedBook.title}
                                    className="w-20 h-28 object-cover rounded-lg shadow-xl"
                                />
                                <div>
                                    <h3 className="text-2xl font-bold text-white">{selectedBook.title}</h3>
                                    <p className="text-gray-400">by {selectedBook.author}</p>
                                    <p className="text-sm text-purple-400 mt-1">{socialReviews.length} social media reviews found</p>
                                </div>
                            </div>

                            {/* Reviews Grid */}
                            <div className="grid gap-4 md:grid-cols-2">
                                {socialReviews.map((review) => (
                                    <div key={review.id} className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 hover:border-purple-500/50 transition-all">
                                        <div className="flex items-start gap-3 mb-3">
                                            <img
                                                src={review.avatar}
                                                alt={review.username}
                                                className="w-10 h-10 rounded-full"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-white">@{review.username}</span>
                                                    {review.platform === 'twitter' ? (
                                                        <FiTwitter className="w-4 h-4 text-blue-400" />
                                                    ) : (
                                                        <FiInstagram className="w-4 h-4 text-pink-400" />
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500">{review.timestamp}</div>
                                            </div>
                                            <div className="flex gap-1">
                                                {[...Array(review.rating)].map((_, i) => (
                                                    <span key={i} className="text-yellow-400">⭐</span>
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-gray-300 text-sm mb-3">{review.text}</p>
                                        <div className="flex items-center gap-4 text-gray-400 text-sm">
                                            <div className="flex items-center gap-1">
                                                <FiThumbsUp className="w-4 h-4" />
                                                <span>{review.likes}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <FiMessageCircle className="w-4 h-4" />
                                                <span>{review.comments}</span>
                                            </div>
                                            <button className="ml-auto flex items-center gap-1 text-purple-400 hover:text-purple-300">
                                                <FiExternalLink className="w-4 h-4" />
                                                <span>View Post</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {!selectedBook && !searchQuery && (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">🔍</div>
                            <p className="text-gray-400">Search for a book to see social media reviews and discussions</p>
                        </div>
                    )}
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-semibold mb-4">Books</h2>
                    {booksArray.length === 0 ? (
                        <p className="text-gray-400">No books available yet.</p>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {booksArray.map((b) => {
                                const key = normalizeKey(b.title || '');
                                const resources = bookResourceMap[key];
                                return (
                                    <div key={b.id} className="bg-gray-800/40 border border-gray-700 rounded-xl p-4">
                                        <div className="flex items-start gap-4">
                                            <img src={b.cover_image_url || 'https://via.placeholder.com/80x120'} alt={b.title} className="w-20 h-28 object-cover rounded" />
                                            <div className="flex-1">
                                                <Link to={`/books/${b.id}`} className="text-lg font-semibold hover:underline">{b.title}</Link>
                                                <div className="text-sm text-gray-400">by {b.author}</div>
                                                {resources ? (
                                                    <div className="mt-3 text-sm">
                                                        <div className="text-green-400 font-semibold">Curated resources available</div>
                                                        <div className="mt-2 flex gap-2">
                                                            {resources.websites?.slice(0, 2).map((w, i) => (
                                                                <a key={i} href={w.url} target="_blank" rel="noreferrer" className="text-sm text-gray-300 hover:underline">{w.name}</a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="mt-3 text-sm text-gray-400">No curated resources for this title yet.</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Genres</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        {genreKeys.map((k) => {
                            const g = genreResourceMap[k];
                            return (
                                <div key={k} className="bg-gray-800/40 border border-gray-700 rounded-xl p-4">
                                    <h3 className="text-lg font-semibold text-green-400">{k.replace(/-/g, ' ')}</h3>
                                    {g.summary && <p className="text-sm text-gray-400">{g.summary}</p>}
                                    {g.websites && (
                                        <div className="mt-3">
                                            <div className="text-sm font-semibold text-white mb-2">Trusted websites</div>
                                            <ul className="text-sm text-gray-300 list-disc list-inside">
                                                {g.websites.map((w, i) => (
                                                    <li key={i}><a href={w.url} target="_blank" rel="noreferrer" className="hover:underline">{w.name}</a> — <span className="text-gray-400">{w.summary}</span></li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Resources;
