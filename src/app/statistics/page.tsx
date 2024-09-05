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
    progressData: { label: string; count: number }[];
    wordbookProgress: {
        id: string;
        name: string;
        _count: { words: number };
        userProgresses: { status: string }[];
    }[];
}

type ProgressType = 'daily' | 'monthly';

export default function StatisticsPage() {
    const [statistics, setStatistics] = useState<Statistics | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [progressType, setProgressType] = useState<ProgressType>('daily');
    const router = useRouter();

    useEffect(() => {
        fetchStatistics();
    }, [progressType]);

    const fetchStatistics = async () => {
        try {
            const response = await fetch(`/api/statistics?type=${progressType}`);
            if (!response.ok) {
                throw new Error('Failed to fetch statistics');
            }
            const data = await response.json();
            console.log('Received statistics data:', JSON.stringify(data, null, 2));
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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    };

    const progressData = {
        labels: statistics.progressData.map(item =>
            progressType === 'daily' ? formatDate(item.label) : item.label
        ),
        datasets: [
            {
                label: 'Words Learned',
                data: statistics.progressData.map(item => item.count),
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
            {/* Back to Dashboard 버튼 추가 */}
            <button
                onClick={() => router.push('/dashboard')}
                className="mb-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Back to Dashboard
            </button>

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
                <h2 className="text-xl font-semibold mb-2">Learning Progress</h2>
                <div className="mb-2">
                    <select
                        value={progressType}
                        onChange={(e) => setProgressType(e.target.value as ProgressType)}
                        className="border rounded p-2"
                    >
                        <option value="daily">Daily</option>
                        <option value="monthly">Monthly</option>
                    </select>
                </div>
                <Bar data={progressData} options={barOptions} />
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
            {/* Back to Dashboard 버튼 추가 */}
            <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Back to Dashboard
            </button>
        </div>
    );
}