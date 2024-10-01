'use client';

import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';

interface DashboardData {
    totalProgress: number;
    dailyGoal: number;
    dailyAchievement: number;
    recentWords: { word: { english: string; korean: string } }[];
    reviewDueCount: number;
    difficultWords?: { english: string; korean: string }[];
    nextLearningRecommendation?: string;
}

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showAdminButtons, setShowAdminButtons] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated') {
            fetchDashboardData();
        }
    }, [status, router]);

    const fetchDashboardData = async () => {
        try {
            const response = await fetch('/api/dashboard');
            if (!response.ok) {
                throw new Error('Failed to fetch dashboard data');
            }
            const data = await response.json();
            setDashboardData(data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (status === "loading" || isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
            <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
                <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
                    <div className="max-w-md mx-auto">
                        <h1 className="text-2xl font-semibold">Welcome to your Dashboard</h1>
                        <p className="mt-4">Hello, {session?.user?.name || 'User'}!</p>

                        {dashboardData && (
                            <>
                                <div className="mt-6">
                                    <h2 className="text-xl font-semibold">Your Learning Progress</h2>
                                    <p>Total Progress: {dashboardData.totalProgress}%</p>
                                    <p>Daily Goal: {dashboardData.dailyGoal} words</p>
                                    <p>Today's Achievement: {dashboardData.dailyAchievement} words</p>
                                </div>
                                <div className="mt-6">
                                    <h2 className="text-xl font-semibold">Recent Words</h2>
                                    <ul>
                                        {dashboardData.recentWords.map((item, index) => (
                                            <li key={index}>{item.word.english} - {item.word.korean}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="mt-6">
                                    <p>Words due for review: {dashboardData.reviewDueCount}</p>
                                    {dashboardData.difficultWords && dashboardData.difficultWords.length > 0 && (
                                        <p>Difficult Words: {dashboardData.difficultWords.map(word => word.english).join(', ')}</p>
                                    )}
                                    {dashboardData.nextLearningRecommendation && (
                                        <p>{dashboardData.nextLearningRecommendation}</p>
                                    )}
                                </div>
                            </>
                        )}

                        <Link href="/study">
                            <div className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-center cursor-pointer">
                                Start Studying
                            </div>
                        </Link>
                        <Link href="/review">
                            <div className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-center cursor-pointer">
                                Start Review
                            </div>
                        </Link>
                        <Link href="/statistics">
                            <div className="mt-4 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-center cursor-pointer">
                                View Statistics
                            </div>
                        </Link>

                        {session?.user?.role === 'admin' && (
                            <div className="mt-4">
                                <button
                                    onClick={() => setShowAdminButtons(!showAdminButtons)}
                                    className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-center cursor-pointer"
                                >
                                    {showAdminButtons ? 'Hide Admin Options' : 'Show Admin Options'}
                                </button>
                                {showAdminButtons && (
                                    <>
                                        <Link href="/admin/wordbooks">
                                            <div className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-center cursor-pointer">
                                                Manage Wordbooks
                                            </div>
                                        </Link>
                                        <Link href="/admin/users">
                                            <div className="mt-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-center cursor-pointer">
                                                Manage Users
                                            </div>
                                        </Link>
                                    </>
                                )}
                            </div>
                        )}

                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            Log out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}