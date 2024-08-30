// src/app/api/wordbooks/[id]/words/route.ts

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

    const { searchParams } = new URL(req.url);
    const dayParam = searchParams.get('day');
    const day = dayParam ? parseInt(dayParam) : undefined;

    try {
        const words = await prisma.word.findMany({
            where: {
                wordbookId: params.id,
                ...(day !== undefined ? { day } : {}),
            },
            include: {
                userProgresses: {
                    where: { userId },
                },
            },
            orderBy: { id: 'asc' },
        });

        const wordsWithProgress = words.map(word => ({
            ...word,
            userProgress: word.userProgresses[0] || null,
        }));

        return NextResponse.json(wordsWithProgress);
    } catch (error) {
        console.error('Failed to fetch words:', error);
        return NextResponse.json({ error: 'Failed to fetch words' }, { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const authResult = await authMiddleware(req as any);
    if (authResult instanceof NextResponse) return authResult;

    try {
        const data = await req.json();
        const word = await prisma.word.create({
            data: {
                ...data,
                wordbookId: params.id,
            },
        });
        return NextResponse.json(word, { status: 201 });
    } catch (error) {
        console.error('Failed to create word:', error);
        return NextResponse.json({ error: 'Failed to create word' }, { status: 500 });
    }
}