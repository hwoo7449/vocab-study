'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';

interface DayProgress {
    day: number;
    totalWords: number;
    learnedWords: number;
}

interface Wordbook {
    id: string;
    name: string;
    totalDays: number;
}

export default function WordbookStudyPage() {
    const params = useParams();
    const wordbookId = params.wordbookId as string;
    const [dayProgress, setDayProgress] = useState<DayProgress[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [wordbook, setWordbook] = useState<Wordbook | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [progressResponse, wordbookResponse] = await Promise.all([
                    fetch(`/api/wordbooks/${wordbookId}/progress`),
                    fetch(`/api/wordbooks/${wordbookId}`)
                ]);

                if (!progressResponse.ok || !wordbookResponse.ok) {
                    throw new Error('Failed to fetch data');
                }

                const progressData = await progressResponse.json();
                const wordbookData = await wordbookResponse.json();

                setDayProgress(progressData);
                setWordbook(wordbookData);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setIsLoading(false);
            }
        };

        fetchData();
    }, [wordbookId]);

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
            <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
                <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
                    <div className="max-w-md mx-auto">
                        <h1 className="text-2xl font-semibold mb-2">Select a Day to Study</h1>
                        {wordbook && <h2 className="text-xl font-medium mb-6">Wordbook: {wordbook.name}</h2>}
                        <div className="grid grid-cols-5 gap-4">
                            {dayProgress.map((day) => (
                                <Link key={day.day} href={`/study/${wordbookId}/${day.day}`}>
                                    <div
                                        className={`p-2 rounded text-center cursor-pointer ${day.learnedWords === day.totalWords
                                                ? 'bg-green-500 text-white'
                                                : day.learnedWords > 0
                                                    ? 'bg-yellow-200'
                                                    : 'bg-gray-200 hover:bg-gray-300'
                                            }`}
                                    >
                                        <div>{day.day}</div>
                                        <div className="text-xs mt-1">
                                            {day.learnedWords}/{day.totalWords}
                                        </div>
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