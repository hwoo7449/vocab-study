import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authMiddleware } from '@/middleware/authMiddleware';
import { calculateNextReview, WordStatus } from '@/utils/spaceRepetition';

export async function POST(req: NextRequest) {
    const authResult = await authMiddleware(req as any);
    if (authResult instanceof NextResponse) return authResult;
    if (!authResult || !authResult.sub) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = authResult.sub;

    try {
        const { wordId, wordbookId, status } = await req.json();

        const existingProgress = await prisma.userProgress.findUnique({
            where: { userId_wordId: { userId, wordId } },
        });

        const { nextReviewDate, interval, easeFactor } = calculateNextReview(
            existingProgress ? existingProgress.interval : 1,
            existingProgress ? existingProgress.easeFactor : 2.5,
            status as WordStatus
        );

        const progress = await prisma.userProgress.upsert({
            where: {
                userId_wordId: {
                    userId,
                    wordId,
                },
            },
            update: {
                status,
                lastReviewDate: new Date(),
                nextReviewDate,
                reviewCount: { increment: 1 },
                easeFactor,
                interval,
            },
            create: {
                userId,
                wordId,
                wordbookId,
                status,
                lastReviewDate: new Date(),
                nextReviewDate,
                reviewCount: 1,
                easeFactor,
                interval,
            },
        });

        return NextResponse.json(progress);
    } catch (error) {
        console.error('Failed to update progress:', error);
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
    }
}