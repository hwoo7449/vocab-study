'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

interface Statistics {
    totalWordsLearned: number;
    wordsByStatus: { status: string; _count: number }[];
    dailyProgress: { lastReviewDate: string; _count: number }[];
    wordbookProgress: {
        id: string;
        name: string;
        _count: { words: number };
        userProgresses: { status: string }[];
    }[];
}

export default function StatisticsPage() {
    const [statistics, setStatistics] = useState<Statistics | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchStatistics();
    }, []);

    const fetchStatistics = async () => {
        try {
            const response = await fetch('/api/statistics');
            if (!response.ok) {
                throw new Error('Failed to fetch statistics');
            }
            const data = await response.json();
            setStatistics(data);
        } catch (error) {
            console.error('Error fetching statistics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <LoadingSpinner />;

    if (!statistics) {
        return <div>Failed to load statistics.</div>;
    }

    // 최근 7일 데이터만 필터링
    const last7Days = statistics.dailyProgress
        .sort((a, b) => new Date(b.lastReviewDate).getTime() - new Date(a.lastReviewDate).getTime())
        .slice(0, 7)
        .reverse();

    const dailyProgressData = {
        labels: last7Days.map(item => new Date(item.lastReviewDate).toLocaleDateString()),
        datasets: [
            {
                label: 'Words Learned',
                data: last7Days.map(item => item._count),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
        ],
    };

    const barOptions = {
        responsive: true,
        scales: {
            x: {
                ticks: {
                    maxRotation: 45,
                    minRotation: 45
                }
            }
        }
    };

    const wordsByStatusData = {
        labels: statistics.wordsByStatus.map(item => item.status),
        datasets: [
            {
                data: statistics.wordsByStatus.map(item => item._count),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
            },
        ],
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Learning Statistics</h1>

            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Total Words Learned</h2>
                <p>{statistics.totalWordsLearned}</p>
            </div>

            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Words by Status</h2>
                <div style={{ width: '300px', height: '300px' }}>
                    <Pie data={wordsByStatusData} />
                </div>
            </div>

            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Daily Progress (Last 7 Days)</h2>
                <Bar data={dailyProgressData} options={barOptions} />
            </div>

            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Wordbook Progress</h2>
                <ul>
                    {statistics.wordbookProgress.map((wordbook) => (
                        <li key={wordbook.id}>
                            {wordbook.name}: {wordbook.userProgresses.length} / {wordbook._count.words} words learned
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}