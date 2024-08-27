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

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string; wordId: string } }
) {
    const authResult = await authMiddleware(req as any);
    if (authResult instanceof NextResponse) return authResult;

    try {
        // 트랜잭션을 사용하여 관련된 UserProgress 레코드와 Word를 함께 삭제합니다.
        await prisma.$transaction(async (prisma) => {
            // 먼저 관련된 UserProgress 레코드를 삭제합니다.
            await prisma.userProgress.deleteMany({
                where: { wordId: params.wordId },
            });

            // 그 다음 Word를 삭제합니다.
            await prisma.word.delete({
                where: { id: params.wordId },
            });
        });

        return NextResponse.json({ message: 'Word and related progress deleted successfully' });
    } catch (error) {
        console.error('Failed to delete word:', error);
        return NextResponse.json({ error: 'Failed to delete word' }, { status: 500 });
    }
}