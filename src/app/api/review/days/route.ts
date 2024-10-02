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

    if (!wordbookId) {
        return NextResponse.json({ error: 'Wordbook ID is required' }, { status: 400 });
    }

    try {
        const days = await prisma.word.findMany({
            where: {
                wordbookId: wordbookId,
                userProgresses: {
                    some: {
                        userId: userId,
                        nextReviewDate: { lte: new Date() }
                    }
                }
            },
            select: {
                day: true,
            },
            distinct: ['day'],
            orderBy: {
                day: 'asc',
            },
        });

        return NextResponse.json(days.map(d => d.day));
    } catch (error) {
        console.error('Failed to fetch review days:', error);
        return NextResponse.json({ error: 'Failed to fetch review days' }, { status: 500 });
    }
}