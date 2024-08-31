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

export default function ReviewPage() {
    const [words, setWords] = useState<Word[]>([]);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [wordStatuses, setWordStatuses] = useState<{ [key: string]: WordStatus }>({});
    const router = useRouter();

    useEffect(() => {
        fetchReviewWords();
    }, []);

    const fetchReviewWords = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/review');
            if (!response.ok) {
                throw new Error('Failed to fetch review words');
            }
            const data = await response.json();
            if (data.length === 0) {
                setError('No words to review at this time.');
            } else {
                setWords(data);
            }
        } catch (error) {
            console.error('Error fetching review words:', error);
            setError('Failed to load review words. Please try again later.');
        } finally {
            setIsLoading(false);
        }
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

    if (words.length === 0) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold mb-4">No words to review at this time.</h1>
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
        </div>
    );
}