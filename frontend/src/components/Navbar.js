import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    FiHome,
    FiSearch,
    FiHeart,
    FiSettings,
    FiLogOut,
    FiMenu,
    FiX,
    FiBook,
    FiAward
} from 'react-icons/fi';

const Navbar = () => {
    const { logout, isAuthenticated, isAdmin } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
            setIsMenuOpen(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsMenuOpen(false);
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-spotify-black border-b border-gray-800 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">B</span>
                        </div>
                        <span className="text-white font-bold text-xl hidden sm:block">BookHub</span>
                    </Link>

                    {/* Search Bar - Desktop */}
                    <div className="hidden md:flex flex-1 max-w-lg mx-8">
                        <form onSubmit={handleSearch} className="w-full relative">
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search books, authors..."
                                    className="w-full pl-10 pr-4 py-2 bg-spotify-gray text-white rounded-full border border-gray-600 focus:outline-none focus:border-spotify-green transition-colors"
                                />
                            </div>
                        </form>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-6">
                        <Link
                            to="/"
                            className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${isActive('/')
                                ? 'text-spotify-green bg-spotify-gray'
                                : 'text-spotify-light-gray hover:text-white'
                                }`}
                        >
                            <FiHome size={20} />
                            <span>Home</span>
                        </Link>

                        <Link
                            to="/browse"
                            className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${isActive('/browse')
                                ? 'text-spotify-green bg-spotify-gray'
                                : 'text-spotify-light-gray hover:text-white'
                                }`}
                        >
                            <FiBook size={20} />
                            <span>Browse Books</span>
                        </Link>

                        <Link
                            to="/search"
                            className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${isActive('/search')
                                ? 'text-spotify-green bg-spotify-gray'
                                : 'text-spotify-light-gray hover:text-white'
                                }`}
                        >
                            <FiSearch size={20} />
                            <span>Search</span>
                        </Link>

                        {isAuthenticated() && (
                            <>
                                <Link
                                    to="/achievements"
                                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${isActive('/achievements')
                                        ? 'text-spotify-green bg-spotify-gray'
                                        : 'text-spotify-light-gray hover:text-white'
                                        }`}
                                >
                                    <FiAward size={20} />
                                    <span>Achievements</span>
                                </Link>

                                <Link
                                    to="/library"
                                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${isActive('/library')
                                        ? 'text-spotify-green bg-spotify-gray'
                                        : 'text-spotify-light-gray hover:text-white'
                                        }`}
                                >
                                    <FiHeart size={20} />
                                    <span>Library</span>
                                </Link>

                                {isAdmin() && (
                                    <Link
                                        to="/admin"
                                        className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${isActive('/admin')
                                            ? 'text-spotify-green bg-spotify-gray'
                                            : 'text-spotify-light-gray hover:text-white'
                                            }`}
                                    >
                                        <FiSettings size={20} />
                                        <span>Admin</span>
                                    </Link>
                                )}

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-1 px-3 py-2 rounded-lg text-spotify-light-gray hover:text-white transition-colors"
                                >
                                    <FiLogOut size={20} />
                                    <span>Logout</span>
                                </button>
                            </>
                        )}

                        {!isAuthenticated() && (
                            <div className="flex items-center space-x-4">
                                <Link
                                    to="/login"
                                    className="text-spotify-light-gray hover:text-white transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="btn-primary"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden text-white p-2"
                    >
                        {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                    </button>
                </div>

                {/* Mobile Search */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-800">
                        <form onSubmit={handleSearch} className="mb-4">
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search books, authors..."
                                    className="w-full pl-10 pr-4 py-2 bg-spotify-gray text-white rounded-lg border border-gray-600 focus:outline-none focus:border-spotify-green"
                                />
                            </div>
                        </form>
                    </div>
                )}
            </div>

            {/* Mobile Navigation Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-spotify-black border-t border-gray-800">
                    <div className="px-4 py-4 space-y-3">
                        <Link
                            to="/"
                            onClick={() => setIsMenuOpen(false)}
                            className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${isActive('/')
                                ? 'text-spotify-green bg-spotify-gray'
                                : 'text-spotify-light-gray'
                                }`}
                        >
                            <FiHome size={20} />
                            <span>Home</span>
                        </Link>

                        <Link
                            to="/browse"
                            onClick={() => setIsMenuOpen(false)}
                            className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${isActive('/browse')
                                ? 'text-spotify-green bg-spotify-gray'
                                : 'text-spotify-light-gray'
                                }`}
                        >
                            <FiBook size={20} />
                            <span>Browse Books</span>
                        </Link>

                        <Link
                            to="/search"
                            onClick={() => setIsMenuOpen(false)}
                            className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${isActive('/search')
                                ? 'text-spotify-green bg-spotify-gray'
                                : 'text-spotify-light-gray'
                                }`}
                        >
                            <FiSearch size={20} />
                            <span>Search</span>
                        </Link>

                        {isAuthenticated() && (
                            <>
                                <Link
                                    to="/library"
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${isActive('/library')
                                        ? 'text-spotify-green bg-spotify-gray'
                                        : 'text-spotify-light-gray'
                                        }`}
                                >
                                    <FiHeart size={20} />
                                    <span>My Library</span>
                                </Link>

                                {isAdmin() && (
                                    <Link
                                        to="/admin"
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${isActive('/admin')
                                            ? 'text-spotify-green bg-spotify-gray'
                                            : 'text-spotify-light-gray'
                                            }`}
                                    >
                                        <FiSettings size={20} />
                                        <span>Admin Panel</span>
                                    </Link>
                                )}

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-3 p-3 rounded-lg text-spotify-light-gray w-full text-left"
                                >
                                    <FiLogOut size={20} />
                                    <span>Logout</span>
                                </button>
                            </>
                        )}

                        {!isAuthenticated() && (
                            <div className="space-y-3 pt-4 border-t border-gray-800">
                                <Link
                                    to="/login"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block text-spotify-light-gray p-3"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block btn-primary text-center"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;