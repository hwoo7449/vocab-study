'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DaySelectionPage() {
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    const days = Array.from({ length: 30 }, (_, i) => i + 1);

    return (
        <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
            <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
                <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
                    <div className="max-w-md mx-auto">
                        <h1 className="text-2xl font-semibold mb-6">Select a Day to Study</h1>
                        <div className="grid grid-cols-5 gap-4">
                            {days.map((day) => (
                                <button
                                    key={day}
                                    onClick={() => setSelectedDay(day)}
                                    className={`p-2 rounded ${selectedDay === day
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 hover:bg-gray-300'
                                        }`}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                        {selectedDay && (
                            <Link href={`/study/${selectedDay}`}>
                                <div className="mt-6 bg-green-500 text-white p-2 rounded text-center cursor-pointer hover:bg-green-600">
                                    Start Studying Day {selectedDay}
                                </div>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}