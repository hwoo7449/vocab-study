// src/components/EditWordForm.tsx

import React, { useState, useEffect } from 'react';

interface EditWordFormProps {
    word: {
        id: string;
        english: string;
        korean: string;
        day: number;
    };
    onEditWord: (id: string, updatedWord: { english: string; korean: string; day: number }) => void;
    onCancel: () => void;
}

const EditWordForm: React.FC<EditWordFormProps> = ({ word, onEditWord, onCancel }) => {
    const [english, setEnglish] = useState(word.english);
    const [korean, setKorean] = useState(word.korean);
    const [day, setDay] = useState(word.day);

    useEffect(() => {
        setEnglish(word.english);
        setKorean(word.korean);
        setDay(word.day);
    }, [word]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onEditWord(word.id, { english, korean, day });
    };

    return (
        <form onSubmit={handleSubmit} className="mb-4 p-4 bg-white shadow rounded">
            <div className="mb-2">
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
            <div className="mb-2">
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
            <div className="mb-2">
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
                <button type="button" onClick={onCancel} className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400">
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default EditWordForm;