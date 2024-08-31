'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';

interface SummaryData {
    totalWords: number;
    correctWords: number;
    incorrectWords: number;
    accuracy: number;
}

export default function ReviewSummaryPage() {
    const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const fetchSummary = async () => {
            const sessionId = searchParams.get('sessionId');
            if (!sessionId) {
                router.push('/dashboard');
                return;
            }

            try {
                const response = await fetch(`/api/review/summary?sessionId=${sessionId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch summary');
                }
                const data = await response.json();
                setSummaryData(data);
            } catch (error) {
                console.error('Error fetching summary:', error);
                alert('Failed to load summary. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSummary();
    }, [router, searchParams]);

    if (isLoading) return <LoadingSpinner />;

    if (!summaryData) {
        return <div>No summary data available.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
            <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
                <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
                    <h1 className="text-2xl font-semibold mb-6">Review Session Summary</h1>
                    <div className="space-y-4">
                        <p>Total Words: {summaryData.totalWords}</p>
                        <p>Correct Words: {summaryData.correctWords}</p>
                        <p>Incorrect Words: {summaryData.incorrectWords}</p>
                        <p>Accuracy: {(summaryData.accuracy * 100).toFixed(2)}%</p>
                    </div>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}