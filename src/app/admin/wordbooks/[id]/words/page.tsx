// src/app/admin/wordbooks/[id]/words/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import WordModal from '@/components/WordModal';
import ExcelUpload from '@/components/ExcelUpload';
import WordListItem from '@/components/WordListItem';
import CommonList from '@/components/CommonList';
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
    const [modalWord, setModalWord] = useState<Word | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [actualSearchTerm, setActualSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('day');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [selectedWords, setSelectedWords] = useState<string[]>([]);
    const [wordsPerPage, setWordsPerPage] = useState(20);
    const router = useRouter();

    const fetchWords = async (page: number, search: string, sort: SortField, order: SortOrder) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/wordbooks/${params.id}/words?page=${page}&limit=${wordsPerPage}&search=${search}&sort=${sort}&order=${order}`);
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

    useEffect(() => {
        fetchWords(currentPage, actualSearchTerm, sortField, sortOrder);
    }, [currentPage, actualSearchTerm, sortField, sortOrder, params.id, wordsPerPage]);

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
            setModalWord(null);
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
            setModalWord(null);
        } catch (error) {
            toast.error('Failed to edit word');
            console.error(error);
        }
    };

    const deleteWords = async (wordIds: string[]) => {
        if (wordIds.length === 0) return;

        const confirmMessage = wordIds.length === 1
            ? "Are you sure you want to delete this word? All related learning progress will be permanently deleted."
            : `Are you sure you want to delete ${wordIds.length} words? All related learning progress will be permanently deleted.`;

        if (!confirm(confirmMessage)) return;

        try {
            const deletePromises = wordIds.map(id =>
                fetch(`/api/wordbooks/${params.id}/words/${id}`, {
                    method: 'DELETE',
                }).then(async response => {
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || `Failed to delete word with id ${id}`);
                    }
                })
            );

            await Promise.all(deletePromises);

            toast.success(wordIds.length === 1 ? 'Word deleted successfully' : 'Words deleted successfully');
            setSelectedWords([]);
            fetchWords(currentPage, searchTerm, sortField, sortOrder);
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(`Failed to delete word(s): ${error.message}`);
            } else {
                toast.error('Failed to delete word(s): An unknown error occurred');
            }
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

    const handleWordSelect = (wordId: string) => {
        setSelectedWords(prev =>
            prev.includes(wordId) ? prev.filter(id => id !== wordId) : [...prev, wordId]
        );
    };

    const handleUploadSuccess = () => {
        fetchWords(currentPage, searchTerm, sortField, sortOrder);
    };

    const renderWord = (word: Word) => (
        <WordListItem
            key={word.id}
            word={word}
            isSelected={selectedWords.includes(word.id)}
            onSelect={handleWordSelect}
            onEdit={setModalWord}
            onDelete={() => deleteWords([word.id])}
        />
    );

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Word Management</h1>

            <ExcelUpload onUploadSuccess={handleUploadSuccess} wordbookId={params.id} />

            {/* 검색 폼 및 페이지당 단어 수 선택 */}
            <div className="flex justify-between mb-4">
                <form onSubmit={handleSearch} className="flex">
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
                <div className="flex items-center">
                    <label htmlFor="wordsPerPage" className="mr-2">Words per page:</label>
                    <select
                        id="wordsPerPage"
                        value={wordsPerPage}
                        onChange={(e) => setWordsPerPage(Number(e.target.value))}
                        className="px-3 py-2 border rounded"
                    >
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                </div>
            </div>

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

            {/* 새 단어 추가 버튼 */}
            <button
                onClick={() => setModalWord({ id: '', english: '', korean: '', day: 1 })}
                className="mb-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
                Add New Word
            </button>

            {/* 선택된 단어 삭제 버튼 */}
            {selectedWords.length > 0 && (
                <button
                    onClick={() => deleteWords(selectedWords)}
                    className="mb-4 ml-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                    Delete Selected ({selectedWords.length})
                </button>
            )}

            {/* 단어 목록 */}
            <CommonList
                items={words}
                renderItem={renderWord}
                onPageChange={setCurrentPage}
                currentPage={currentPage}
                totalPages={totalPages}
            />

            {/* 단어 추가/편집 모달 */}
            {modalWord && (
                <WordModal
                    word={modalWord.id ? modalWord : undefined}
                    onSave={(word) => modalWord.id ? editWord(modalWord.id, word) : addWord(word)}
                    onClose={() => setModalWord(null)}
                />
            )}
        </div>
    );
}