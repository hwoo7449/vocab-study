import React, { useState, useEffect } from 'react';

interface WordModalProps {
    word?: {
        id: string;
        english: string;
        korean: string;
        day: number;
    };
    onSave: (word: { english: string; korean: string; day: number }) => void;
    onClose: () => void;
}

const WordModal: React.FC<WordModalProps> = ({ word, onSave, onClose }) => {
    const [english, setEnglish] = useState(word?.english || '');
    const [korean, setKorean] = useState(word?.korean || '');
    const [day, setDay] = useState(word?.day || 1);

    useEffect(() => {
        if (word) {
            setEnglish(word.english);
            setKorean(word.korean);
            setDay(word.day);
        }
    }, [word]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ english, korean, day });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
                <h2 className="text-xl font-bold mb-4">{word ? 'Edit Word' : 'Add Word'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="english" className="block text-sm font-bold mb-1">English:</label>
                        <input
                            type="text"
                            id="english"
                            value={english}
                            onChange={(e) => setEnglish(e.target.value)}
                            required
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="korean" className="block text-sm font-bold mb-1">Korean:</label>
                        <input
                            type="text"
                            id="korean"
                            value={korean}
                            onChange={(e) => setKorean(e.target.value)}
                            required
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="day" className="block text-sm font-bold mb-1">Day:</label>
                        <input
                            type="number"
                            id="day"
                            value={day}
                            onChange={(e) => setDay(parseInt(e.target.value))}
                            required
                            min={1}
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                            Save
                        </button>
                        <button type="button" onClick={onClose} className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WordModal;