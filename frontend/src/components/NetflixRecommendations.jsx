import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiStar, FiInfo, FiBook } from 'react-icons/fi';
import { recommendationsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const NetflixBookRecommendations = () => {
    const { user, isAuthenticated } = useAuth();
    const [recommendationRows, setRecommendationRows] = useState({});
    const [loading, setLoading] = useState({});
    const [errors, setErrors] = useState({});

    // All 15 recommendation systems
    const recommendationSystems = [
        {
            id: 'popularity',
            title: '⭐ Most Popular Books',
            description: 'Top-rated books loved by our community',
            strategy: 'popularity',
            color: 'from-yellow-500 to-orange-500'
        },
        {
            id: 'trending',
            title: '🔥 Trending Now',
            description: 'What everyone is reading this week',
            strategy: 'trending',
            color: 'from-red-500 to-pink-500'
        },
        {
            id: 'content',
            title: '📚 Because You Liked...',
            description: 'Books similar to your favorites',
            strategy: 'content',
            color: 'from-blue-500 to-cyan-500'
        },
        {
            id: 'collaborative',
            title: '👥 Readers Like You Enjoyed',
            description: 'Based on similar readers\' preferences',
            strategy: 'collaborative',
            color: 'from-purple-500 to-indigo-500'
        },
        {
            id: 'hybrid',
            title: '🎯 Personalized For You',
            description: 'AI-powered smart recommendations',
            strategy: null, // hybrid is default
            color: 'from-green-500 to-emerald-500'
        },
        {
            id: 'morning',
            title: '🌅 Perfect Morning Reads',
            description: 'Start your day with these books',
            strategy: 'context',
            context: 'morning',
            color: 'from-amber-400 to-yellow-500'
        },
        {
            id: 'evening',
            title: '🌆 Evening Relaxation',
            description: 'Unwind with these evening picks',
            strategy: 'context',
            context: 'evening',
            color: 'from-violet-500 to-purple-600'
        },
        {
            id: 'adventurous',
            title: '🗺️ For The Adventurous Spirit',
            description: 'Thrilling adventures await',
            strategy: 'quiz',
            personality: 'adventurous',
            color: 'from-teal-500 to-cyan-600'
        },
        {
            id: 'intellectual',
            title: '🧠 Intellectually Stimulating',
            description: 'Expand your mind',
            strategy: 'quiz',
            personality: 'intellectual',
            color: 'from-indigo-500 to-blue-600'
        },
        {
            id: 'romantic',
            title: '💕 Romantic Escapes',
            description: 'Love stories that touch the heart',
            strategy: 'quiz',
            personality: 'romantic',
            color: 'from-pink-500 to-rose-600'
        },
        {
            id: 'association',
            title: '🔗 Frequently Read Together',
            description: 'Books that pair perfectly',
            strategy: 'association',
            color: 'from-lime-500 to-green-600'
        },
        {
            id: 'demographic',
            title: '📊 Popular In Your Group',
            description: 'What your demographic loves',
            strategy: 'demographic',
            color: 'from-fuchsia-500 to-pink-600'
        },
        {
            id: 'weekend',
            title: '🎉 Weekend Binge-Worthy',
            description: 'Perfect for your weekend reading',
            strategy: 'context',
            context: 'weekend',
            color: 'from-orange-500 to-red-500'
        },
        {
            id: 'creative',
            title: '🎨 For Creative Minds',
            description: 'Inspire your creativity',
            strategy: 'quiz',
            personality: 'creative',
            color: 'from-rose-500 to-pink-500'
        },
        {
            id: 'analytical',
            title: '🔬 For Analytical Thinkers',
            description: 'Mystery, logic, and discovery',
            strategy: 'quiz',
            personality: 'analytical',
            color: 'from-cyan-500 to-blue-500'
        }
    ];

    const loadAllRecommendations = useCallback(async () => {
        // Load all recommendation systems in parallel
        const promises = recommendationSystems.map(system =>
            loadRecommendations(system)
        );

        await Promise.allSettled(promises);
    }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (isAuthenticated() && user) {
            loadAllRecommendations();
        }
    }, [isAuthenticated, user, loadAllRecommendations]);

    const loadRecommendations = async (system) => {
        if (!user) return;

        setLoading(prev => ({ ...prev, [system.id]: true }));
        setErrors(prev => ({ ...prev, [system.id]: null }));

        try {
            const params = {
                n_recommendations: 12
            };

            if (system.strategy) params.strategy = system.strategy;
            if (system.context) params.context = system.context;
            if (system.personality) params.personality = system.personality;

            const response = await recommendationsAPI.getUserRecommendations(
                user.id,
                12,
                params
            );

            setRecommendationRows(prev => ({
                ...prev,
                [system.id]: response.data || []
            }));
        } catch (error) {
            console.error(`Error loading ${system.id} recommendations:`, error);
            setErrors(prev => ({
                ...prev,
                [system.id]: 'Unable to load recommendations'
            }));
        } finally {
            setLoading(prev => ({ ...prev, [system.id]: false }));
        }
    };

    if (!isAuthenticated() || !user) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center px-4">
                <div className="max-w-2xl text-center">
                    <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                        Unlimited books, personalized for you.
                    </h2>
                    <p className="text-xl text-gray-300 mb-8">
                        Sign in to unlock 15 AI-powered recommendation systems tailored to your reading taste.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link
                            to="/login"
                            className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white text-lg font-semibold rounded-lg transition"
                        >
                            Sign In
                        </Link>
                        <Link
                            to="/register"
                            className="px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white text-lg font-semibold rounded-lg transition"
                        >
                            Create Account
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 pb-20">
            {/* Hero Section */}
            <div className="relative h-[60vh] md:h-[70vh] overflow-hidden mb-12 md:mb-16">
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />

                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-indigo-900/30 to-blue-900/40" />

                <div className="relative z-20 h-full flex items-center px-4 md:px-8 lg:px-16 xl:px-24">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-5 md:mb-6 leading-tight">
                            Your Personal
                            <span className="block bg-gradient-to-r from-green-400 via-emerald-500 to-blue-500 bg-clip-text text-transparent mt-2">
                                Reading Universe
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl lg:text-2xl text-gray-300 mb-10 md:mb-12 leading-relaxed">
                            Discover books tailored to your taste with 15 AI-powered recommendation engines
                        </p>
                        <div className="flex flex-wrap gap-3 md:gap-4">
                            <button className="px-6 md:px-8 py-3 md:py-4 bg-white text-black font-bold text-base md:text-lg rounded-md hover:bg-gray-200 transition flex items-center gap-2 shadow-lg">
                                <FiInfo size={20} />
                                More Info
                            </button>
                            <Link
                                to="/browse"
                                className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-base md:text-lg rounded-md transition flex items-center gap-2 shadow-lg"
                            >
                                <FiBook size={20} />
                                Browse 60M+ External Books
                            </Link>
                            <Link
                                to="/search"
                                className="px-6 md:px-8 py-3 md:py-4 bg-gray-700/80 hover:bg-gray-600/80 text-white font-bold text-base md:text-lg rounded-md transition flex items-center gap-2 shadow-lg"
                            >
                                Browse All Books
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recommendation Rows */}
            <div className="relative z-30 -mt-16 md:-mt-24 space-y-10 md:space-y-12">
                {recommendationSystems.map((system) => (
                    <RecommendationRow
                        key={system.id}
                        system={system}
                        books={recommendationRows[system.id] || []}
                        loading={loading[system.id]}
                        error={errors[system.id]}
                    />
                ))}
            </div>
        </div>
    );
};

