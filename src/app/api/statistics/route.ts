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

    try {
        // 총 학습한 단어 수
        const totalWordsLearned = await prisma.userProgress.count({
            where: { userId },
        });

        // 상태별 단어 수
        const wordsByStatus = await prisma.userProgress.groupBy({
            by: ['status'],
            where: { userId },
            _count: true,
        });

        // 최근 7일간의 일일 학습 단어 수
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const dailyProgress = await prisma.userProgress.groupBy({
            by: ['lastReviewDate'],
            where: {
                userId,
                lastReviewDate: { gte: sevenDaysAgo },
            },
            _count: true,
        });

        // 단어장별 학습 진행도
        const wordbookProgress = await prisma.wordbook.findMany({
            where: { userProgresses: { some: { userId } } },
            select: {
                id: true,
                name: true,
                _count: {
                    select: { words: true },
                },
                userProgresses: {
                    where: { userId },
                    select: { status: true },
                },
            },
        });

        return NextResponse.json({
            totalWordsLearned,
            wordsByStatus,
            dailyProgress,
            wordbookProgress,
        });
    } catch (error) {
        console.error('Failed to fetch statistics:', error);
        return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
    }
}