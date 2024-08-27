// src/components/ExcelUpload.tsx

import React, { useState } from 'react';
import { toast } from 'react-toastify';

interface ExcelUploadProps {
    onUploadSuccess: () => void;
    wordbookId?: string;
}

const ExcelUpload: React.FC<ExcelUploadProps> = ({ onUploadSuccess, wordbookId }) => {
    const [file, setFile] = useState<File | null>(null);
    const [wordbookName, setWordbookName] = useState('');

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            toast.error('Please select a file');
            return;
        }
        if (!wordbookId && !wordbookName) {
            toast.error('Please provide a wordbook name');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        if (wordbookName) formData.append('name', wordbookName);

        const url = wordbookId
            ? `/api/wordbooks/${wordbookId}/words/upload`
            : '/api/wordbooks/create-from-excel';

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to upload file');
            }

            const data = await response.json();
            toast.success(wordbookId
                ? `Successfully uploaded ${data.count} words`
                : `Wordbook "${data.wordbook.name}" created with ${data.wordbook.words.length} words`
            );
            setFile(null);
            setWordbookName('');
            onUploadSuccess();
        } catch (error) {
            if (error instanceof Error) {
                toast.error(`Failed to upload file: ${error.message}`);
            } else {
                toast.error('Failed to upload file: Unknown error');
            }
            console.error(error);
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            const response = await fetch('/api/wordbooks/template');
            if (!response.ok) throw new Error('Failed to download template');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'wordbook_template.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            toast.error('Failed to download template');
            console.error(error);
        }
    };

    return (
        <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">
                {wordbookId ? 'Upload Words from Excel' : 'Create Wordbook from Excel'}
            </h2>
            <button
                onClick={handleDownloadTemplate}
                className="mb-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
                Download Template
            </button>
            <form onSubmit={handleUpload} className="mb-4">
                {!wordbookId && (
                    <input
                        type="text"
                        value={wordbookName}
                        onChange={(e) => setWordbookName(e.target.value)}
                        placeholder="Enter wordbook name"
                        className="px-3 py-2 border rounded mr-2"
                    />
                )}
                <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="mb-2"
                />
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                    Upload Excel
                </button>
            </form>
        </div>
    );
};

export default ExcelUpload;