import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authMiddleware } from '@/middleware/authMiddleware';

export async function GET(
    req: NextRequest,
    { params }: { params: { wordbookId: string; day: string } }
) {
    const authResult = await authMiddleware(req as any);
    if (authResult instanceof NextResponse) return authResult;
    if (!authResult || !authResult.sub) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = authResult.sub;

    try {
        const wordbookId = params.wordbookId;
        const day = parseInt(params.day);

        const userProgress = await prisma.userProgress.findMany({
            where: {
                userId,
                wordbookId,
                word: {
                    day,
                },
                status: {
                    not: '',  // 빈 문자열이 아닌 상태만 선택
                },
            },
            include: {
                word: true,
            },
        });

        const totalWords = userProgress.length;
        const knownWords = userProgress.filter(progress => progress.status === 'known').length;
        const unsureWords = userProgress.filter(progress => progress.status === 'unsure').length;
        const unknownWords = userProgress.filter(progress => progress.status === 'unknown').length;

        const nextReviewDate = userProgress.reduce((earliest, progress) => {
            return progress.nextReviewDate < earliest ? progress.nextReviewDate : earliest;
        }, new Date(8640000000000000)); // Max date

        return NextResponse.json({
            totalWords,
            knownWords,
            unsureWords,
            unknownWords,
            nextReviewDate,
        });
    } catch (error) {
        console.error('Failed to fetch study summary:', error);
        return NextResponse.json({ error: 'Failed to fetch study summary' }, { status: 500 });
    }
}