// src/app/admin/layout.tsx
'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { data: session, status } = useSession();
    const router = useRouter();

    if (status === "loading") {
        return <LoadingSpinner />;
    }

    if (!session || session.user.role !== 'admin') {
        router.push('/login');
        return null;
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <aside className="w-64 bg-white shadow-md flex flex-col">
                <nav className="mt-5">
                    <Link href="/admin/wordbooks" className="block py-2 px-4 text-gray-600 hover:bg-gray-200">
                        Wordbooks
                    </Link>
                    <Link href="/admin/users" className="block py-2 px-4 text-gray-600 hover:bg-gray-200">
                        Users
                    </Link>
                    <Link href="/admin/reported-words" className="block py-2 px-4 text-gray-600 hover:bg-gray-200">
                        Reported Words
                    </Link>
                    {/* 추가 관리자 메뉴 항목들 */}
                </nav>
                <div className="mt-auto mb-4">
                    <Link href="/dashboard" className="block py-2 px-4 text-gray-600 hover:bg-gray-200">
                        Back to Dashboard
                    </Link>
                </div>
            </aside>
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
                <div className="container mx-auto px-6 py-8">
                    {children}
                </div>
            </main>
        </div>
    );
}