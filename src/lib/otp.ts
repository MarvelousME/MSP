import { prisma } from './prisma';
import { getResendClient } from './email';
import { getDatabaseUnavailableMessage } from './prisma-errors';
import crypto from 'crypto';

export class OTPService {
  private generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  private normalizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  private isDevDeliveryMode(): boolean {
    return (
      process.env.NODE_ENV === 'development' ||
      process.env.OTP_DEV_FALLBACK === 'true' ||
      (process.env.NEXT_PUBLIC_APP_URL?.includes('localhost') ?? false)
    );
  }

  private logDevCode(email: string, code: string): void {
    console.log(`\n🔑 [DEV] Verification code for ${email}: ${code}\n`);
  }

  private async deliverOtpEmail(
    email: string,
    code: string,
    userName: string
  ): Promise<{ delivered: boolean; devFallback: boolean }> {
    const from = process.env.RESEND_FROM_EMAIL;
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey || !from) {
      if (this.isDevDeliveryMode()) {
        this.logDevCode(email, code);
        return { delivered: false, devFallback: true };
      }
      console.error('OTP email skipped: RESEND_API_KEY or RESEND_FROM_EMAIL is not configured');
      return { delivered: false, devFallback: false };
    }

    try {
      const emailResult = await getResendClient().emails.send({
        from,
        to: email,
        subject: 'Your Login Code',
        html: this.generateOTPEmailTemplate(code, userName),
      });

      if (emailResult.error) {
        console.error('Failed to send OTP email:', emailResult.error);

        if (this.isDevDeliveryMode()) {
          this.logDevCode(email, code);
          return { delivered: false, devFallback: true };
        }

        return { delivered: false, devFallback: false };
      }

      return { delivered: true, devFallback: false };
    } catch (error) {
      console.error('OTP email transport error:', error);

      if (this.isDevDeliveryMode()) {
        this.logDevCode(email, code);
        return { delivered: false, devFallback: true };
      }

      return { delivered: false, devFallback: false };
    }
  }

  async sendOTP(email: string): Promise<{ success: boolean; message: string }> {
    const normalizedEmail = this.normalizeEmail(email);

    try {
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (!user) {
        return {
          success: false,
          message: 'No account found with this email address',
        };
      }

      // Only suspended accounts cannot receive login codes.
      if (user.status === 'SUSPENDED') {
        return {
          success: false,
          message: 'Your account is suspended. Please contact support.',
        };
      }

      const recentOTP = await prisma.oTP.findFirst({
        where: {
          email: normalizedEmail,
          createdAt: {
            gte: new Date(Date.now() - 30_000),
          },
        },
      });

      if (recentOTP) {
        return {
          success: false,
          message: 'Please wait 30 seconds before requesting another code',
        };
      }

      await prisma.oTP.updateMany({
        where: {
          email: normalizedEmail,
          isUsed: false,
        },
        data: {
          isUsed: true,
        },
      });

      const code = this.generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await prisma.oTP.create({
        data: {
          email: normalizedEmail,
          code,
          expiresAt,
        },
      });

      const delivery = await this.deliverOtpEmail(normalizedEmail, code, user.name || 'User');

      if (delivery.delivered) {
        return {
          success: true,
          message: 'Verification code sent to your email',
        };
      }

      if (delivery.devFallback) {
        return {
          success: true,
          message:
            'Verification code generated. In development, check the server console for your code.',
        };
      }

      return {
        success: false,
        message: 'Could not send verification email. Check email configuration or try again shortly.',
      };
    } catch (error) {
      const dbMessage = getDatabaseUnavailableMessage(error);
      if (dbMessage) {
        console.error('OTP send failed — database unavailable:', error);
        return { success: false, message: dbMessage };
      }

      console.error('Error sending OTP:', error);
      return {
        success: false,
        message: 'An error occurred while sending the verification code',
      };
    }
  }

  async verifyOTP(
    email: string,
    code: string
  ): Promise<{
    success: boolean;
    user?: Awaited<ReturnType<typeof prisma.user.findUnique>>;
    message: string;
  }> {
    const normalizedEmail = this.normalizeEmail(email);
    const normalizedCode = code.trim();

    try {
      const otp = await prisma.oTP.findFirst({
        where: {
          email: normalizedEmail,
          code: normalizedCode,
          isUsed: false,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      if (!otp) {
        await prisma.oTP.updateMany({
          where: {
            email: normalizedEmail,
            code: normalizedCode,
            isUsed: false,
          },
          data: {
            attempts: {
              increment: 1,
            },
          },
        });

        return {
          success: false,
          message: 'Invalid or expired verification code',
        };
      }

      if (otp.attempts >= 3) {
        await prisma.oTP.update({
          where: { id: otp.id },
          data: { isUsed: true },
        });

        return {
          success: false,
          message: 'Too many invalid attempts. Please request a new code.',
        };
      }

      await prisma.oTP.update({
        where: { id: otp.id },
        data: { isUsed: true },
      });

      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        include: {
          affiliate: true,
        },
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      if (user.status === 'SUSPENDED') {
        return {
          success: false,
          message: 'Your account is suspended. Please contact support.',
        };
      }

      return {
        success: true,
        user,
        message: 'Verification code accepted',
      };
    } catch (error) {
      const dbMessage = getDatabaseUnavailableMessage(error);
      if (dbMessage) {
        console.error('OTP verify failed — database unavailable:', error);
        return { success: false, message: dbMessage };
      }

      console.error('Error verifying OTP:', error);
      return {
        success: false,
        message: 'An error occurred while verifying the code',
      };
    }
  }

  async cleanupExpiredOTPs(): Promise<void> {
    try {
      await prisma.oTP.deleteMany({
        where: {
          OR: [
            {
              expiresAt: {
                lt: new Date(),
              },
            },
            {
              isUsed: true,
              createdAt: {
                lt: new Date(Date.now() - 24 * 60 * 60 * 1000),
              },
            },
          ],
        },
      });
    } catch (error) {
      console.error('Error cleaning up expired OTPs:', error);
    }
  }

  private generateOTPEmailTemplate(code: string, userName: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Login Code</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f8f9fa;
            }
            .container {
              background-color: white;
              padding: 40px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 10px;
            }
            .otp-code {
              background-color: #f3f4f6;
              border: 2px dashed #d1d5db;
              padding: 20px;
              text-align: center;
              margin: 30px 0;
              border-radius: 8px;
            }
            .code {
              font-size: 36px;
              font-weight: bold;
              letter-spacing: 8px;
              color: #1f2937;
              font-family: 'Courier New', monospace;
            }
            .warning {
              background-color: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              font-size: 14px;
              color: #6b7280;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">${process.env.PLATFORM_NAME || 'Affiliate Platform'}</div>
              <h1>Your Login Code</h1>
            </div>
            
            <p>Hello ${userName},</p>
            <p>You requested to sign in to your account. Please use the verification code below:</p>
            
            <div class="otp-code">
              <div class="code">${code}</div>
              <p style="margin: 10px 0 0 0; color: #6b7280;">This code expires in 10 minutes</p>
            </div>
            
            <div class="warning">
              <strong>Security Notice:</strong> Never share this code with anyone. Our team will never ask for your verification code.
            </div>
            
            <p>If you didn't request this code, please ignore this email or contact our support team if you have concerns.</p>
            
            <div class="footer">
              <p>Best regards,<br>
              ${process.env.PLATFORM_NAME || 'Affiliate Platform'} Team</p>
              <p>
                Need help? Contact us at 
                <a href="mailto:${process.env.PLATFORM_SUPPORT_EMAIL}" style="color: #2563eb;">
                  ${process.env.PLATFORM_SUPPORT_EMAIL}
                </a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

export const otpService = new OTPService();
