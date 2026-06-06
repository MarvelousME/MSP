'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { toast } from 'sonner';
import { FlameBackground } from '@/components/animations/FlameBackground';
import { AuthLogo } from '@/components/brand/AuthLogo';
import { markEntryAnimationPending } from '@/lib/entry-animation';
import { AnimatedIcon } from '@/components/ui/AnimatedIcon';

type Step = 'email' | 'otp';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [logoPulseKey, setLogoPulseKey] = useState(0);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['10deg', '-10deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-10deg', '10deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / rect.width - 0.5);
    y.set(mouseY / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleFormMouseEnter = () => {
    setLogoPulseKey((k) => k + 1);
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const otpRes = await apiClient.post('/api/auth/send-otp', { email });
      const otpData = await otpRes.json();

      if (otpRes.ok && otpData.success) {
        setStep('otp');
        toast.success(otpData.message || 'Verification code sent');
      } else {
        toast.error(otpData.message || 'Email not recognized');
      }
    } catch (_e) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email || loading) return;
    setLoading(true);

    try {
      const otpRes = await apiClient.post('/api/auth/send-otp', { email });
      const otpData = await otpRes.json();

      if (otpRes.ok && otpData.success) {
        setOtp('');
        toast.success(otpData.message || 'A new access code has been sent');
      } else {
        toast.error(otpData.message || otpData.error || 'Failed to resend access code');
      }
    } catch (_e) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      toast.error('Enter the full 6-digit access code');
      return;
    }
    setLoading(true);

    try {
      const res = await apiClient.post('/api/auth/verify-otp', { email, code: otp }, { credentials: 'include' });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Welcome back');
        markEntryAnimationPending();
        router.push(data.user.role === 'ADMIN' ? '/admin' : '/affiliate');
      } else {
        toast.error(data.error || 'Invalid access code');
      }
    } catch (_e) {
      toast.error('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const linkClass = 'font-bold text-orange-500 hover:text-orange-400 underline underline-offset-4';

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 sm:p-6 font-sans">
      <FlameBackground />

      <div className="w-full max-w-md relative z-10">
        <motion.div
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onMouseEnter={handleFormMouseEnter}
          className="relative"
        >
          <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-teal-500/40 z-20" />
          <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-orange-500/40 z-20" />

          <Card className="bg-white/95 border border-teal-500/20 shadow-[0_0_50px_-12px_rgba(20,184,166,0.2)] overflow-hidden rounded-sm relative">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-teal-500 via-orange-500 to-teal-500 opacity-60" />

            <AnimatePresence mode="wait">
              {step === 'email' ? (
                <motion.div
                  key="email-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  style={{ transform: 'translateZ(60px)' }}
                >
                  <CardHeader className="text-center pt-8 sm:pt-10 pb-6 px-6 sm:px-10">
                    <div className="mb-4">
                      <AuthLogo pulseKey={logoPulseKey} />
                    </div>
                    <CardDescription className="text-slate-500 font-medium text-[15px] sm:text-[16px]">
                      Sign in to access your dashboard
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleSendOTP}>
                    <CardContent className="space-y-5 px-6 sm:px-10">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-500 font-medium text-[14px] ml-1">
                          Email address
                        </Label>
                        <div className="relative group">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors">
                            <AnimatedIcon icon={Mail} className="text-current" size={19} />
                          </span>
                          <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-12 bg-slate-50/50 border-slate-200 text-slate-900 focus:bg-white focus:border-teal-500/50 focus:ring-teal-500/10 transition-all h-14 rounded-none border-l-4 border-l-teal-500"
                            required
                            autoFocus
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-6 sm:p-10 pt-6">
                      <Button
                        type="submit"
                        className="w-full bg-slate-900 hover:bg-teal-600 transition-all duration-500 font-black uppercase tracking-[0.2em] h-14 text-white rounded-none shadow-xl shadow-teal-500/10"
                        size="lg"
                        disabled={loading || !email}
                      >
                        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Login'}
                      </Button>
                    </CardFooter>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="otp-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  style={{ transform: 'translateZ(60px)' }}
                >
                  <CardHeader className="text-center pt-8 sm:pt-10 pb-6 px-6 sm:px-10">
                    <div className="mb-4">
                      <AuthLogo pulseKey={logoPulseKey} width={200} height={52} />
                    </div>
                    <CardDescription className="text-slate-500 mt-2 text-[15px] sm:text-[16px]">
                      Enter the access code sent to <br />
                      <span className="font-mono text-teal-600 font-bold break-all">{email}</span>
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleVerifyOTP}>
                    <CardContent className="space-y-6 px-6 sm:px-10">
                      <div className="flex justify-center py-2">
                        <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
                          <InputOTPGroup className="gap-2">
                            {[0, 1, 2, 3, 4, 5].map((i) => (
                              <React.Fragment key={i}>
                                <InputOTPSlot
                                  index={i}
                                  className="w-12 h-14 text-xl border-slate-200 bg-slate-50 text-slate-900 rounded-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                                />
                                {i === 2 && <div className="w-2" />}
                              </React.Fragment>
                            ))}
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                    </CardContent>
                    <CardFooter className="flex-col gap-6 p-6 sm:p-10 pt-4">
                      <Button
                        type="submit"
                        className="w-full bg-teal-600 hover:bg-teal-500 transition-all font-black uppercase tracking-[0.2em] h-14 text-white rounded-none shadow-lg shadow-teal-500/20"
                        size="lg"
                        disabled={loading || otp.length < 6}
                      >
                        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Authorize Entry'}
                      </Button>
                      <div className="flex items-center justify-between w-full">
                        <Button
                          type="button"
                          variant="link"
                          className={`${linkClass} font-mono text-[13px] uppercase p-0 h-auto`}
                          onClick={() => setStep('email')}
                        >
                          <span className="mr-1 inline-flex"><AnimatedIcon icon={ArrowLeft} className="text-orange-500" size={16} /></span>
                          Back
                        </Button>
                        <Button
                          type="button"
                          variant="link"
                          className={`${linkClass} font-mono text-[13px] uppercase p-0 h-auto`}
                          onClick={handleResendOTP}
                          disabled={loading}
                        >
                          Resend code
                        </Button>
                      </div>
                    </CardFooter>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          <div className="absolute inset-0 pointer-events-none rounded-sm bg-cyber-grid-dots opacity-[0.03]" />

          <p className="text-center text-[17px] text-slate-500 font-medium mt-4">
            Need an account?{' '}
            <Link href="/register" className={linkClass}>
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
