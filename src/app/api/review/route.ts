import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authMiddleware } from '@/middleware/authMiddleware';

export async function GET(req: NextRequest) {
    const authResult = await authMiddleware(req as any);
    if (authResult instanceof NextResponse) return authResult;
    if (!authResult || !authResult.sub) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = authResult.sub;

    const { searchParams } = new URL(req.url);
    const wordbookId = searchParams.get('wordbookId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    try {
        let whereClause: any = {
            userId: userId,
            nextReviewDate: {
                lte: new Date(),
            },
        };

        if (wordbookId) {
            whereClause.wordbookId = wordbookId;
        }

        if (startDate) {
            whereClause.lastReviewDate = {
                ...whereClause.lastReviewDate,
                gte: new Date(startDate),
            };
        }

        if (endDate) {
            whereClause.lastReviewDate = {
                ...whereClause.lastReviewDate,
                lte: new Date(endDate),
            };
        }

        const wordsToReview = await prisma.userProgress.findMany({
            where: whereClause,
            include: {
                word: true,
                wordbook: {
                    select: { name: true }
                }
            },
            orderBy: {
                nextReviewDate: 'asc',
            },
            take: 20,
        });

        const words = wordsToReview.map(progress => ({
            id: progress.word.id,
            english: progress.word.english,
            korean: progress.word.korean,
            wordbookName: progress.wordbook.name,
            userProgress: {
                status: progress.status,
            },
        }));

        return NextResponse.json(words);
    } catch (error) {
        console.error('Failed to fetch review words:', error);
        return NextResponse.json({ error: 'Failed to fetch review words' }, { status: 500 });
    }
}