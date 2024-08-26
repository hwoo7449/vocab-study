'use client';

import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    if (status === "loading") {
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
                        <Link href="/study">
                            <div className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-center cursor-pointer">
                                Start Studying
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