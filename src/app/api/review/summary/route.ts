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
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
        return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    try {
        const reviewSession = await prisma.reviewSession.findUnique({
            where: { id: sessionId },
            include: { reviews: true },
        });

        if (!reviewSession || reviewSession.userId !== userId) {
            return NextResponse.json({ error: 'Review session not found' }, { status: 404 });
        }

        const totalWords = reviewSession.reviews.length;
        const correctWords = reviewSession.reviews.filter(review => review.isCorrect).length;
        const incorrectWords = totalWords - correctWords;
        const accuracy = totalWords > 0 ? correctWords / totalWords : 0;

        return NextResponse.json({
            totalWords,
            correctWords,
            incorrectWords,
            accuracy,
        });
    } catch (error) {
        console.error('Failed to fetch review summary:', error);
        return NextResponse.json({ error: 'Failed to fetch review summary' }, { status: 500 });
    }
}