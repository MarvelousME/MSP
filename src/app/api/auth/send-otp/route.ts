import { NextRequest, NextResponse } from 'next/server';
import { otpService } from '@/lib/otp';
import { checkAuthRateLimit, getClientIp } from '@/lib/auth-rate-limit';
import { getDatabaseUnavailableMessage } from '@/lib/prisma-errors';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkAuthRateLimit(ip, 'auth/send-otp', 10, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many code requests. Please try again later.',
          message: 'Too many code requests. Please try again later.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim() : '';

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required', message: 'Email is required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format', message: 'Invalid email format' },
        { status: 400 }
      );
    }

    const result = await otpService.sendOTP(email);

    if (!result.success) {
      const status = result.message.includes('Database is unavailable') ? 503 : 400;

      return NextResponse.json(
        { success: false, error: result.message, message: result.message },
        { status }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('OTP send error:', error);
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
