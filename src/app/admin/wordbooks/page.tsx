// src/app/admin/wordbooks/page.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from 'react-toastify';

interface Wordbook {
    id: string;
    name: string;
    totalDays: number;
    description?: string;
}

export default function WordbooksPage() {
    const [wordbooks, setWordbooks] = useState<Wordbook[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const router = useRouter();

    useEffect(() => {
        fetchWordbooks(currentPage);
    }, [currentPage]);

    const fetchWordbooks = async (page: number) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/wordbooks?page=${page}&limit=10`);
            if (!response.ok) throw new Error('Failed to fetch wordbooks');
            const data = await response.json();
            setWordbooks(data.wordbooks);
            setTotalPages(data.totalPages);
        } catch (err) {
            setError('Failed to load wordbooks');
            toast.error('Failed to load wordbooks');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteWordbook = async (id: string) => {
        if (!confirm('Are you sure you want to delete this wordbook?')) return;

        try {
            const response = await fetch(`/api/wordbooks/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete wordbook');
            toast.success('Wordbook deleted successfully');
            fetchWordbooks(currentPage);
        } catch (err) {
            setError('Failed to delete wordbook');
            toast.error('Failed to delete wordbook');
            console.error(err);
        }
    };

    if (isLoading) return <LoadingSpinner />;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Wordbooks</h1>
            <Link href="/admin/wordbooks/new" className="bg-blue-500 text-white px-4 py-2 rounded mb-4 inline-block">
                Add New Wordbook
            </Link>
            <ul className="space-y-4">
                {wordbooks.map((wordbook) => (
                    <li key={wordbook.id} className="bg-white shadow rounded p-4">
                        <h2 className="text-xl font-semibold">{wordbook.name}</h2>
                        <p>Total Days: {wordbook.totalDays}</p>
                        {wordbook.description && <p>{wordbook.description}</p>}
                        <div className="mt-2">
                            <button
                                onClick={() => router.push(`/admin/wordbooks/${wordbook.id}`)}
                                className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => deleteWordbook(wordbook.id)}
                                className="bg-red-500 text-white px-2 py-1 rounded"
                            >
                                Delete
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
            <div className="mt-4 flex justify-center">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-blue-500 text-white rounded mr-2 disabled:bg-gray-300"
                >
                    Previous
                </button>
                <span className="px-4 py-2">{currentPage} / {totalPages}</span>
                <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-blue-500 text-white rounded ml-2 disabled:bg-gray-300"
                >
                    Next
                </button>
            </div>
        </div>
    );
}