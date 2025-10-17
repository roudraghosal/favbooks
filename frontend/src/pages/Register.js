import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';

const Register = () => {
    const { register: registerUser, loading } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
        watch
    } = useForm();

    const password = watch('password');

    const onSubmit = async (data) => {
        if (data.password !== data.confirmPassword) {
            setError('confirmPassword', {
                type: 'manual',
                message: 'Passwords do not match'
            });
            return;
        }

        const result = await registerUser({
            email: data.email,
            username: data.username,
            password: data.password
        });

        if (result.success) {
            navigate('/login', {
                state: { message: 'Registration successful! Please log in.' }
            });
        } else {
            setError('root', {
                type: 'manual',
                message: result.message || 'Registration failed'
            });
        }
    };

    return (
        <Layout>
            <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-spotify-green rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-2xl">B</span>
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">
                            Join BookHub
                        </h2>
                        <p className="text-spotify-light-gray">
                            Create your account and start discovering amazing books
                        </p>
                    </div>

                    <div className="bg-spotify-gray rounded-lg p-8">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* Username Field */}
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-white mb-2">
                                    Username
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiUser className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        {...register('username', {
                                            required: 'Username is required',
                                            minLength: {
                                                value: 3,
                                                message: 'Username must be at least 3 characters'
                                            },
                                            pattern: {
                                                value: /^[a-zA-Z0-9_]+$/,
                                                message: 'Username can only contain letters, numbers, and underscores'
                                            }
                                        })}
                                        type="text"
                                        id="username"
                                        autoComplete="username"
                                        className="input-field pl-10 w-full"
                                        placeholder="Choose a username"
                                    />
                                </div>
                                {errors.username && (
                                    <p className="mt-1 text-sm text-red-400">{errors.username.message}</p>
                                )}
                            </div>

                            {/* Email Field */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                                    Email address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiMail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        {...register('email', {
                                            required: 'Email is required',
                                            pattern: {
                                                value: /^\S+@\S+$/i,
                                                message: 'Invalid email address'
                                            }
                                        })}
                                        type="email"
                                        id="email"
                                        autoComplete="email"
                                        className="input-field pl-10 w-full"
                                        placeholder="Enter your email"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiLock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        {...register('password', {
                                            required: 'Password is required',
                                            minLength: {
                                                value: 6,
                                                message: 'Password must be at least 6 characters'
                                            },
                                            pattern: {
                                                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                                                message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
                                            }
                                        })}
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        autoComplete="new-password"
                                        className="input-field pl-10 pr-10 w-full"
                                        placeholder="Create a password"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-white" />
                                        ) : (
                                            <FiEye className="h-5 w-5 text-gray-400 hover:text-white" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
                                )}
                            </div>

                            {/* Confirm Password Field */}
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiLock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        {...register('confirmPassword', {
                                            required: 'Please confirm your password',
                                            validate: (value) =>
                                                value === password || 'Passwords do not match'
                                        })}
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        id="confirmPassword"
                                        autoComplete="new-password"
                                        className="input-field pl-10 pr-10 w-full"
                                        placeholder="Confirm your password"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? (
                                            <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-white" />
                                        ) : (
                                            <FiEye className="h-5 w-5 text-gray-400 hover:text-white" />
                                        )}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>
                                )}
                            </div>

                            {/* Terms and Conditions */}
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        {...register('terms', {
                                            required: 'You must accept the terms and conditions'
                                        })}
                                        id="terms"
                                        name="terms"
                                        type="checkbox"
                                        className="h-4 w-4 text-spotify-green focus:ring-spotify-green border-gray-600 rounded bg-spotify-dark"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="terms" className="text-spotify-light-gray">
                                        I agree to the{' '}
                                        <a href="#" className="text-spotify-green hover:text-green-400">
                                            Terms and Conditions
                                        </a>{' '}
                                        and{' '}
                                        <a href="#" className="text-spotify-green hover:text-green-400">
                                            Privacy Policy
                                        </a>
                                    </label>
                                </div>
                            </div>
                            {errors.terms && (
                                <p className="mt-1 text-sm text-red-400">{errors.terms.message}</p>
                            )}

                            {/* Error Message */}
                            {errors.root && (
                                <div className="bg-red-900 bg-opacity-50 border border-red-500 text-red-200 px-4 py-3 rounded">
                                    {errors.root.message}
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Creating account...' : 'Create account'}
                            </button>
                        </form>

                        {/* Password Requirements */}
                        <div className="mt-6 p-4 bg-spotify-dark rounded-lg border border-gray-700">
                            <h3 className="text-sm font-medium text-white mb-2">Password Requirements</h3>
                            <ul className="text-xs text-spotify-light-gray space-y-1">
                                <li>• At least 6 characters long</li>
                                <li>• Contains at least one uppercase letter</li>
                                <li>• Contains at least one lowercase letter</li>
                                <li>• Contains at least one number</li>
                            </ul>
                        </div>

                        {/* Sign In Link */}
                        <div className="mt-6 text-center">
                            <p className="text-spotify-light-gray">
                                Already have an account?{' '}
                                <Link
                                    to="/login"
                                    className="font-medium text-spotify-green hover:text-green-400"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Register;