import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/middleware/authMiddleware';
import prisma from '@/lib/prisma';
import * as ExcelJS from 'exceljs';

export async function POST(req: NextRequest) {
    const authResult = await authMiddleware(req as any);
    if (authResult instanceof NextResponse) return authResult;

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const wordbookName = formData.get('name') as string;

        if (!file || !wordbookName) {
            return NextResponse.json({ error: 'Missing file or wordbook name' }, { status: 400 });
        }

        const buffer = await file.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);

        const worksheet = workbook.getWorksheet(1);

        if (!worksheet) {
            return NextResponse.json({ error: 'No worksheet found in the uploaded file' }, { status: 400 });
        }

        const words: any[] = [];
        let maxDay = 0;

        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber !== 1) { // Assuming the first row is headers
                const day = Number(row.getCell(2).value) || 1;
                words.push({
                    day,
                    english: row.getCell(3).value?.toString() || '',
                    korean: row.getCell(4).value?.toString() || '',
                });
                maxDay = Math.max(maxDay, day);
            }
        });

        const newWordbook = await prisma.wordbook.create({
            data: {
                name: wordbookName,
                totalDays: maxDay,
                words: {
                    create: words
                }
            },
            include: {
                words: true
            }
        });

        return NextResponse.json({
            message: 'Wordbook created successfully',
            wordbook: newWordbook
        }, { status: 201 });
    } catch (error) {
        console.error('Failed to create wordbook:', error);
        return NextResponse.json({ error: 'Failed to create wordbook' }, { status: 500 });
    }
}