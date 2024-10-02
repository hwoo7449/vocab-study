// src/app/api/admin/reported-words/[id]/undo/route.ts

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

        const { id } = params;

        const report = await prisma.wordReport.findUnique({ where: { id } });
        if (!report) {
            return NextResponse.json({ error: 'Report not found' }, { status: 404 });
        }

        if (report.status === 'accepted') {
            await prisma.$transaction([
                prisma.word.update({
                    where: { id: report.wordId },
                    data: {
                        english: report.originalEnglish,
                        korean: report.originalKorean,
                    },
                }),
                prisma.wordReport.update({
                    where: { id },
                    data: { status: 'pending' },
                }),
            ]);
        } else if (report.status === 'rejected') {
            await prisma.wordReport.update({
                where: { id },
                data: { status: 'pending' },
            });
        } else {
            return NextResponse.json({ error: 'Cannot undo pending report' }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error undoing reported word action:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}