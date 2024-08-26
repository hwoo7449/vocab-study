'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import WordCard from '@/components/WordCard';

interface Word {
    id: string;
    english: string;
    korean: string;
}

export default function StudyPage() {
    const params = useParams();
    const day = params.day;
    const [words, setWords] = useState<Word[]>([]);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWords = async () => {
            try {
                const response = await fetch(`/api/words/${day}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch words');
                }
                const data = await response.json();
                setWords(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching words:', error);
                setLoading(false);
            }
        };

        fetchWords();
    }, [day]);

    const handleStatusChange = async (status: 'unknown' | 'unsure' | 'known') => {
        console.log(`Word ${words[currentWordIndex].english} status: ${status}`);

        try {
            const response = await fetch('/api/progress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    wordId: words[currentWordIndex].id,
                    status: status,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save progress');
            }

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

    if (loading) {
        return <div>Loading...</div>;
    }

    if (words.length === 0) {
        return <div>No words found for this day.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-6 flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold mb-8">Studying Day {day}</h1>
            <WordCard
                key={words[currentWordIndex].id} // Add this line
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