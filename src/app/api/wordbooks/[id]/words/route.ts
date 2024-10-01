// src/app/api/wordbooks/[id]/words/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authMiddleware } from '@/middleware/authMiddleware';
import { Prisma } from '@prisma/client';

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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') as 'english' | 'korean' | 'day' || 'day';
    const order = searchParams.get('order') as 'asc' | 'desc' || 'asc';

    const skip = (page - 1) * limit;

    try {
        const where: Prisma.WordWhereInput = {
            wordbookId: params.id,
            OR: [
                { english: { contains: search, mode: 'insensitive' } },
                { korean: { contains: search, mode: 'insensitive' } },
            ],
        };

        const [words, totalCount] = await Promise.all([
            prisma.word.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sort]: order },
            }),
            prisma.word.count({ where }),
        ]);

        return NextResponse.json({
            words,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
        });
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