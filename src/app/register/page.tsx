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
  InputOTPSeparator,
} from '@/components/ui/input-otp';
import { User, Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { toast } from 'sonner';
import { FlameBackground } from '@/components/animations/FlameBackground';
import { AuthLogo } from '@/components/brand/AuthLogo';
import { markEntryAnimationPending } from '@/lib/entry-animation';
import { AnimatedIcon } from '@/components/ui/AnimatedIcon';

type Step = 'details' | 'otp' | 'success';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('details');
  const [name, setName] = useState('');
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
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleFormMouseEnter = () => {
    setLogoPulseKey((k) => k + 1);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const registerRes = await apiClient.post('/api/auth/register', { email, name, role: 'AFFILIATE' });
      const registerData = await registerRes.json();

      if (!registerRes.ok) {
        toast.error(registerData.message || 'Registration failed');
        setLoading(false);
        return;
      }

      const otpRes = await apiClient.post('/api/auth/send-otp', { email });
      const otpData = await otpRes.json();

      if (otpRes.ok && otpData.success) {
        setStep('otp');
        toast.success(otpData.message || 'Account created! A verification code has been sent.');
      } else {
        setStep('otp');
        toast.error(otpData.message || otpData.error || 'Failed to send code. Try resending.');
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
      toast.error('Please enter the full 6-digit code');
      return;
    }
    setLoading(true);

    try {
      const res = await apiClient.post('/api/auth/verify-otp', { email, code: otp }, { credentials: 'include' });
      const data = await res.json();

      if (res.ok && data.success) {
        setStep('success');
        toast.success('Account verified successfully');
        setTimeout(() => {
          markEntryAnimationPending();
          router.push(data.user.role === 'ADMIN' ? '/admin' : '/affiliate');
        }, 2000);
      } else {
        toast.error(data.error || 'Invalid verification code');
      }
    } catch (_e) {
      toast.error('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);

    try {
      const res = await apiClient.post('/api/auth/send-otp', { email });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || 'A new verification code has been sent');
      } else {
        toast.error(data.message || data.error || 'Failed to resend code. Please try again.');
      }
    } catch (_e) {
      toast.error('Failed to resend code.');
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
              {step === 'details' && (
                <motion.div
                  key="details-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  style={{ transform: 'translateZ(60px)' }}
                >
                  <CardHeader className="text-center pt-10 pb-6">
                    <div className="mb-4">
                      <AuthLogo pulseKey={logoPulseKey} />
                    </div>
                    <CardDescription className="text-slate-500 font-medium text-[16px]">
                      Join as an affiliate partner and start earning
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleRegister}>
                    <CardContent className="space-y-5 px-6 sm:px-10">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-slate-500 font-medium text-[14px] ml-1">
                          Full Name
                        </Label>
                        <div className="relative group">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors">
                            <AnimatedIcon icon={User} className="text-current" size={19} />
                          </span>
                          <Input
                            id="name"
                            type="text"
                            placeholder="Your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="pl-12 bg-slate-50/50 border-slate-200 text-slate-900 focus:bg-white focus:border-teal-500/50 focus:ring-teal-500/10 transition-all h-14 rounded-none border-l-4 border-l-teal-500"
                            required
                            autoFocus
                            autoComplete="name"
                          />
                        </div>
                      </div>
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
                            autoComplete="email"
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-6 sm:p-10 pt-6">
                      <Button
                        type="submit"
                        className="w-full bg-slate-900 hover:bg-teal-600 transition-all duration-500 font-black uppercase tracking-[0.2em] h-14 text-white rounded-none shadow-xl shadow-teal-500/10"
                        size="lg"
                        disabled={loading || !name || !email}
                      >
                        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Create Account'}
                      </Button>
                    </CardFooter>
                  </form>
                </motion.div>
              )}

              {step === 'otp' && (
                <motion.div
                  key="otp-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  style={{ transform: 'translateZ(60px)' }}
                >
                  <CardHeader className="text-center pt-10 pb-6">
                    <div className="mb-4">
                      <AuthLogo pulseKey={logoPulseKey} width={200} height={52} />
                    </div>
                    <CardDescription className="text-slate-500 text-[16px]">
                      Enter the 6-digit code sent to <span className="font-mono text-teal-600 font-bold">{email}</span>
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleVerifyOTP}>
                    <CardContent className="space-y-6 px-6 sm:px-10">
                      <div className="flex justify-center py-2">
                        <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
                          <InputOTPGroup className="gap-2">
                            <InputOTPSlot index={0} className="w-12 h-14 text-xl border-slate-200 bg-slate-50 text-slate-900 rounded-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
                            <InputOTPSlot index={1} className="w-12 h-14 text-xl border-slate-200 bg-slate-50 text-slate-900 rounded-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
                            <InputOTPSlot index={2} className="w-12 h-14 text-xl border-slate-200 bg-slate-50 text-slate-900 rounded-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
                          </InputOTPGroup>
                          <InputOTPSeparator />
                          <InputOTPGroup className="gap-2">
                            <InputOTPSlot index={3} className="w-12 h-14 text-xl border-slate-200 bg-slate-50 text-slate-900 rounded-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
                            <InputOTPSlot index={4} className="w-12 h-14 text-xl border-slate-200 bg-slate-50 text-slate-900 rounded-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
                            <InputOTPSlot index={5} className="w-12 h-14 text-xl border-slate-200 bg-slate-50 text-slate-900 rounded-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
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
                        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Verify & Continue'}
                      </Button>
                      <div className="flex items-center justify-between w-full">
                        <Button
                          type="button"
                          variant="link"
                          className={`${linkClass} font-mono text-[13px] uppercase p-0 h-auto`}
                          onClick={() => {
                            setStep('details');
                            setOtp('');
                          }}
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

              {step === 'success' && (
                <motion.div
                  key="success-step"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardContent className="py-12 px-10">
                    <div className="text-center space-y-4">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200">
                        <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="text-[20px] font-black text-slate-900">Welcome aboard, {name}!</h3>
                        <p className="text-[16px] text-slate-500 mt-2">
                          Your account has been created. Redirecting to your dashboard...
                        </p>
                      </div>
                      <Loader2 className="h-5 w-5 animate-spin text-teal-600 mx-auto" />
                    </div>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          <div className="absolute inset-0 pointer-events-none rounded-sm bg-cyber-grid-dots opacity-[0.03]" />

          {step !== 'success' && (
            <p className="text-center text-[16px] text-slate-500 font-medium mt-4">
              Already have an account?{' '}
              <Link href="/login" className={linkClass}>
                Sign in
              </Link>
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
