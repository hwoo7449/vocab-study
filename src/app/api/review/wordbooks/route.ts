import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authMiddleware } from '@/middleware/authMiddleware';

export async function GET(req: NextRequest) {
    console.log('Received request to fetch wordbooks for review');
    const authResult = await authMiddleware(req as any);
    if (authResult instanceof NextResponse) return authResult;
    if (!authResult || !authResult.sub) {
        console.log('Unauthorized access attempt');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = authResult.sub;

    try {
        console.log('Fetching wordbooks from database...');
        const wordbooks = await prisma.wordbook.findMany({
            where: {
                userProgresses: {
                    some: {
                        userId: userId,
                        nextReviewDate: { lte: new Date() }
                    }
                }
            },
            select: {
                id: true,
                name: true,
            }
        });

        console.log(`Found ${wordbooks.length} wordbooks for review`);
        return NextResponse.json(wordbooks);
    } catch (error) {
        console.error('Failed to fetch wordbooks for review:', error);
        return NextResponse.json({ error: 'Failed to fetch wordbooks' }, { status: 500 });
    }
}