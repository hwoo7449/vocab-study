'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import WordCard from '@/components/WordCard';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Word {
    id: string;
    english: string;
    korean: string;
    userProgress?: {
        status: string;
    };
}

export default function StudyPage() {
    const params = useParams();
    const { wordbookId, day } = params;
    const [words, setWords] = useState<Word[]>([]);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchWords = async () => {
            try {
                const response = await fetch(`/api/wordbooks/${wordbookId}/words?day=${day}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch words');
                }
                const data = await response.json();
                setWords(data);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching words:', error);
                setIsLoading(false);
            }
        };

        fetchWords();
    }, [wordbookId, day]);

    const handleStatusChange = async (status: 'unknown' | 'unsure' | 'known') => {
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

            // Update local state
            const updatedWords = [...words];
            updatedWords[currentWordIndex].userProgress = { status };
            setWords(updatedWords);

            // Move to the next word
            if (currentWordIndex < words.length - 1) {
                setCurrentWordIndex(currentWordIndex + 1);
            } else {
                alert("You have completed this day's words!");
            }
        } catch (error) {
            console.error('Error saving progress:', error);
            alert('Failed to save progress. Please try again.');
        }
    };

    if (isLoading) return <LoadingSpinner />;

    if (words.length === 0) {
        return <div>No words found for this day.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-6 flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold mb-8">Studying Day {day}</h1>
            <WordCard
                key={words[currentWordIndex].id}
                word={words[currentWordIndex].english}
                meaning={words[currentWordIndex].korean}
                onStatusChange={handleStatusChange}
            />
            <p className="mt-4">
                Word {currentWordIndex + 1} of {words.length}
            </p>
        </div>
    );
}