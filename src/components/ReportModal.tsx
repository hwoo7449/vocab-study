import React, { useState } from 'react';
import { toast } from 'react-toastify';

interface ReportModalProps {
    word: {
        id: string;
        english: string;
        korean: string;
        day: number;
        wordbookId: string;
    };
    onClose: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ word, onClose }) => {
    const [reportedEnglish, setReportedEnglish] = useState(word.english);
    const [reportedKorean, setReportedKorean] = useState(word.korean);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 변경사항이 없는 경우 제출을 막음
        if (reportedEnglish === word.english && reportedKorean === word.korean) {
            toast.warning('No changes were made. Please modify the word or meaning before reporting.');
            return;
        }

        try {
            const response = await fetch('/api/words/report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    wordId: word.id,
                    wordbookId: word.wordbookId,
                    day: word.day,
                    originalEnglish: word.english,
                    originalKorean: word.korean,
                    reportedEnglish,
                    reportedKorean,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit report');
            }

            toast.success('Report submitted successfully');
            onClose();
        } catch (error) {
            console.error('Error submitting report:', error);
            toast.error('Failed to submit report');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
                <h2 className="text-xl font-bold mb-4">Report Word</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="reportedEnglish" className="block text-sm font-medium text-gray-700">
                            English
                        </label>
                        <input
                            type="text"
                            id="reportedEnglish"
                            value={reportedEnglish}
                            onChange={(e) => setReportedEnglish(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="reportedKorean" className="block text-sm font-medium text-gray-700">
                            Korean
                        </label>
                        <input
                            type="text"
                            id="reportedKorean"
                            value={reportedKorean}
                            onChange={(e) => setReportedKorean(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Submit Report
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportModal;