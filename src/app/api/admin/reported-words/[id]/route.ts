// src/app/api/admin/reported-words/[id]/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { action } = await req.json();
        const { id } = params;

        const report = await prisma.wordReport.findUnique({ where: { id } });
        if (!report) {
            return NextResponse.json({ error: 'Report not found' }, { status: 404 });
        }

        switch (action) {
            case 'accept':
                await prisma.$transaction([
                    prisma.word.update({
                        where: { id: report.wordId },
                        data: {
                            english: report.reportedEnglish,
                            korean: report.reportedKorean,
                        },
                    }),
                    prisma.wordReport.update({
                        where: { id },
                        data: { status: 'accepted' },
                    }),
                ]);
                break;
            case 'reject':
                await prisma.wordReport.update({
                    where: { id },
                    data: { status: 'rejected' },
                });
                break;
            case 'delete':
                await prisma.wordReport.delete({
                    where: { id },
                });
                break;
            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating reported word:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}