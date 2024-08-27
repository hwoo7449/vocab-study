// src/components/WordListItem.tsx

import React from 'react';

interface Word {
    id: string;
    english: string;
    korean: string;
    day: number;
}

interface WordListItemProps {
    word: Word;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onEdit: (word: Word) => void;
    onDelete: (id: string) => void;
}

const WordListItem: React.FC<WordListItemProps> = ({ word, isSelected, onSelect, onEdit, onDelete }) => {
    return (
        <li className="bg-white shadow rounded p-2 flex items-center">
            <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelect(word.id)}
                className="mr-2"
            />
            <span className="flex-grow">
                <strong>English:</strong> {word.english} |
                <strong> Korean:</strong> {word.korean} |
                <strong> Day:</strong> {word.day}
            </span>
            <button
                onClick={() => onEdit(word)}
                className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
            >
                Edit
            </button>
            <button
                onClick={() => onDelete(word.id)}
                className="bg-red-500 text-white px-2 py-1 rounded"
            >
                Delete
            </button>
        </li>
    );
};

export default WordListItem;