import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiStar, FiPlay, FiPause } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { wishlistAPI } from '../services/api';
import toast from 'react-hot-toast';

const BookCard = ({ book, showRemoveFromWishlist = false, onWishlistChange }) => {
    const { isAuthenticated, user } = useAuth();
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audio, setAudio] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleWishlistToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated()) {
            toast.error('Please login to add books to your wishlist');
            return;
        }

        setLoading(true);
        try {
            if (showRemoveFromWishlist || isInWishlist) {
                await wishlistAPI.removeFromWishlist(book.id);
                setIsInWishlist(false);
                toast.success('Removed from wishlist');
                if (onWishlistChange) {
                    onWishlistChange(book.id, 'remove');
                }
            } else {
                await wishlistAPI.addToWishlist(book.id);
                setIsInWishlist(true);
                toast.success('Added to wishlist');
                if (onWishlistChange) {
                    onWishlistChange(book.id, 'add');
                }
            }
        } catch (error) {
            toast.error('Error updating wishlist');
        } finally {
            setLoading(false);
        }
    };

    const handleAudioPlay = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!book.audio_preview_url) {
            toast.error('No audio preview available');
            return;
        }

        if (isPlaying && audio) {
            audio.pause();
            setIsPlaying(false);
        } else {
            try {
                if (audio) {
                    audio.play();
                } else {
                    const newAudio = new Audio(book.audio_preview_url);
                    newAudio.addEventListener('ended', () => setIsPlaying(false));
                    newAudio.addEventListener('error', () => {
                        toast.error('Error playing audio preview');
                        setIsPlaying(false);
                    });
                    await newAudio.play();
                    setAudio(newAudio);
                }
                setIsPlaying(true);
            } catch (error) {
                toast.error('Error playing audio preview');
            }
        }
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(
                    <FiStar key={i} className="text-yellow-400 fill-current" size={14} />
                );
            } else if (i === fullStars && hasHalfStar) {
                stars.push(
                    <div key={i} className="relative">
                        <FiStar className="text-gray-400" size={14} />
                        <FiStar
                            className="absolute top-0 left-0 text-yellow-400 fill-current"
                            size={14}
                            style={{ clipPath: 'inset(0 50% 0 0)' }}
                        />
                    </div>
                );
            } else {
                stars.push(
                    <FiStar key={i} className="text-gray-400" size={14} />
                );
            }
        }
        return stars;
    };

    return (
        <Link to={`/books/${book.id}`} className="group block">
            <div className="card card-hover group relative overflow-hidden">
                {/* Book Cover */}
                <div className="relative aspect-[3/4] mb-4 overflow-hidden rounded-lg bg-gradient-to-br from-gray-800 to-gray-900">
                    {book.cover_image_url ? (
                        <img
                            src={book.cover_image_url}
                            alt={book.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                    ) : null}

                    {/* Fallback when image fails to load */}
                    <div
                        className="w-full h-full flex items-center justify-center text-center p-4"
                        style={{ display: book.cover_image_url ? 'none' : 'flex' }}
                    >
                        <div>
                            <h3 className="text-white font-semibold text-sm mb-1">{book.title}</h3>
                            <p className="text-spotify-light-gray text-xs">{book.author}</p>
                        </div>
                    </div>

                    {/* Overlay with controls */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3">
                        {/* Audio Play Button */}
                        {book.audio_preview_url && (
                            <button
                                onClick={handleAudioPlay}
                                className="bg-spotify-green text-white p-3 rounded-full hover:scale-110 transition-transform duration-200"
                            >
                                {isPlaying ? <FiPause size={20} /> : <FiPlay size={20} />}
                            </button>
                        )}

                        {/* Wishlist Button */}
                        <button
                            onClick={handleWishlistToggle}
                            disabled={loading}
                            className={`p-3 rounded-full transition-all duration-200 ${isInWishlist || showRemoveFromWishlist
                                    ? 'bg-red-500 text-white hover:bg-red-600'
                                    : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                                }`}
                        >
                            <FiHeart
                                size={20}
                                className={isInWishlist || showRemoveFromWishlist ? 'fill-current' : ''}
                            />
                        </button>
                    </div>

                    {/* Price Tag */}
                    {book.price && (
                        <div className="absolute top-2 right-2 bg-spotify-green text-white text-xs px-2 py-1 rounded-full font-semibold">
                            ${book.price}
                        </div>
                    )}
                </div>

                {/* Book Info */}
                <div className="space-y-2">
                    <h3 className="text-white font-semibold text-sm line-clamp-2 leading-tight">
                        {book.title}
                    </h3>

                    <p className="text-spotify-light-gray text-xs">
                        by {book.author}
                    </p>

                    {/* Rating */}
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                            {renderStars(book.average_rating || 0)}
                        </div>
                        <span className="text-spotify-light-gray text-xs">
                            {book.average_rating ? book.average_rating.toFixed(1) : '0.0'}
                        </span>
                        {book.rating_count > 0 && (
                            <span className="text-gray-500 text-xs">
                                ({book.rating_count})
                            </span>
                        )}
                    </div>

                    {/* Genres */}
                    {book.genres && book.genres.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {book.genres.slice(0, 2).map((genre, index) => (
                                <span
                                    key={index}
                                    className="text-xs bg-spotify-gray text-spotify-light-gray px-2 py-1 rounded-full"
                                >
                                    {genre.name}
                                </span>
                            ))}
                            {book.genres.length > 2 && (
                                <span className="text-xs text-gray-500">
                                    +{book.genres.length - 2}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Recommendation Score (if available) */}
                    {book.recommendation_score && (
                        <div className="text-xs text-spotify-green font-semibold">
                            {Math.round(book.recommendation_score * 100)}% match
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default BookCard;