'use client';

import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ProgressStats {
    totalWords: number;
    knownWords: number;
    learningWords: number;
    unknownWords: number;
}

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState<ProgressStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated') {
            fetchStats();
        }
    }, [status, router]);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/progress/stats');
            if (!response.ok) {
                throw new Error('Failed to fetch stats');
            }
            const data = await response.json();
            setStats(data);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching stats:', error);
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

                        {stats && (
                            <div className="mt-6">
                                <h2 className="text-xl font-semibold">Your Learning Progress</h2>
                                <p>Total Words: {stats.totalWords}</p>
                                <p>Known Words: {stats.knownWords}</p>
                                <p>Learning Words: {stats.learningWords}</p>
                                <p>Unknown Words: {stats.unknownWords}</p>
                                <p>Progress: {((stats.knownWords / stats.totalWords) * 100).toFixed(2)}%</p>
                            </div>
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