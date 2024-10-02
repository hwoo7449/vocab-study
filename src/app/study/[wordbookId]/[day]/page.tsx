'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import WordCard from '@/components/WordCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { WordStatus } from '@/utils/spaceRepetition';

interface Word {
    id: string;
    english: string;
    korean: string;
    day: number;
    wordbookId: string;
    userProgress?: {
        status: string;
    };
}

export default function StudyPage() {
    const params = useParams();
    const router = useRouter();
    const { wordbookId, day } = params;
    const [words, setWords] = useState<Word[]>([]);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [studiedWords, setStudiedWords] = useState(0);


    useEffect(() => {
        const fetchWords = async () => {
            setIsLoading(true);
            setIsError(false);
            try {
                const response = await fetch(`/api/wordbooks/${wordbookId}/words?day=${day}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch words');
                }
                const data = await response.json();
                console.log('Fetched words:', data); // 여기에 콘솔 로그 추가
                if (Array.isArray(data) && data.length > 0) {
                    setWords(data);
                } else {
                    setWords([]);
                }
            } catch (error) {
                console.error('Error fetching words:', error);
                setIsError(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchWords();
    }, [wordbookId, day]);

    const handleStatusChange = async (status: WordStatus) => {
        if (words.length === 0 || currentWordIndex >= words.length) {
            return;
        }

        try {
            const response = await fetch('/api/progress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    wordId: words[currentWordIndex].id,
                    wordbookId,
                    status,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save progress');
            }

            setStudiedWords(prev => prev + 1);

            if (currentWordIndex < words.length - 1) {
                setCurrentWordIndex(prev => prev + 1);
            } else {
                router.push(`/study/${wordbookId}/${day}/summary?total=${words.length}`);
            }
        } catch (error) {
            console.error('Error saving progress:', error);
            alert('Failed to save progress. Please try again.');
        }
    };

    const handleStopStudying = () => {
        if (studiedWords > 0) {
            router.push(`/study/${wordbookId}/${day}/summary?total=${words.length}`);
        } else {
            alert("You need to study at least one word before stopping.");
        }
    };

    if (isLoading) return <LoadingSpinner />;

    if (isError) {
        return <div>Error loading words. Please try again later.</div>;
    }

    if (words.length === 0) {
        return <div>No words found for this day.</div>;
    }

    if (currentWordIndex >= words.length) {
        return <div>All words for this day have been studied.</div>;
    }

    const currentWord = words[currentWordIndex];

    return (
        <div className="min-h-screen bg-gray-100 py-6 flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold mb-8">Studying Day {day}</h1>
            {currentWord && (
                <WordCard
                    key={currentWord.id}
                    word={currentWord}
                    onStatusChange={handleStatusChange}
                />
            )}
            <p className="mt-4">
                Word {currentWordIndex + 1} of {words.length}
            </p>
            <button
                onClick={handleStopStudying}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
                Stop Studying
            </button>
        </div>
    );
}