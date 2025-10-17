import React from 'react';
import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiMail, FiHeart } from 'react-icons/fi';

const Footer = () => {
    return (
        <footer className="bg-spotify-black border-t border-gray-800 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-lg">B</span>
                            </div>
                            <span className="text-white font-bold text-xl">BookHub</span>
                        </div>
                        <p className="text-spotify-light-gray mb-4 max-w-md">
                            Discover your next favorite book with our AI-powered recommendation system.
                            Explore millions of books and get personalized suggestions based on your reading preferences.
                        </p>
                        <div className="flex space-x-4">
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-spotify-light-gray hover:text-white transition-colors"
                            >
                                <FiGithub size={20} />
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-spotify-light-gray hover:text-white transition-colors"
                            >
                                <FiTwitter size={20} />
                            </a>
                            <a
                                href="mailto:contact@bookhub.com"
                                className="text-spotify-light-gray hover:text-white transition-colors"
                            >
                                <FiMail size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    to="/"
                                    className="text-spotify-light-gray hover:text-white transition-colors"
                                >
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/search"
                                    className="text-spotify-light-gray hover:text-white transition-colors"
                                >
                                    Search Books
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/library"
                                    className="text-spotify-light-gray hover:text-white transition-colors"
                                >
                                    My Library
                                </Link>
                            </li>
                            <li>
                                <button
                                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                    className="text-spotify-light-gray hover:text-white transition-colors"
                                >
                                    Back to Top
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Support</h3>
                        <ul className="space-y-2">
                            <li>
                                <a
                                    href="#"
                                    className="text-spotify-light-gray hover:text-white transition-colors"
                                >
                                    Help Center
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-spotify-light-gray hover:text-white transition-colors"
                                >
                                    Privacy Policy
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-spotify-light-gray hover:text-white transition-colors"
                                >
                                    Terms of Service
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-spotify-light-gray hover:text-white transition-colors"
                                >
                                    Contact Us
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between">
                    <p className="text-spotify-light-gray text-sm">
                        © 2024 BookHub. All rights reserved.
                    </p>
                    <div className="flex items-center space-x-1 text-spotify-light-gray text-sm mt-4 sm:mt-0">
                        <span>Made with</span>
                        <FiHeart className="text-red-500" size={14} />
                        <span>for book lovers</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;