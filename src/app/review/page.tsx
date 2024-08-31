'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import WordCard from '@/components/WordCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { WordStatus } from '@/utils/spaceRepetition';

interface Word {
    id: string;
    english: string;
    korean: string;
    wordbookName: string;
    wordbookId: string;
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
    const [error, setError] = useState<string | null>(null);
    const [wordStatuses, setWordStatuses] = useState<{ [key: string]: WordStatus }>({});
    const [wordbooks, setWordbooks] = useState<Wordbook[]>([]);
    const [selectedWordbook, setSelectedWordbook] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const router = useRouter();

    useEffect(() => {
        fetchWordbooks();
        fetchReviewWords();
    }, []);

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
        setError(null);
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
            if (data.length === 0) {
                setError('No words to review based on current filters.');
            } else {
                setWords(data);
                setCurrentWordIndex(0);
            }
        } catch (error) {
            console.error('Error fetching review words:', error);
            setError('Failed to load review words. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        fetchReviewWords();
    };

    const handleStatusChange = async (status: WordStatus) => {
        try {
            const response = await fetch('/api/progress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    wordId: words[currentWordIndex].id,
                    wordbookId: words[currentWordIndex].wordbookId,
                    status,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save progress');
            }

            // 현재 단어의 상태를 저장
            setWordStatuses(prev => ({ ...prev, [words[currentWordIndex].id]: status }));

            if (currentWordIndex < words.length - 1) {
                setCurrentWordIndex(currentWordIndex + 1);
            } else {
                // 복습 세션 종료 및 요약 페이지로 이동
                const endSessionResponse = await fetch('/api/review/end-session', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ wordStatuses }),
                });

                if (!endSessionResponse.ok) {
                    throw new Error('Failed to end review session');
                }

                const { sessionId } = await endSessionResponse.json();
                router.push(`/review/summary?sessionId=${sessionId}`);
            }
        } catch (error) {
            console.error('Error saving progress:', error);
            alert('Failed to save progress. Please try again.');
        }
    };

    if (isLoading) return <LoadingSpinner />;

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold mb-4">{error}</h1>
                <button
                    onClick={() => router.push('/dashboard')}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-6 flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold mb-8">Review Session</h1>

            <form onSubmit={handleFilter} className="mb-8 space-y-4">
                <div>
                    <label htmlFor="wordbook" className="block mb-2">Wordbook:</label>
                    <select
                        id="wordbook"
                        value={selectedWordbook}
                        onChange={(e) => setSelectedWordbook(e.target.value)}
                        className="w-full p-2 border rounded"
                    >
                        <option value="">All Wordbooks</option>
                        {wordbooks.map((wb) => (
                            <option key={wb.id} value={wb.id}>{wb.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="startDate" className="block mb-2">Start Date:</label>
                    <input
                        type="date"
                        id="startDate"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div>
                    <label htmlFor="endDate" className="block mb-2">End Date:</label>
                    <input
                        type="date"
                        id="endDate"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                </div>
                <button type="submit" className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    Apply Filters
                </button>
            </form>

            {words.length > 0 ? (
                <>
                    <WordCard
                        key={words[currentWordIndex].id}
                        word={words[currentWordIndex].english}
                        meaning={words[currentWordIndex].korean}
                        onStatusChange={handleStatusChange}
                    />
                    <p className="mt-4">
                        Word {currentWordIndex + 1} of {words.length} | Wordbook: {words[currentWordIndex].wordbookName}
                    </p>
                    <div className="mt-4 w-full max-w-md bg-white rounded-full h-2.5 dark:bg-gray-700">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${((currentWordIndex + 1) / words.length) * 100}%` }}></div>
                    </div>
                </>
            ) : (
                <p>No words to review based on current filters.</p>
            )}
        </div>
    );
}