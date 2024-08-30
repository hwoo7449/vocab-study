import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authMiddleware } from '@/middleware/authMiddleware';

export async function POST(req: NextRequest) {
    const authResult = await authMiddleware(req as any);
    if (authResult instanceof NextResponse) return authResult;
    if (!authResult || !authResult.sub) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = authResult.sub;

    try {
        const { wordId, status } = await req.json();

        const word = await prisma.word.findUnique({ where: { id: wordId } });
        if (!word) {
            return NextResponse.json({ error: 'Word not found' }, { status: 404 });
        }

        const now = new Date();
        let nextReviewDate = new Date(now);

        switch (status) {
            case 'unknown':
                nextReviewDate.setDate(now.getDate() + 1);
                break;
            case 'unsure':
                nextReviewDate.setDate(now.getDate() + 3);
                break;
            case 'known':
                nextReviewDate.setDate(now.getDate() + 7);
                break;
        }

        const progress = await prisma.userProgress.upsert({
            where: {
                userId_wordId: {
                    userId,
                    wordId,
                },
            },
            update: {
                status,
                lastReviewDate: now,
                nextReviewDate,
                reviewCount: { increment: 1 },
            },
            create: {
                userId,
                wordId,
                wordbookId: word.wordbookId,
                status,
                lastReviewDate: now,
                nextReviewDate,
                reviewCount: 1,
            },
        });

        return NextResponse.json(progress);
    } catch (error) {
        console.error('Failed to update progress:', error);
        return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
    }
}