// src/app/api/words/report/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const {
            wordId,
            wordbookId,
            day,
            originalEnglish,
            originalKorean,
            reportedEnglish,
            reportedKorean,
        } = await req.json();

        const wordReport = await prisma.wordReport.create({
            data: {
                wordId,
                wordbookId,
                day,
                originalEnglish,
                originalKorean,
                reportedEnglish,
                reportedKorean,
                userId: session.user.id,
            },
        });

        return NextResponse.json({ success: true, wordReport });
    } catch (error) {
        console.error('Error creating word report:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}