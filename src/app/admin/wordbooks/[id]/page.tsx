// src/app/admin/wordbooks/[id]/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from 'react-toastify';

interface Wordbook {
    id?: string;
    name: string;
    totalDays: number;
    description?: string;
}

export default function WordbookForm({ params }: { params: { id: string } }) {
    const [wordbook, setWordbook] = useState<Wordbook>({ name: '', totalDays: 1 });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (params.id !== 'new') {
            fetchWordbook();
        }
    }, [params.id]);

    const fetchWordbook = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/wordbooks/${params.id}`);
            if (!response.ok) throw new Error('Failed to fetch wordbook');
            const data = await response.json();
            setWordbook(data);
        } catch (err) {
            setError('Failed to load wordbook');
            toast.error('Failed to load wordbook');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const url = params.id === 'new' ? '/api/wordbooks' : `/api/wordbooks/${params.id}`;
            const method = params.id === 'new' ? 'POST' : 'PUT';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(wordbook),
            });

            if (!response.ok) throw new Error('Failed to save wordbook');

            toast.success('Wordbook saved successfully');
            router.push('/admin/wordbooks');
        } catch (err) {
            setError('Failed to save wordbook');
            toast.error('Failed to save wordbook');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">
                {params.id === 'new' ? 'Create New Wordbook' : 'Edit Wordbook'}
            </h1>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block mb-1">Name</label>
                    <input
                        type="text"
                        id="name"
                        value={wordbook.name}
                        onChange={(e) => setWordbook({ ...wordbook, name: e.target.value })}
                        required
                        className="w-full px-3 py-2 border rounded"
                    />
                </div>
                <div>
                    <label htmlFor="totalDays" className="block mb-1">Total Days</label>
                    <input
                        type="number"
                        id="totalDays"
                        value={wordbook.totalDays}
                        onChange={(e) => setWordbook({ ...wordbook, totalDays: parseInt(e.target.value) })}
                        required
                        min="1"
                        className="w-full px-3 py-2 border rounded"
                    />
                </div>
                <div>
                    <label htmlFor="description" className="block mb-1">Description (optional)</label>
                    <textarea
                        id="description"
                        value={wordbook.description || ''}
                        onChange={(e) => setWordbook({ ...wordbook, description: e.target.value })}
                        className="w-full px-3 py-2 border rounded"
                    />
                </div>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    Save Wordbook
                </button>
            </form>
        </div>
    );
}