'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import WordCard from '@/components/WordCard';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Word {
    id: string;
    english: string;
    korean: string;
    wordbookName: string;
    userProgress?: {
        status: string;
    };
}

interface Wordbook {
    id: string;
    name: string;
}

export default function ReviewPage() {
    const [words, setWords] = useState<Word[]>([]);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [wordbooks, setWordbooks] = useState<Wordbook[]>([]);
    const [selectedWordbook, setSelectedWordbook] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const router = useRouter();

    useEffect(() => {
        fetchWordbooks();
    }, []);

    useEffect(() => {
        fetchReviewWords();
    }, [selectedWordbook, startDate, endDate]);

    const fetchWordbooks = async () => {
        try {
            const response = await fetch('/api/wordbooks');
            if (!response.ok) {
                throw new Error('Failed to fetch wordbooks');
            }
            const data = await response.json();
            setWordbooks(data.wordbooks);
        } catch (error) {
            console.error('Error fetching wordbooks:', error);
        }
    };

    const fetchReviewWords = async () => {
        setIsLoading(true);
        try {
            let url = '/api/review?';
            if (selectedWordbook) url += `wordbookId=${selectedWordbook}&`;
            if (startDate) url += `startDate=${startDate}&`;
            if (endDate) url += `endDate=${endDate}&`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch review words');
            }
            const data = await response.json();
            setWords(data);
            setCurrentWordIndex(0);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching review words:', error);
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (status: 'unknown' | 'unsure' | 'known') => {
        try {
            const response = await fetch('/api/progress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    wordId: words[currentWordIndex].id,
                    status,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save progress');
            }

            if (currentWordIndex < words.length - 1) {
                setCurrentWordIndex(currentWordIndex + 1);
            } else {
                alert("You have completed your review!");
                router.push('/dashboard');
            }
        } catch (error) {
            console.error('Error saving progress:', error);
            alert('Failed to save progress. Please try again.');
        }
    };

    if (isLoading) return <LoadingSpinner />;

    if (words.length === 0) {
        return (
            <div className="min-h-screen bg-gray-100 py-6 flex flex-col items-center justify-center">
                <h1 className="text-3xl font-bold mb-8">Review Session</h1>
                <div className="mb-4">No words to review at this time.</div>
                <button
                    onClick={() => router.push('/dashboard')}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-6 flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold mb-8">Review Session</h1>
            <div className="mb-4 flex space-x-4">
                <select
                    value={selectedWordbook}
                    onChange={(e) => setSelectedWordbook(e.target.value)}
                    className="px-2 py-1 border rounded"
                >
                    <option value="">All Wordbooks</option>
                    {wordbooks.map((wb) => (
                        <option key={wb.id} value={wb.id}>{wb.name}</option>
                    ))}
                </select>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-2 py-1 border rounded"
                />
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-2 py-1 border rounded"
                />
                <button
                    onClick={fetchReviewWords}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                    Apply Filters
                </button>
            </div>
            <WordCard
                key={words[currentWordIndex].id}
                word={words[currentWordIndex].english}
                meaning={words[currentWordIndex].korean}
                onStatusChange={handleStatusChange}
            />
            <p className="mt-4">
                Word {currentWordIndex + 1} of {words.length} | Wordbook: {words[currentWordIndex].wordbookName}
            </p>
        </div>
    );
}