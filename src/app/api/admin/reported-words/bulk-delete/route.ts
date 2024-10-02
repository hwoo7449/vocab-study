// src/app/api/admin/reported-words/bulk-delete/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { reportIds } = await req.json();

        if (!Array.isArray(reportIds) || reportIds.length === 0) {
            return NextResponse.json({ error: 'Invalid reportIds' }, { status: 400 });
        }

        await prisma.wordReport.deleteMany({
            where: {
                id: {
                    in: reportIds
                }
            }
        });

        return NextResponse.json({ success: true, message: 'Reports deleted successfully' });
    } catch (error) {
        console.error('Error deleting reports:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}