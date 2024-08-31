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
        const { wordStatuses } = await req.json();

        const reviewSession = await prisma.reviewSession.create({
            data: {
                userId,
                reviews: {
                    create: Object.entries(wordStatuses).map(([wordId, status]) => ({
                        wordId,
                        isCorrect: status === 'known', // 'known'인 경우만 맞은 것으로 간주
                    })),
                },
            },
        });

        return NextResponse.json({ sessionId: reviewSession.id });
    } catch (error) {
        console.error('Failed to end review session:', error);
        return NextResponse.json({ error: 'Failed to end review session' }, { status: 500 });
    }
}