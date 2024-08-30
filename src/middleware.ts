import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { safeLog } from '@/utils/safeLog';

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

    safeLog("Token:", token); // 디버깅용

    // 관리자 페이지 보호
    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (!token || token.role !== 'admin') {
            safeLog("Access denied to admin page"); // 디버깅용
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    // 대시보드 및 학습 및 복습 페이지 보호
    if (request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/study') || request.nextUrl.pathname.startsWith('/review')) {
        if (!token) {
            safeLog("Access denied to protected page"); // 디버깅용
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    // 이미 로그인한 사용자를 로그인 페이지에서 리다이렉트
    if (request.nextUrl.pathname === '/login' && token) {
        safeLog("Redirecting logged-in user from login page"); // 디버깅용
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/dashboard/:path*', '/admin/:path*', '/login', '/study/:path*', '/review/:path*']
}