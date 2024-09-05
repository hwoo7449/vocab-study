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
        const totalWords = await prisma.word.count();
        const learnedWords = await prisma.userProgress.count({
            where: { userId, status: 'known' },
        });
        const totalProgress = Math.round((learnedWords / totalWords) * 100);

        // 일일 목표 (임시로 20단어로 설정)
        const dailyGoal = 20;

        // 오늘의 학습 단어 수
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dailyAchievement = await prisma.userProgress.count({
            where: {
                userId,
                updatedAt: { gte: today },
            },
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

        // 어려운 단어들 (status가 'unknown'인 단어들)
        const difficultWords = await prisma.userProgress.findMany({
            where: { userId, status: 'unknown' },
            take: 5,
            include: { word: true },
        });

        // 다음 학습 추천
        const nextDay = await prisma.userProgress.findFirst({
            where: { userId },
            orderBy: { word: { day: 'asc' } },
            select: { word: { select: { day: true } } },
        });
        const nextLearningRecommendation = nextDay
            ? `You're ready to learn Day ${nextDay.word.day} words!`
            : "Start learning new words today!";

        return NextResponse.json({
            totalProgress,
            dailyGoal,
            dailyAchievement,
            recentWords: recentWords.map(progress => ({
                word: { english: progress.word.english, korean: progress.word.korean }
            })),
            reviewDueCount,
            difficultWords: difficultWords.map(progress => ({
                english: progress.word.english,
                korean: progress.word.korean
            })),
            nextLearningRecommendation,
        });
    } catch (error) {
        console.error('Dashboard data fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
    }
}