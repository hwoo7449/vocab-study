import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authMiddleware } from '@/middleware/authMiddleware';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const wordbook = await prisma.wordbook.findUnique({
            where: { id: params.id },
        });
        if (!wordbook) {
            return NextResponse.json({ error: 'Wordbook not found' }, { status: 404 });
        }
        return NextResponse.json(wordbook);
    } catch (error) {
        console.error('Failed to fetch wordbook:', error);
        return NextResponse.json({ error: 'Failed to fetch wordbook' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const data = await request.json();
        const updatedWordbook = await prisma.wordbook.update({
            where: { id: params.id },
            data: {
                name: data.name,
                totalDays: data.totalDays,
                description: data.description,
            },
        });
        return NextResponse.json(updatedWordbook);
    } catch (error) {
        console.error('Failed to update wordbook:', error);
        return NextResponse.json({ error: 'Failed to update wordbook' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const authResult = await authMiddleware(req as any);
    if (authResult instanceof NextResponse) return authResult;

    try {
        // 트랜잭션을 사용하여 관련된 모든 데이터를 삭제
        await prisma.$transaction(async (prisma) => {
            // 1. 해당 Wordbook의 모든 Word에 연결된 UserProgress 삭제
            await prisma.userProgress.deleteMany({
                where: { wordbookId: params.id }
            });

            // 2. 해당 Wordbook의 모든 Word 삭제
            await prisma.word.deleteMany({
                where: { wordbookId: params.id }
            });

            // 3. Wordbook 삭제
            await prisma.wordbook.delete({
                where: { id: params.id }
            });
        });

        return NextResponse.json({ message: 'Wordbook and related data deleted successfully' });
    } catch (error) {
        console.error('Failed to delete wordbook:', error);
        return NextResponse.json({ error: 'Failed to delete wordbook' }, { status: 500 });
    }
}