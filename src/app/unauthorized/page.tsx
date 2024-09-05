import Link from 'next/link';

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-md">
                <h1 className="text-2xl font-bold text-center">Unauthorized Access</h1>
                <p className="text-center">You do not have permission to access this page.</p>
                <div className="text-center">
                    <Link href="/dashboard">
                        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                            Go to Dashboard
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}