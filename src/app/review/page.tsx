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
    day: number; // day 속성 추가
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
    const [availableDays, setAvailableDays] = useState<number[]>([]);
    const [selectedDays, setSelectedDays] = useState<number[]>([]);
    const [isLoadingWords, setIsLoadingWords] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchWordbooks();
    }, []);

    useEffect(() => {
        if (wordbooks.length === 1) {
            setSelectedWordbook(wordbooks[0].id);
            fetchAvailableDays(wordbooks[0].id);
        }
    }, [wordbooks]);

    const fetchWordbooks = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/review/wordbooks');
            if (!response.ok) {
                throw new Error('Failed to fetch wordbooks');
            }
            const data = await response.json();
            setWordbooks(data);
            if (data.length === 1) {
                setSelectedWordbook(data[0].id);
                fetchAvailableDays(data[0].id);
            }
        } catch (error) {
            console.error('Error fetching wordbooks:', error);
            setError('Failed to load wordbooks. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAvailableDays = async (wordbookId: string) => {
        try {
            const response = await fetch(`/api/review/days?wordbookId=${wordbookId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch available days');
            }
            const data = await response.json();
            setAvailableDays(data);
            setSelectedDays(data); // 기본적으로 모든 날짜 선택
        } catch (error) {
            console.error('Error fetching available days:', error);
            setError('Failed to load available days. Please try again later.');
        }
    };

    const fetchReviewWords = async () => {
        setIsLoadingWords(true);
        setError(null);
        try {
            let url = `/api/review?wordbookId=${selectedWordbook}`;
            if (selectedDays.length > 0) {
                url += `&days=${selectedDays.join(',')}`;
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch review words');
            }
            const data = await response.json();
            console.log('Fetched review words:', data); // 로그 추가
            setWords(data);
            setCurrentWordIndex(0);
        } catch (error) {
            console.error('Error fetching review words:', error);
            setError('Failed to load review words. Please try again later.');
        } finally {
            setIsLoadingWords(false);
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

    const handleStopReview = async () => {
        if (Object.keys(wordStatuses).length === 0) {
            alert("You haven't reviewed any words yet.");
            return;
        }

        try {
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
        } catch (error) {
            console.error('Error ending review session:', error);
            alert('Failed to end review session. Please try again.');
        }
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

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

    if (wordbooks.length === 0) {
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

            <div className="mb-8 space-y-4 w-full max-w-md">
                <div>
                    <label htmlFor="wordbook" className="block mb-2">Wordbook:</label>
                    <select
                        id="wordbook"
                        value={selectedWordbook}
                        onChange={(e) => {
                            setSelectedWordbook(e.target.value);
                            fetchAvailableDays(e.target.value);
                        }}
                        className="w-full p-2 border rounded"
                    >
                        <option value="">Select a Wordbook</option>
                        {wordbooks.map((wb) => (
                            <option key={wb.id} value={wb.id}>{wb.name}</option>
                        ))}
                    </select>
                </div>
                {availableDays.length > 0 && (
                    <div>
                        <p className="mb-2">Select days to review:</p>
                        <div className="flex flex-wrap gap-2">
                            {availableDays.map((day) => (
                                <label key={day} className="flex items-center space-x-2 w-1/4">
                                    <input
                                        type="checkbox"
                                        checked={selectedDays.includes(day)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedDays([...selectedDays, day]);
                                            } else {
                                                setSelectedDays(selectedDays.filter(d => d !== day));
                                            }
                                        }}
                                    />
                                    <span>Day {day}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
                <button
                    onClick={fetchReviewWords}
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    disabled={!selectedWordbook || selectedDays.length === 0 || isLoadingWords}
                >
                    {isLoadingWords ? 'Loading...' : 'Start Review'}
                </button>
            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            {words.length > 0 && (
                <>
                    <div className="text-lg font-semibold mb-2">
                        Current Day: {words[currentWordIndex].day || 'N/A'}
                    </div>
                    <WordCard
                        key={words[currentWordIndex].id}
                        word={words[currentWordIndex]}
                        onStatusChange={handleStatusChange}
                    />
                    <p className="mt-4">
                        Word {currentWordIndex + 1} of {words.length} | Wordbook: {words[currentWordIndex].wordbookName}
                    </p>
                    <div className="mt-4 w-full max-w-md bg-white rounded-full h-2.5 dark:bg-gray-700">
                        <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${((currentWordIndex + 1) / words.length) * 100}%` }}
                        ></div>
                    </div>
                    <button
                        onClick={handleStopReview}
                        className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                        Stop Review
                    </button>
                </>
            )}
        </div>
    );
}