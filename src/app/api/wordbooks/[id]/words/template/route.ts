// src/app/api/wordbooks/[id]/words/template/route.ts

import { NextRequest, NextResponse } from 'next/server';
import * as ExcelJS from 'exceljs';

export async function GET(req: NextRequest) {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Words Template');

        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Day', key: 'day', width: 10 },
            { header: 'English', key: 'english', width: 30 },
            { header: 'Korean', key: 'korean', width: 30 }
        ];

        // Add sample data
        worksheet.addRow({ id: 1, day: 1, english: 'example', korean: '예시' });

        // Style the header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD3D3D3' }
        };

        const buffer = await workbook.xlsx.writeBuffer();

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename=word_template.xlsx'
            }
        });
    } catch (error) {
        console.error('Failed to generate template:', error);
        return NextResponse.json({ error: 'Failed to generate template' }, { status: 500 });
    }
}