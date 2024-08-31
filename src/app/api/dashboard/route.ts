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
        // 전체 학습 진행 상황
        const totalProgress = await prisma.userProgress.groupBy({
            by: ['status'],
            where: { userId },
            _count: true,
        });

        // 최근 학습한 단어
        const recentWords = await prisma.userProgress.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
            take: 5,
            include: { word: true },
        });

        // 다음 복습 예정 단어 수
        const reviewDueCount = await prisma.userProgress.count({
            where: {
                userId,
                nextReviewDate: { lte: new Date() },
            },
        });

        // 일일 학습 통계
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dailyStats = await prisma.userProgress.count({
            where: {
                userId,
                updatedAt: { gte: today },
            },
        });

        return NextResponse.json({
            totalProgress,
            recentWords,
            reviewDueCount,
            dailyStats,
        });
    } catch (error) {
        console.error('Dashboard data fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
    }
}