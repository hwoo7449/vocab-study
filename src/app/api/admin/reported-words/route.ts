import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const reports = await prisma.wordReport.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ reports });
    } catch (error) {
        console.error('Error fetching reported words:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}