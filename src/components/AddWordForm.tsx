// src/components/AddWordForm.tsx

import React, { useState } from 'react';

interface AddWordFormProps {
    wordbookId: string;
    onAddWord: (word: { english: string; korean: string; day: number }) => void;
}

const AddWordForm: React.FC<AddWordFormProps> = ({ wordbookId, onAddWord }) => {
    const [english, setEnglish] = useState('');
    const [korean, setKorean] = useState('');
    const [day, setDay] = useState(1);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddWord({ english, korean, day });
        setEnglish('');
        setKorean('');
        setDay(1);
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
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Add Word
            </button>
        </form>
    );
};

export default AddWordForm;