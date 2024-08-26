import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authMiddleware } from '@/middleware/authMiddleware';

export async function GET(req: NextRequest) {
    const authResult = await authMiddleware(req as any);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    try {
        const [wordbooks, totalCount] = await Promise.all([
            prisma.wordbook.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    totalDays: true,
                    description: true,
                },
            }),
            prisma.wordbook.count(),
        ]);

        return NextResponse.json({
            wordbooks,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
        });
    } catch (error) {
        console.error('Failed to fetch wordbooks:', error);
        return NextResponse.json({ error: 'Failed to fetch wordbooks' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const authResult = await authMiddleware(req as any);
    if (authResult instanceof NextResponse) return authResult;

    try {
        const data = await req.json();
        const wordbook = await prisma.wordbook.create({
            data: {
                name: data.name,
                totalDays: data.totalDays,
                description: data.description,
            },
        });
        return NextResponse.json(wordbook, { status: 201 });
    } catch (error) {
        console.error('Failed to create wordbook:', error);
        return NextResponse.json({ error: 'Failed to create wordbook' }, { status: 500 });
    }
}