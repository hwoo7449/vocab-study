import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        await prisma.wordbook.delete({
            where: { id: params.id },
        });
        return NextResponse.json({ message: 'Wordbook deleted successfully' });
    } catch (error) {
        console.error('Failed to delete wordbook:', error);
        return NextResponse.json({ error: 'Failed to delete wordbook' }, { status: 500 });
    }
}