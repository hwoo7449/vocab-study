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
        const totalWords = await prisma.word.count();
        const userProgress = await prisma.userProgress.groupBy({
            by: ['status'],
            where: {
                userId: userId,
            },
            _count: {
                status: true,
            },
        });

        const stats = {
            totalWords,
            knownWords: 0,
            learningWords: 0,
            unknownWords: 0,
        };

        userProgress.forEach((progress) => {
            switch (progress.status) {
                case 'known':
                    stats.knownWords = progress._count.status;
                    break;
                case 'unsure':
                    stats.learningWords = progress._count.status;
                    break;
                case 'unknown':
                    stats.unknownWords = progress._count.status;
                    break;
            }
        });

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Failed to fetch progress stats:', error);
        return NextResponse.json({ error: 'Failed to fetch progress stats' }, { status: 500 });
    }
}