const RecommendationRow = ({ system, books, loading, error }) => {
    const scrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    useEffect(() => {
        checkScroll();
    }, [books]);

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = scrollRef.current.clientWidth * 0.8;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
            setTimeout(checkScroll, 300);
        }
    };

    return (
        <div className="px-4 md:px-8 lg:px-16 xl:px-24 group">
            {/* Row Header */}
            <div className="mb-4">
                <h2 className={`text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r ${system.color} bg-clip-text text-transparent mb-1`}>
                    {system.title}
                </h2>
                <p className="text-xs md:text-sm text-gray-400">{system.description}</p>
            </div>

            {/* Books Container */}
            <div className="relative">
                {/* Scroll Left Button */}
                {canScrollLeft && (
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-black/90 hover:bg-black text-white p-2 md:p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl"
                        style={{ marginLeft: '-12px' }}
                        aria-label="Scroll left"
                    >
                        <FiChevronLeft size={24} />
                    </button>
                )}

                {/* Scroll Right Button */}
                {canScrollRight && (
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-black/90 hover:bg-black text-white p-2 md:p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl"
                        style={{ marginRight: '-12px' }}
                        aria-label="Scroll right"
                    >
                        <FiChevronRight size={24} />
                    </button>
                )}

                {/* Books Scroll Container */}
                <div
                    ref={scrollRef}
                    onScroll={checkScroll}
                    className="flex gap-2 md:gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {loading ? (
                        // Loading skeletons
                        Array.from({ length: 8 }).map((_, i) => (
                            <div
                                key={i}
                                className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[200px] lg:w-[220px]"
                            >
                                <div className="animate-pulse">
                                    <div className="bg-gray-800 aspect-[2/3] rounded-lg mb-2" />
                                    <div className="h-4 bg-gray-800 rounded w-3/4 mb-2" />
                                    <div className="h-3 bg-gray-800 rounded w-1/2" />
                                </div>
                            </div>
                        ))
                    ) : error ? (
                        // Error state
                        <div className="w-full py-8 md:py-12 text-center text-gray-500">
                            <p className="text-sm md:text-base">{error}</p>
                            <p className="text-xs md:text-sm mt-2">Try rating some books to get better recommendations</p>
                        </div>
                    ) : books.length > 0 ? (
                        // Book cards
                        books.map((book) => (
                            <NetflixBookCard
                                key={book.id}
                                book={book}
                                gradientColor={system.color}
                            />
                        ))
                    ) : (
                        // Empty state
                        <div className="w-full py-8 md:py-12 text-center text-gray-500">
                            <p className="text-sm md:text-base">No recommendations yet</p>
                            <p className="text-xs md:text-sm mt-2">Rate some books to see personalized recommendations</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const NetflixBookCard = ({ book, gradientColor }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Link
            to={`/books/${book.id}`}
            className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[200px] lg:w-[220px] group relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative overflow-hidden rounded-lg transition-all duration-300 transform group-hover:scale-110 group-hover:z-10 group-hover:shadow-2xl">
                {/* Book Cover */}
                <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-gray-800">
                    <img
                        src={book.cover_image_url || 'https://via.placeholder.com/220x330/1a1a1a/ffffff?text=No+Cover'}
                        alt={book.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />

                    {/* Gradient Overlay on Hover */}
                    <div className={`absolute inset-0 bg-gradient-to-t ${gradientColor} opacity-0 group-hover:opacity-30 transition-opacity duration-300`} />

                    {/* Match Score Badge */}
                    {book.recommendation_score && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                            {(book.recommendation_score * 100).toFixed(0)}%
                        </div>
                    )}
                </div>

                {/* Book Info */}
                <div className="mt-2 px-1">
                    <h3 className="text-white font-semibold text-xs md:text-sm line-clamp-2 mb-1 group-hover:text-green-400 transition leading-tight">
                        {book.title}
                    </h3>
                    <p className="text-gray-400 text-[10px] md:text-xs line-clamp-1">{book.author}</p>

                    {/* Rating */}
                    {book.average_rating > 0 && (
                        <div className="flex items-center gap-1 text-[10px] md:text-xs mt-1">
                            <FiStar className="text-yellow-400 fill-yellow-400" size={12} />
                            <span className="text-yellow-400 font-semibold">
                                {book.average_rating.toFixed(1)}
                            </span>
                            <span className="text-gray-500 text-[9px] md:text-[10px]">
                                ({book.rating_count})
                            </span>
                        </div>
                    )}
                </div>

                {/* Hover Card - Expanded Info */}
                {isHovered && (
                    <div className="absolute top-full left-0 mt-2 w-[260px] md:w-[300px] bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-2xl z-50 hidden lg:block">
                        <h4 className="text-white font-bold text-sm mb-2 line-clamp-2">{book.title}</h4>
                        <p className="text-gray-300 text-xs mb-3 line-clamp-4 leading-relaxed">
                            {book.description || 'No description available.'}
                        </p>

                        {/* Genres */}
                        {book.genres && book.genres.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                                {book.genres.slice(0, 3).map((genre, i) => (
                                    <span
                                        key={i}
                                        className="text-[10px] px-2 py-1 bg-gray-800 text-gray-300 rounded-full"
                                    >
                                        {genre.name}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Why Recommended */}
                        {book.recommendation_score && (
                            <p className="text-xs text-green-400 italic flex items-center gap-1">
                                <span>✨</span>
                                <span>{(book.recommendation_score * 100).toFixed(0)}% match based on your preferences</span>
                            </p>
                        )}
                    </div>
                )}
            </div>
        </Link>
    );
};

export default NetflixBookRecommendations;
