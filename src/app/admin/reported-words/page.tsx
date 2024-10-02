'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';

interface WordReport {
    id: string;
    wordId: string;
    wordbookId: string;
    day: number;
    originalEnglish: string;
    originalKorean: string;
    reportedEnglish: string;
    reportedKorean: string;
    status: string;
    createdAt: string;
}

const ReportedWordsPage = () => {
    const [reports, setReports] = useState<WordReport[]>([]);
    const [selectedReports, setSelectedReports] = useState<string[]>([]);
    const { data: session } = useSession();

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await fetch('/api/admin/reported-words');
            if (!response.ok) {
                throw new Error('Failed to fetch reports');
            }
            const data = await response.json();
            setReports(data.reports);
        } catch (error) {
            console.error('Error fetching reports:', error);
            toast.error('Failed to fetch reports');
        }
    };

    const handleAction = async (reportId: string, action: 'accept' | 'reject' | 'delete') => {
        try {
            const response = await fetch(`/api/admin/reported-words/${reportId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action }),
            });

            if (!response.ok) {
                throw new Error(`Failed to ${action} report`);
            }

            if (action === 'delete') {
                toast.success('Report deleted successfully');
            } else {
                toast.success(`Report ${action}ed successfully`);
            }
            fetchReports();
        } catch (error) {
            console.error(`Error ${action}ing report:`, error);
            toast.error(`Failed to ${action} report`);
        }
    };

    const handleUndo = async (reportId: string) => {
        try {
            const response = await fetch(`/api/admin/reported-words/${reportId}/undo`, {
                method: 'PUT',
            });

            if (!response.ok) {
                throw new Error('Failed to undo action');
            }

            toast.success('Action undone successfully');
            fetchReports();
        } catch (error) {
            console.error('Error undoing action:', error);
            toast.error('Failed to undo action');
        }
    };

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setSelectedReports(reports.map(report => report.id));
        } else {
            setSelectedReports([]);
        }
    };

    const handleSelectReport = (reportId: string) => {
        setSelectedReports(prev =>
            prev.includes(reportId)
                ? prev.filter(id => id !== reportId)
                : [...prev, reportId]
        );
    };

    const handleBulkDelete = async () => {
        try {
            const response = await fetch('/api/admin/reported-words/bulk-delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reportIds: selectedReports }),
            });

            if (!response.ok) {
                throw new Error('Failed to delete selected reports');
            }

            toast.success('Selected reports deleted successfully');
            fetchReports();
            setSelectedReports([]);
        } catch (error) {
            console.error('Error deleting selected reports:', error);
            toast.error('Failed to delete selected reports');
        }
    };

    if (!session || session.user.role !== 'admin') {
        return <div>Access denied. Admin only.</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4">Reported Words</h1>
            <div className="mb-4">
                <button
                    onClick={handleBulkDelete}
                    disabled={selectedReports.length === 0}
                    className="bg-red-500 text-white px-4 py-2 rounded disabled:bg-red-300"
                >
                    Delete Selected
                </button>
            </div>
            <table className="min-w-full bg-white">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border-b">
                            <input
                                type="checkbox"
                                onChange={handleSelectAll}
                                checked={selectedReports.length === reports.length}
                            />
                        </th>
                        <th className="py-2 px-4 border-b">Original English</th>
                        <th className="py-2 px-4 border-b">Original Korean</th>
                        <th className="py-2 px-4 border-b">Reported English</th>
                        <th className="py-2 px-4 border-b">Reported Korean</th>
                        <th className="py-2 px-4 border-b">Status</th>
                        <th className="py-2 px-4 border-b">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {reports.map((report) => (
                        <tr key={report.id}>
                            <td className="py-2 px-4 border-b">
                                <input
                                    type="checkbox"
                                    checked={selectedReports.includes(report.id)}
                                    onChange={() => handleSelectReport(report.id)}
                                />
                            </td>
                            <td className="py-2 px-4 border-b">{report.originalEnglish}</td>
                            <td className="py-2 px-4 border-b">{report.originalKorean}</td>
                            <td className="py-2 px-4 border-b">{report.reportedEnglish}</td>
                            <td className="py-2 px-4 border-b">{report.reportedKorean}</td>
                            <td className="py-2 px-4 border-b">{report.status}</td>
                            <td className="py-2 px-4 border-b">
                                {report.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => handleAction(report.id, 'accept')}
                                            className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                                        >
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => handleAction(report.id, 'reject')}
                                            className="bg-red-500 text-white px-2 py-1 rounded mr-2"
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}
                                {(report.status === 'accepted' || report.status === 'rejected') && (
                                    <button
                                        onClick={() => handleUndo(report.id)}
                                        className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                                    >
                                        Undo
                                    </button>
                                )}
                                <button
                                    onClick={() => handleAction(report.id, 'delete')}
                                    className="bg-gray-500 text-white px-2 py-1 rounded"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ReportedWordsPage;