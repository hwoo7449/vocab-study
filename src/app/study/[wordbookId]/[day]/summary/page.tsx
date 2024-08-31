'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';

interface SummaryData {
    totalWords: number;
    knownWords: number;
    unsureWords: number;
    unknownWords: number;
    nextReviewDate: string;
}

export default function StudySummaryPage({ params }: { params: { wordbookId: string, day: string } }) {
    const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const searchParams = useSearchParams();
    const totalWords = searchParams.get('total');

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const response = await fetch(`/api/study/${params.wordbookId}/${params.day}/summary`);
                if (!response.ok) {
                    throw new Error('Failed to fetch summary');
                }
                const data = await response.json();
                setSummaryData(data);
                setIsLoading(false);

                // 학습한 단어가 없는 경우 즉시 리다이렉트
                if (data.totalWords === 0) {
                    alert("You haven't studied any words in this session.");
                    router.push(`/study/${params.wordbookId}/${params.day}`);
                }
            } catch (error) {
                console.error('Error fetching summary:', error);
                setIsLoading(false);
            }
        };

        fetchSummary();
    }, [params.wordbookId, params.day, router]);

    if (isLoading) return <LoadingSpinner />;

    if (!summaryData || summaryData.totalWords === 0) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-6 flex flex-col items-center justify-center">
            <div className="bg-white shadow-lg rounded-lg p-6 m-4 w-full max-w-lg">
                <h1 className="text-2xl font-bold mb-4">Study Session Summary</h1>
                <p>Total Words in This Day: {totalWords}</p>
                <p>Words Studied: {summaryData.totalWords}</p>
                <p>Known Words: {summaryData.knownWords}</p>
                <p>Unsure Words: {summaryData.unsureWords}</p>
                <p>Unknown Words: {summaryData.unknownWords}</p>
                <p>Next Review Date: {new Date(summaryData.nextReviewDate).toLocaleDateString()}</p>
                <button
                    onClick={() => router.push('/dashboard')}
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
}