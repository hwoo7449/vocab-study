import { NextApiRequest } from 'next';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function authMiddleware(req: NextApiRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return token; // 인증 성공 시 토큰 반환
}