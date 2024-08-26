// src/app/admin/wordbooks/[id]/words/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import AddWordForm from '@/components/AddWordForm';
import EditWordForm from '@/components/EditWordForm';
import { toast } from 'react-toastify';

interface Word {
    id: string;
    english: string;
    korean: string;
    day: number;
}

type SortField = 'english' | 'korean' | 'day';
type SortOrder = 'asc' | 'desc';

export default function WordManagementPage({ params }: { params: { id: string } }) {
    const [words, setWords] = useState<Word[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [editingWord, setEditingWord] = useState<Word | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [actualSearchTerm, setActualSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('day');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const router = useRouter();

    useEffect(() => {
        fetchWords(currentPage, actualSearchTerm, sortField, sortOrder);
    }, [currentPage, actualSearchTerm, sortField, sortOrder, params.id]);

    const fetchWords = async (page: number, search: string, sort: SortField, order: SortOrder) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/wordbooks/${params.id}/words?page=${page}&limit=20&search=${search}&sort=${sort}&order=${order}`);
            if (!response.ok) throw new Error('Failed to fetch words');
            const data = await response.json();
            setWords(data.words);
            setTotalPages(data.totalPages);
        } catch (error) {
            toast.error('Failed to load words');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const addWord = async (word: Omit<Word, 'id'>) => {
        try {
            const response = await fetch(`/api/wordbooks/${params.id}/words`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(word),
            });
            if (!response.ok) throw new Error('Failed to add word');
            toast.success('Word added successfully');
            fetchWords(currentPage, searchTerm, sortField, sortOrder);
        } catch (error) {
            toast.error('Failed to add word');
            console.error(error);
        }
    };

    const editWord = async (id: string, updatedWord: Omit<Word, 'id'>) => {
        try {
            const response = await fetch(`/api/wordbooks/${params.id}/words/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedWord),
            });
            if (!response.ok) throw new Error('Failed to edit word');
            toast.success('Word edited successfully');
            fetchWords(currentPage, searchTerm, sortField, sortOrder);
            setEditingWord(null);
        } catch (error) {
            toast.error('Failed to edit word');
            console.error(error);
        }
    };

    const deleteWord = async (wordId: string) => {
        if (!confirm('Are you sure you want to delete this word?')) return;

        try {
            const response = await fetch(`/api/wordbooks/${params.id}/words/${wordId}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete word');
            toast.success('Word deleted successfully');
            fetchWords(currentPage, searchTerm, sortField, sortOrder);
        } catch (error) {
            toast.error('Failed to delete word');
            console.error(error);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setActualSearchTerm(searchTerm);
        setCurrentPage(1);
    };

    const handleSort = (field: SortField) => {
        if (field === sortField) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Word Management</h1>

            {/* 검색 폼 */}
            <form onSubmit={handleSearch} className="mb-4">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search words..."
                    className="px-3 py-2 border rounded mr-2"
                />
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                    Search
                </button>
            </form>

            {/* 정렬 버튼 */}
            <div className="mb-4">
                <button onClick={() => handleSort('english')} className="mr-2 px-3 py-1 bg-gray-200 rounded">
                    Sort by English {sortField === 'english' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
                <button onClick={() => handleSort('korean')} className="mr-2 px-3 py-1 bg-gray-200 rounded">
                    Sort by Korean {sortField === 'korean' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
                <button onClick={() => handleSort('day')} className="px-3 py-1 bg-gray-200 rounded">
                    Sort by Day {sortField === 'day' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
            </div>

            {!editingWord && <AddWordForm wordbookId={params.id} onAddWord={addWord} />}
            {editingWord && (
                <EditWordForm
                    word={editingWord}
                    onEditWord={editWord}
                    onCancel={() => setEditingWord(null)}
                />
            )}

            {/* 단어 목록 */}
            <ul className="space-y-2 mt-4">
                {words.map((word) => (
                    <li key={word.id} className="bg-white shadow rounded p-2">
                        <p><strong>English:</strong> {word.english}</p>
                        <p><strong>Korean:</strong> {word.korean}</p>
                        <p><strong>Day:</strong> {word.day}</p>
                        <button
                            onClick={() => setEditingWord(word)}
                            className="mt-2 bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => deleteWord(word.id)}
                            className="mt-2 bg-red-500 text-white px-2 py-1 rounded"
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>

            {/* 페이지네이션 컨트롤 */}
            <div className="mt-4 flex justify-center">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-blue-500 text-white rounded mr-2 disabled:bg-gray-300"
                >
                    Previous
                </button>
                <span className="px-4 py-2">{currentPage} / {totalPages}</span>
                <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-blue-500 text-white rounded ml-2 disabled:bg-gray-300"
                >
                    Next
                </button>
            </div>
        </div>
    );
}