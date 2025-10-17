import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

const Login = () => {
    const { login, loading } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError
    } = useForm();

    const onSubmit = async (data) => {
        const result = await login(data.email, data.password);

        if (result.success) {
            navigate(from, { replace: true });
        } else {
            setError('root', {
                type: 'manual',
                message: result.message || 'Login failed'
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
                            Welcome back
                        </h2>
                        <p className="text-spotify-light-gray">
                            Sign in to your BookHub account
                        </p>
                    </div>

                    <div className="bg-spotify-gray rounded-lg p-8">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                                            }
                                        })}
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        autoComplete="current-password"
                                        className="input-field pl-10 pr-10 w-full"
                                        placeholder="Enter your password"
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

                            {/* Remember Me */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 text-spotify-green focus:ring-spotify-green border-gray-600 rounded bg-spotify-dark"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-spotify-light-gray">
                                        Remember me
                                    </label>
                                </div>

                                <div className="text-sm">
                                    <a href="#" className="text-spotify-green hover:text-green-400">
                                        Forgot password?
                                    </a>
                                </div>
                            </div>

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
                                {loading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </form>

                        {/* Demo Credentials */}
                        <div className="mt-6 p-4 bg-spotify-dark rounded-lg border border-gray-700">
                            <h3 className="text-sm font-medium text-white mb-2">Demo Credentials</h3>
                            <p className="text-xs text-spotify-light-gray mb-1">
                                <strong>Admin:</strong> admin@bookapp.com / admin123
                            </p>
                            <p className="text-xs text-spotify-light-gray">
                                <strong>User:</strong> user@example.com / password123
                            </p>
                        </div>

                        {/* Sign Up Link */}
                        <div className="mt-6 text-center">
                            <p className="text-spotify-light-gray">
                                Don't have an account?{' '}
                                <Link
                                    to="/register"
                                    className="font-medium text-spotify-green hover:text-green-400"
                                >
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Login;