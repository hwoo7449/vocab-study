import React, { useState, useEffect } from 'react';
import { WordStatus } from '@/utils/spaceRepetition';

interface WordCardProps {
    word: string;
    meaning: string;
    onStatusChange: (status: WordStatus) => void;
}

const WordCard: React.FC<WordCardProps> = ({ word, meaning, onStatusChange }) => {
    const [showMeaning, setShowMeaning] = useState(false);
    const [status, setStatus] = useState<WordStatus | null>(null);

    useEffect(() => {
        // Reset state when word changes
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

    return (
        <div className="bg-white shadow-lg rounded-lg p-6 m-4 w-80">
            <h2 className="text-2xl font-bold mb-4">{word}</h2>
            <button
                className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
                onClick={toggleMeaning}
            >
                {showMeaning ? 'Hide Meaning' : 'Show Meaning'}
            </button>
            {showMeaning && <p className="text-lg mb-4">{meaning}</p>}
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
        </div>
    );
};

export default WordCard;