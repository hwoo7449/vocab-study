// src/app/api/wordbooks/[id]/words/[wordId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authMiddleware } from '@/middleware/authMiddleware';

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string; wordId: string } }
) {
    const authResult = await authMiddleware(req as any);
    if (authResult instanceof NextResponse) return authResult;

    try {
        const data = await req.json();
        const updatedWord = await prisma.word.update({
            where: { id: params.wordId },
            data: {
                english: data.english,
                korean: data.korean,
                day: data.day,
            },
        });
        return NextResponse.json(updatedWord);
    } catch (error) {
        console.error('Failed to update word:', error);
        return NextResponse.json({ error: 'Failed to update word' }, { status: 500 });
    }
}