import { NextRequest, NextResponse } from 'next/server';
import { otpService } from '@/lib/otp';
import { SignJWT } from 'jose';
import { checkAuthRateLimit, getClientIp } from '@/lib/auth-rate-limit';
import { getDatabaseUnavailableMessage } from '@/lib/prisma-errors';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkAuthRateLimit(ip, 'auth/verify-otp', 10, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many verification attempts. Please try again later.',
          message: 'Too many verification attempts. Please try again later.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: 'Email and code are required', message: 'Email and code are required' },
        { status: 400 }
      );
    }

    const result = await otpService.verifyOTP(email, code);

    if (!result.success) {
      const status =
        result.message.includes('Database is unavailable') ? 503 : 400;

      return NextResponse.json(
        { success: false, error: result.message, message: result.message },
        { status }
      );
    }

    const user = result.user!;

    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    const response = NextResponse.json({
      success: true,
      message: result.message,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        hasAffiliate: !!user.affiliate,
      },
    });

    const proto =
      request.headers.get('x-forwarded-proto') || request.nextUrl.protocol.replace(':', '');
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: proto === 'https',
      sameSite: 'lax',
      maxAge: 86400,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('OTP verify error:', error);
    const dbMessage = getDatabaseUnavailableMessage(error);

    return NextResponse.json(
      {
        success: false,
        error: dbMessage || 'Internal server error',
        message: dbMessage || 'Internal server error',
      },
      { status: dbMessage ? 503 : 500 }
    );
  }
}
