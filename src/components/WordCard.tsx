import React, { useState, useEffect } from 'react';
import { WordStatus } from '@/utils/spaceRepetition';
import ReportModal from './ReportModal';

interface WordCardProps {
    word: {
        id: string;
        english: string;
        korean: string;
        day: number;
        wordbookId: string;
    };
    onStatusChange: (status: WordStatus) => void;
}

const WordCard: React.FC<WordCardProps> = ({ word, onStatusChange }) => {
    const [showMeaning, setShowMeaning] = useState(false);
    const [status, setStatus] = useState<WordStatus | null>(null);
    const [showReportModal, setShowReportModal] = useState(false);

    useEffect(() => {
        setShowMeaning(false);
        setStatus(null);
    }, [word]);

    const handleStatusChange = (newStatus: WordStatus) => {
        setStatus(newStatus);
        onStatusChange(newStatus);
    };

    const toggleMeaning = () => {
        setShowMeaning(!showMeaning);
    };

    const handleReport = () => {
        setShowReportModal(true);
    };

    return (
        <div className="bg-white shadow-lg rounded-lg p-6 m-4 w-80 relative">
            <button
                className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-sm"
                onClick={handleReport}
            >
                Report
            </button>
            <h2 className="text-2xl font-bold mb-4">{word.english}</h2>
            <button
                className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
                onClick={toggleMeaning}
            >
                {showMeaning ? 'Hide Meaning' : 'Show Meaning'}
            </button>
            {showMeaning && <p className="text-lg mb-4">{word.korean}</p>}
            <div className="flex justify-between mt-4">
                <button
                    className={`px-4 py-2 rounded ${status === 'unknown' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => handleStatusChange('unknown')}
                >
                    Don't Know
                </button>
                <button
                    className={`px-4 py-2 rounded ${status === 'unsure' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => handleStatusChange('unsure')}
                >
                    Unsure
                </button>
                <button
                    className={`px-4 py-2 rounded ${status === 'known' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => handleStatusChange('known')}
                >
                    Know
                </button>
            </div>
            {showReportModal && (
                <ReportModal
                    word={word}
                    onClose={() => setShowReportModal(false)}
                />
            )}
        </div>
    );
};

export default WordCard;