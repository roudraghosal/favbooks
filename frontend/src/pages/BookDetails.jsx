import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { booksAPI } from '../services/api';
import ReactMarkdown from 'react-markdown';
import {
    bookResourceMap,
    genreResourceMap,
    evergreenYoutubeChannels,
    mediumSpotlightArticles,
    normalizeKey,
} from '../data/resourceRecommendations';

const BookDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [bookContent, setBookContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isReading, setIsReading] = useState(false);
    const [userRating, setUserRating] = useState(0);
    const [review, setReview] = useState('');
    const [showRatingModal, setShowRatingModal] = useState(false);

    const bookResources = useMemo(() => {
        if (!book?.title) {
            return null;
        }

        return bookResourceMap[normalizeKey(book.title)] || null;
    }, [book]);

    const genreResources = useMemo(() => {
        if (!book?.genres?.length) {
            return [];
        }

        const seen = new Set();
        return book.genres
            .map((genre) => {
                const key = normalizeKey(genre?.name || '');
                if (!key || seen.has(key)) {
                    return null;
                }
                seen.add(key);
                const data = genreResourceMap[key];
                if (!data) {
                    return null;
                }

                return {
                    label: genre.name,
                    ...data,
                };
            })
            .filter(Boolean);
    }, [book]);

    const hasGlobalResources = evergreenYoutubeChannels.length > 0 || mediumSpotlightArticles.length > 0;

    useEffect(() => {
        fetchBookDetails();
    }, [id]);

    const fetchBookDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get(`/books/${id}`);
            setBook(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching book details:', err);
            setError('Failed to load book details');
            setLoading(false);
        }
    };

    const fetchBookContent = async () => {
        try {
            const response = await booksAPI.getBookPreview(id);
            setBookContent(response.data);
            setIsReading(true);
        } catch (err) {
            console.error('Error fetching book content:', err);
            const errorMessage = err.response?.data?.detail || 'Failed to load book preview. Please try again.';
            alert(errorMessage);
        }
    };

    const handleRateBook = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login to rate this book');
            navigate('/login');
            return;
        }

        if (userRating === 0) {
            alert('Please select a rating');
            return;
        }

        try {
            await api.post(
                '/ratings',
                {
                    book_id: parseInt(id),
                    rating: userRating,
                    review: review || null
                }
            );
            alert('Rating submitted successfully!');
            setShowRatingModal(false);
            setUserRating(0);
            setReview('');
            fetchBookDetails(); // Refresh book data
        } catch (err) {
            console.error('Error submitting rating:', err);
            const errorMessage = err.response?.data?.detail || 'Failed to submit rating. Please try again.';
            alert(errorMessage);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    if (error || !book) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-400 text-xl mb-4">{error || 'Book not found'}</div>
                    <button
                        onClick={() => navigate('/books')}
                        className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full"
                    >
                        Back to Books
                    </button>
                </div>
            </div>
        );
    }

    if (isReading && bookContent) {
        return (
            <div className="min-h-screen bg-white">
                {/* Reading Header */}
                <div className="bg-gray-900 text-white p-4 sticky top-0 z-50 shadow-lg">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <button
                            onClick={() => setIsReading(false)}
                            className="flex items-center gap-2 hover:text-green-400 transition"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Exit Reader
                        </button>
                        <div className="text-sm opacity-75">{bookContent.title}</div>
                    </div>
                </div>

                {/* Reading Content */}
                <div className="max-w-4xl mx-auto px-8 py-12">
                    <div className="prose prose-lg max-w-none">
                        <ReactMarkdown>{bookContent.content}</ReactMarkdown>
                    </div>

                    {/* End of Preview CTA */}
                    <div className="mt-16 p-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl text-center border-2 border-green-200">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">End of Preview</h3>
                        <p className="text-gray-600 mb-6">
                            Enjoying this book? Rate it and discover more books you'll love!
                        </p>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => {
                                    setIsReading(false);
                                    setShowRatingModal(true);
                                }}
                                className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-full font-semibold transition"
                            >
                                Rate This Book
                            </button>
                            <button
                                onClick={() => setIsReading(false)}
                                className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-full font-semibold transition"
                            >
                                Back to Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/books')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Books
                </button>

                {/* Book Details Card */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700">
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Book Cover */}
                        <div className="md:col-span-1">
                            <div className="relative group">
                                <img
                                    src={book.cover_image_url || 'https://via.placeholder.com/300x450/1a1a1a/ffffff?text=No+Cover'}
                                    alt={book.title}
                                    className="w-full rounded-xl shadow-2xl transform group-hover:scale-105 transition duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition rounded-xl flex items-end justify-center pb-6">
                                    <button
                                        onClick={fetchBookContent}
                                        className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-full font-semibold transform translate-y-4 group-hover:translate-y-0 transition"
                                    >
                                        📖 Read Preview
                                    </button>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="mt-6 space-y-3">
                                <button
                                    onClick={fetchBookContent}
                                    className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-full font-semibold transition flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    Read Now
                                </button>
                                <button
                                    onClick={() => setShowRatingModal(true)}
                                    className="w-full px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full font-semibold transition flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    Rate Book
                                </button>
                            </div>
                        </div>

                        {/* Book Info */}
                        <div className="md:col-span-2">
                            <h1 className="text-4xl font-bold mb-2">{book.title}</h1>
                            <p className="text-xl text-green-400 mb-4">by {book.author}</p>

                            {/* Rating */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="flex text-yellow-400">
                                        {[...Array(5)].map((_, i) => (
                                            <svg
                                                key={i}
                                                className={`w-6 h-6 ${i < Math.floor(book.average_rating || 0) ? 'fill-current' : 'fill-gray-600'}`}
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <span className="text-2xl font-bold">{(book.average_rating || 0).toFixed(1)}</span>
                                </div>
                                <span className="text-gray-400">({book.rating_count || 0} ratings)</span>
                            </div>

                            {/* Metadata */}
                            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                                {book.publication_year && (
                                    <div className="bg-gray-800/50 rounded-lg p-3">
                                        <div className="text-gray-400 mb-1">Published</div>
                                        <div className="font-semibold">{book.publication_year}</div>
                                    </div>
                                )}
                                {book.isbn && (
                                    <div className="bg-gray-800/50 rounded-lg p-3">
                                        <div className="text-gray-400 mb-1">ISBN</div>
                                        <div className="font-semibold text-xs">{book.isbn}</div>
                                    </div>
                                )}
                                {book.price && (
                                    <div className="bg-gray-800/50 rounded-lg p-3">
                                        <div className="text-gray-400 mb-1">Price</div>
                                        <div className="font-semibold text-green-400">${book.price.toFixed(2)}</div>
                                    </div>
                                )}
                                {book.genres && book.genres.length > 0 && (
                                    <div className="bg-gray-800/50 rounded-lg p-3 col-span-2">
                                        <div className="text-gray-400 mb-2">Genres</div>
                                        <div className="flex flex-wrap gap-2">
                                            {book.genres.map((genre, index) => (
                                                <span key={index} className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                                                    {genre.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <h3 className="text-xl font-bold mb-3">Description</h3>
                                <p className="text-gray-300 leading-relaxed">
                                    {book.description || 'No description available.'}
                                </p>
                            </div>

                            {/* Audio Preview (if available) */}
                            {book.audio_preview_url && (
                                <div className="mt-6">
                                    <h3 className="text-xl font-bold mb-3">Audio Preview</h3>
                                    <audio controls className="w-full">
                                        <source src={book.audio_preview_url} type="audio/mpeg" />
                                        Your browser does not support the audio element.
                                    </audio>
                                </div>
                            )}

                            {(bookResources || genreResources.length > 0) && (
                                <div className="mt-10 space-y-8">
                                    {bookResources && (
                                        <section className="bg-gray-800/40 border border-gray-700 rounded-2xl p-6 space-y-6">
                                            <div>
                                                <h3 className="text-2xl font-bold mb-3">Deep Dives for {book.title}</h3>
                                                <p className="text-sm text-gray-400">
                                                    Curated interviews, reviews, and explainers tailored to this book.
                                                </p>
                                            </div>

                                            {bookResources.insights?.length > 0 && (
                                                <div>
                                                    <h4 className="text-lg font-semibold mb-2 text-green-400">Key Insights</h4>
                                                    <ul className="list-disc list-inside text-gray-300 space-y-2">
                                                        {bookResources.insights.map((insight, index) => (
                                                            <li key={`insight-${index}`}>{insight}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {bookResources.websites?.length > 0 && (
                                                <div>
                                                    <h4 className="text-lg font-semibold mb-3 text-green-400">Essential Guides & Reviews</h4>
                                                    <div className="grid gap-4 md:grid-cols-2">
                                                        {bookResources.websites.map((site, index) => (
                                                            <a
                                                                key={`site-${index}`}
                                                                href={site.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="block bg-gray-900/60 border border-gray-700 rounded-xl p-4 hover:border-green-500 transition"
                                                            >
                                                                <div className="text-lg font-semibold text-white">{site.name}</div>
                                                                <p className="text-sm text-gray-400 mt-1 leading-relaxed">{site.summary}</p>
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {bookResources.youtube?.length > 0 && (
                                                <div>
                                                    <h4 className="text-lg font-semibold mb-3 text-green-400">YouTube Deep Dives</h4>
                                                    <div className="space-y-3">
                                                        {bookResources.youtube.map((video, index) => (
                                                            <a
                                                                key={`yt-${index}`}
                                                                href={video.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-gray-900/60 border border-gray-700 rounded-xl p-4 hover:border-green-500 transition"
                                                            >
                                                                <div>
                                                                    <div className="text-base font-semibold text-white">{video.title}</div>
                                                                    <div className="text-sm text-gray-400">{video.channel}</div>
                                                                    {video.takeaway && (
                                                                        <p className="text-sm text-gray-400 mt-2 leading-relaxed">{video.takeaway}</p>
                                                                    )}
                                                                </div>
                                                                <div className="text-sm text-gray-400 md:text-right">{video.duration || 'Watch now'}</div>
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {bookResources.articles?.length > 0 && (
                                                <div>
                                                    <h4 className="text-lg font-semibold mb-3 text-green-400">Articles & Essays</h4>
                                                    <div className="grid gap-3">
                                                        {bookResources.articles.map((article, index) => (
                                                            <a
                                                                key={`article-${index}`}
                                                                href={article.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="block bg-gray-900/60 border border-gray-700 rounded-xl p-4 hover:border-green-500 transition"
                                                            >
                                                                <div className="text-base font-semibold text-white">{article.title}</div>
                                                                <div className="text-sm text-gray-400 mt-1">{article.outlet}</div>
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </section>
                                    )}

                                    {genreResources.length > 0 && (
                                        <section className="space-y-6">
                                            <h3 className="text-2xl font-bold">Genre Guides</h3>
                                            <div className="text-sm text-gray-400">
                                                Dive deeper into the spaces your book lives in with genre-specific hubs, critical essays, and playlists.
                                            </div>
                                            <div className="grid gap-6">
                                                {genreResources.map((genre) => (
                                                    <div key={genre.label} className="bg-gray-800/40 border border-gray-700 rounded-2xl p-6 space-y-5">
                                                        <div className="flex items-center justify-between flex-wrap gap-3">
                                                            <h4 className="text-xl font-semibold text-green-400">{genre.label} Spotlight</h4>
                                                            {genre.insights?.length > 0 && (
                                                                <span className="text-xs uppercase tracking-wide text-gray-400">Actionable takeaways</span>
                                                            )}
                                                        </div>

                                                        {genre.insights?.length > 0 && (
                                                            <ul className="list-disc list-inside text-gray-300 space-y-2">
                                                                {genre.insights.map((insight, index) => (
                                                                    <li key={`${genre.label}-insight-${index}`}>{insight}</li>
                                                                ))}
                                                            </ul>
                                                        )}

                                                        {genre.websites?.length > 0 && (
                                                            <div>
                                                                <h5 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-2">Trusted Review Hubs</h5>
                                                                <div className="grid gap-3 md:grid-cols-2">
                                                                    {genre.websites.map((site, index) => (
                                                                        <a
                                                                            key={`${genre.label}-site-${index}`}
                                                                            href={site.url}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="block bg-gray-900/60 border border-gray-700 rounded-xl p-4 hover:border-green-500 transition"
                                                                        >
                                                                            <div className="text-base font-semibold text-white">{site.name}</div>
                                                                            <p className="text-sm text-gray-400 mt-1 leading-relaxed">{site.summary}</p>
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {genre.youtube?.length > 0 && (
                                                            <div>
                                                                <h5 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-2">Watch & Learn</h5>
                                                                <div className="space-y-3">
                                                                    {genre.youtube.map((video, index) => (
                                                                        <a
                                                                            key={`${genre.label}-yt-${index}`}
                                                                            href={video.url}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-gray-900/60 border border-gray-700 rounded-xl p-4 hover:border-green-500 transition"
                                                                        >
                                                                            <div>
                                                                                <div className="text-base font-semibold text-white">{video.title}</div>
                                                                                <div className="text-sm text-gray-400">{video.channel}</div>
                                                                            </div>
                                                                            <div className="text-sm text-gray-400 md:text-right">{video.duration || 'Watch now'}</div>
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {genre.articles?.length > 0 && (
                                                            <div>
                                                                <h5 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-2">Longform Analysis</h5>
                                                                <div className="grid gap-3">
                                                                    {genre.articles.map((article, index) => (
                                                                        <a
                                                                            key={`${genre.label}-article-${index}`}
                                                                            href={article.url}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="block bg-gray-900/60 border border-gray-700 rounded-xl p-4 hover:border-green-500 transition"
                                                                        >
                                                                            <div className="text-base font-semibold text-white">{article.title}</div>
                                                                            <div className="text-sm text-gray-400 mt-1">{article.outlet}</div>
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {hasGlobalResources && (
                    <section className="mt-12 space-y-10">
                        <div className="bg-gray-800/40 border border-gray-700 rounded-2xl p-6">
                            <h3 className="text-2xl font-bold mb-4">BookTube Channels Worth Subscribing To</h3>
                            <p className="text-sm text-gray-400 mb-6">
                                Trusted creators that consistently deliver spoiler-aware, high-signal book recommendations across genres.
                            </p>
                            <div className="grid gap-4 md:grid-cols-2">
                                {evergreenYoutubeChannels.map((channel) => (
                                    <a
                                        key={channel.name}
                                        href={channel.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block bg-gray-900/60 border border-gray-700 rounded-xl p-4 hover:border-green-500 transition"
                                    >
                                        <div className="text-lg font-semibold text-white">{channel.name}</div>
                                        <p className="text-sm text-gray-400 mt-1 leading-relaxed">{channel.focus}</p>
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gray-800/40 border border-gray-700 rounded-2xl p-6">
                            <h3 className="text-2xl font-bold mb-4">Medium Spotlights to Pair with Your Reading</h3>
                            <p className="text-sm text-gray-400 mb-6">
                                Essays to fuel reading habits, annotation strategies, and reflective note-taking.
                            </p>
                            <div className="grid gap-4 md:grid-cols-2">
                                {mediumSpotlightArticles.map((article) => (
                                    <a
                                        key={article.url}
                                        href={article.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block bg-gray-900/60 border border-gray-700 rounded-xl p-4 hover:border-green-500 transition"
                                    >
                                        <div className="text-lg font-semibold text-white">{article.title}</div>
                                        <div className="text-sm text-gray-400 mt-1">by {article.author}</div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </div>

            {/* Rating Modal */}
            {showRatingModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full border border-gray-700">
                        <h2 className="text-2xl font-bold mb-6">Rate {book.title}</h2>

                        {/* Star Rating */}
                        <div className="mb-6">
                            <label className="block text-sm text-gray-400 mb-3">Your Rating</label>
                            <div className="flex gap-2 justify-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setUserRating(star)}
                                        className="focus:outline-none transform hover:scale-110 transition"
                                    >
                                        <svg
                                            className={`w-12 h-12 ${star <= userRating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    </button>
                                ))}
                            </div>
                            <div className="text-center mt-2 text-xl font-bold text-yellow-400">
                                {userRating > 0 ? `${userRating} Star${userRating > 1 ? 's' : ''}` : 'Select a rating'}
                            </div>
                        </div>

                        {/* Review */}
                        <div className="mb-6">
                            <label className="block text-sm text-gray-400 mb-2">Review (Optional)</label>
                            <textarea
                                value={review}
                                onChange={(e) => setReview(e.target.value)}
                                placeholder="Share your thoughts about this book..."
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none resize-none"
                                rows="4"
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowRatingModal(false);
                                    setUserRating(0);
                                    setReview('');
                                }}
                                className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRateBook}
                                disabled={userRating === 0}
                                className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition"
                            >
                                Submit Rating
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookDetails;
