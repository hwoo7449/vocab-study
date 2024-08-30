import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authMiddleware } from '@/middleware/authMiddleware';

function calculateNextReview(status: string, reviewCount: number, easeFactor: number, interval: number): { nextReviewDate: Date, newEaseFactor: number, newInterval: number } {
    const now = new Date();
    let newEaseFactor = easeFactor;
    let newInterval = interval;

    switch (status) {
        case 'known':
            newEaseFactor = Math.max(1.3, easeFactor + 0.1);
            newInterval = Math.round(interval * newEaseFactor);
            break;
        case 'unsure':
            newEaseFactor = Math.max(1.3, easeFactor - 0.15);
            newInterval = Math.max(1, Math.round(interval * 0.5));
            break;
        case 'unknown':
            newEaseFactor = Math.max(1.3, easeFactor - 0.2);
            newInterval = 1;
            break;
    }

    const nextReviewDate = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000);
    return { nextReviewDate, newEaseFactor, newInterval };
}

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

        const { nextReviewDate, newEaseFactor, newInterval } = calculateNextReview(
            status,
            existingProgress ? existingProgress.reviewCount : 0,
            existingProgress ? existingProgress.easeFactor : 2.5,
            existingProgress ? existingProgress.interval : 1
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
                easeFactor: newEaseFactor,
                interval: newInterval,
            },
            create: {
                userId,
                wordId,
                wordbookId,
                status,
                lastReviewDate: new Date(),
                nextReviewDate,
                reviewCount: 1,
                easeFactor: newEaseFactor,
                interval: newInterval,
            },
        });

        return NextResponse.json(progress);
    } catch (error) {
        console.error('Failed to update progress:', error);
        return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
    }
}