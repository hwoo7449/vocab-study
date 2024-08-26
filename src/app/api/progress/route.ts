import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { wordId, status } = await request.json();

    if (!wordId || !status) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
        const userProgress = await prisma.userProgress.upsert({
            where: {
                userId_wordId: {
                    userId: session.user.id,
                    wordId: wordId,
                },
            },
            update: {
                status: status,
            },
            create: {
                userId: session.user.id,
                wordId: wordId,
                status: status,
            },
        });

        return NextResponse.json(userProgress);
    } catch (error) {
        console.error('Error saving progress:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}