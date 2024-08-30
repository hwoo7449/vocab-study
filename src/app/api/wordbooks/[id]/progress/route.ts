import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authMiddleware } from '@/middleware/authMiddleware';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const authResult = await authMiddleware(req as any);
    if (authResult instanceof NextResponse) return authResult;
    if (!authResult || !authResult.sub) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = authResult.sub;

    try {
        const wordbook = await prisma.wordbook.findUnique({
            where: { id: params.id },
            include: {
                words: {
                    include: {
                        userProgresses: {
                            where: { userId },
                        },
                    },
                },
            },
        });

        if (!wordbook) {
            return NextResponse.json({ error: 'Wordbook not found' }, { status: 404 });
        }

        const dayProgress = Array.from({ length: wordbook.totalDays }, (_, i) => i + 1).map(day => {
            const dayWords = wordbook.words.filter(word => word.day === day);
            const learnedWords = dayWords.filter(word =>
                word.userProgresses.length > 0 && word.userProgresses[0].status === 'known'
            );

            return {
                day,
                totalWords: dayWords.length,
                learnedWords: learnedWords.length,
            };
        });

        return NextResponse.json(dayProgress);
    } catch (error) {
        console.error('Failed to fetch wordbook progress:', error);
        return NextResponse.json({ error: 'Failed to fetch wordbook progress' }, { status: 500 });
    }
}