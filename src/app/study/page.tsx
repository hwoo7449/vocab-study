'use client';
import { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';

interface Wordbook {
    id: string;
    name: string;
    totalDays: number;
    description: string | null;
}

export default function StudyPage() {
    const [wordbooks, setWordbooks] = useState<Wordbook[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchWordbooks = async () => {
            try {
                const response = await fetch('/api/wordbooks');
                if (!response.ok) {
                    throw new Error('Failed to fetch wordbooks');
                }
                const data = await response.json();
                setWordbooks(data.wordbooks);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching wordbooks:', error);
                setIsLoading(false);
            }
        };
        fetchWordbooks();
    }, []);

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
            <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
                <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
                    <div className="max-w-md mx-auto">
                        <h1 className="text-2xl font-semibold mb-6">Select a Wordbook to Study</h1>
                        <div className="space-y-4">
                            {wordbooks.map((wordbook) => (
                                <Link key={wordbook.id} href={`/study/${wordbook.id}`}>
                                    <div className="p-4 bg-gray-200 rounded-lg hover:bg-gray-300 cursor-pointer">
                                        <h2 className="text-lg font-semibold">{wordbook.name}</h2>
                                        <p>Total days: {wordbook.totalDays}</p>
                                        <p className="mt-1 text-sm text-gray-600">
                                            {wordbook.description}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}