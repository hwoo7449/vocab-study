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
    const days = searchParams.get('days');

    if (!wordbookId) {
        return NextResponse.json({ error: 'Wordbook ID is required' }, { status: 400 });
    }

    try {
        let whereClause: any = {
            userId: userId,
            wordbookId: wordbookId,
            nextReviewDate: {
                lte: new Date(),
            },
        };

        if (days) {
            const daysList = days.split(',').map(Number);
            whereClause.word = {
                day: {
                    in: daysList
                }
            };
        }

        const wordsToReview = await prisma.userProgress.findMany({
            where: whereClause,
            include: {
                word: true,
                wordbook: {
                    select: { name: true, id: true }
                }
            },
            orderBy: {
                nextReviewDate: 'asc',
            },
        });

        const words = wordsToReview.map(progress => ({
            id: progress.word.id,
            english: progress.word.english,
            korean: progress.word.korean,
            wordbookName: progress.wordbook.name,
            wordbookId: progress.wordbook.id,
            day: progress.word.day, // day 정보 추가
            userProgress: {
                status: progress.status
            }
        }));

        return NextResponse.json(words);
    } catch (error) {
        console.error('Failed to fetch review words:', error);
        return NextResponse.json({ error: 'Failed to fetch review words' }, { status: 500 });
    }
}