import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();

        // 이메일 중복 체크
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ message: 'Email already exists' }, { status: 400 });
        }

        // 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(password, 10);

        // 새 사용자 생성
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        return NextResponse.json({ message: 'User created successfully', user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json({ message: 'An error occurred during sign up' }, { status: 500 });
    }
}