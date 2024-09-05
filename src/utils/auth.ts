import { jwtVerify, SignJWT } from 'jose';
import { GetServerSidePropsContext } from "next";
import { getToken } from "next-auth/jwt";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function createToken(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(secret);
}

export async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, secret);
        return payload;
    } catch (error) {
        return null;
    }
}

export async function requireAuth(context: GetServerSidePropsContext, requiredRole?: string) {
    const token = await getToken({ req: context.req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
        return {
            redirect: {
                destination: '/login',
                permanent: false,
            },
        };
    }

    if (requiredRole && token.role !== requiredRole) {
        return {
            redirect: {
                destination: '/unauthorized',
                permanent: false,
            },
        };
    }

    return {
        props: { session: token },
    };
}