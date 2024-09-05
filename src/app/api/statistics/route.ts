import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authMiddleware } from '@/middleware/authMiddleware';

interface ProgressDataItem {
    label: string;
    count: number;
}

export async function GET(req: NextRequest) {
    const authResult = await authMiddleware(req as any);
    if (authResult instanceof NextResponse) return authResult;
    if (!authResult || !authResult.sub) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = authResult.sub;

    const { searchParams } = new URL(req.url);
    const progressType = searchParams.get('type') || 'daily';

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

        // 학습 진행 데이터
        let progressData: ProgressDataItem[];
        const now = new Date();
        const endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

        switch (progressType) {
            case 'monthly':
                const startOfYear = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
                progressData = await getMonthlyProgressData(userId, startOfYear);
                break;
            default: // daily
                const startDate = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate() - 6, 0, 0, 0, 0));
                progressData = await getDailyProgressData(userId, startDate, endDate);
        }

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
            progressData,
            wordbookProgress,
        });
    } catch (error) {
        console.error('Failed to fetch statistics:', error);
        return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
    }
}

async function getDailyProgressData(userId: string, startDate: Date, endDate: Date): Promise<ProgressDataItem[]> {
    console.log('getDailyProgressData called with:', {
        userId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
    });

    const progressData = await prisma.$queryRaw<{ date: Date; count: bigint }[]>`
        SELECT DATE("updatedAt" AT TIME ZONE 'UTC') as date, COUNT(*) as count
        FROM "UserProgress"
        WHERE "userId" = ${userId}
          AND "updatedAt" >= ${startDate}
          AND "updatedAt" <= ${endDate}
        GROUP BY DATE("updatedAt" AT TIME ZONE 'UTC')
        ORDER BY DATE("updatedAt" AT TIME ZONE 'UTC')
    `;

    console.log('Raw query result:', progressData.map(item => ({ ...item, count: item.count.toString() })));

    const filledData: ProgressDataItem[] = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setUTCDate(startDate.getUTCDate() + i);
        const dateStr = formatDate(date);
        const existingData = progressData.find(d => formatDate(new Date(d.date)) === dateStr);
        filledData.push({
            label: dateStr,
            count: existingData ? Number(existingData.count) : 0
        });
    }

    console.log('Filled data:', filledData);

    return filledData;
}

async function getMonthlyProgressData(userId: string, startOfYear: Date): Promise<ProgressDataItem[]> {
    const progressData = await prisma.$queryRaw<{ month: number; count: bigint }[]>`
        SELECT EXTRACT(MONTH FROM "updatedAt") as month, COUNT(*) as count
        FROM "UserProgress"
        WHERE "userId" = ${userId}
          AND "updatedAt" >= ${startOfYear}
        GROUP BY EXTRACT(MONTH FROM "updatedAt")
        ORDER BY EXTRACT(MONTH FROM "updatedAt")
    `;

    const filledData: ProgressDataItem[] = [];
    for (let i = 0; i < 12; i++) {
        const month = i + 1;
        const existingData = progressData.find(d => Number(d.month) === month);
        filledData.push({
            label: `${startOfYear.getFullYear()}-${month.toString().padStart(2, '0')}`,
            count: existingData ? Number(existingData.count) : 0
        });
    }

    return filledData;
}

function formatDate(date: Date): string {
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}