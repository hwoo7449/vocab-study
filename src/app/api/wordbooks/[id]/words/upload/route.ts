import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/middleware/authMiddleware';
import prisma from '@/lib/prisma';
import * as ExcelJS from 'exceljs';

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const authResult = await authMiddleware(req as any);
    if (authResult instanceof NextResponse) return authResult;

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = await file.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);

        const worksheet = workbook.getWorksheet(1);

        if (!worksheet) {
            return NextResponse.json({ error: 'No worksheet found in the uploaded file' }, { status: 400 });
        }

        const jsonData: any[] = [];

        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber !== 1) { // Assuming the first row is headers
                jsonData.push({
                    id: Number(row.getCell(1).value) || undefined,
                    day: Number(row.getCell(2).value) || 1,
                    english: row.getCell(3).value?.toString() || '',
                    korean: row.getCell(4).value?.toString() || '',
                });
            }
        });

        const words = await prisma.word.createMany({
            data: jsonData.map((row: any) => ({
                id: row.id, // Prisma will auto-generate if undefined
                day: row.day,
                english: row.english,
                korean: row.korean,
                wordbookId: params.id,
            })),
            skipDuplicates: true, // This will skip inserting duplicates based on unique constraints
        });

        return NextResponse.json({ message: 'Words uploaded successfully', count: words.count }, { status: 201 });
    } catch (error) {
        console.error('Failed to upload words:', error);
        return NextResponse.json({ error: 'Failed to upload words' }, { status: 500 });
    }
}