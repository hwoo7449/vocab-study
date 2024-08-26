import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // 이 줄을 수정합니다

export async function GET(
    request: Request,
    { params }: { params: { day: string } }
) {
    const day = parseInt(params.day);

    if (isNaN(day)) {
        return NextResponse.json({ error: 'Invalid day parameter' }, { status: 400 });
    }

    try {
        const words = await prisma.word.findMany({
            where: { day: day },
            select: { id: true, english: true, korean: true }
        });

        return NextResponse.json(words);
    } catch (error) {
        console.error('Error fetching words:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}