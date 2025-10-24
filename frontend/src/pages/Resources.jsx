import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { bookResourceMap, genreResourceMap, normalizeKey } from '../data/resourceRecommendations';
import { Link } from 'react-router-dom';

const Resources = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const res = await api.get('/books');
                // Handle different response structures
                const booksData = Array.isArray(res.data)
                    ? res.data
                    : (res.data?.books || res.data?.data || []);
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

    if (loading) return <div className="p-8 text-center">Loading resources…</div>;
    if (error) return <div className="p-8 text-center text-red-400">{error}</div>;

    const genreKeys = Object.keys(genreResourceMap);
    const booksArray = Array.isArray(books) ? books : [];

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white py-8">
            <div className="max-w-6xl mx-auto px-4">
                <h1 className="text-3xl font-bold mb-4">Resource Hub</h1>
                <p className="text-gray-400 mb-8">Curated websites, articles and videos grouped by book and genre.</p>

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
