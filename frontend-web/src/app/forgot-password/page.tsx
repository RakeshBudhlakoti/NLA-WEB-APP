"use client";

import { useState } from "react";
import { fetchApi } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, Mail, Lock, CheckCircle2, ShieldCheck } from "lucide-react";
import Swal from "sweetalert2";

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & Reset
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await fetchApi('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'OTP sent to your email', showConfirmButton: false, timer: 3000 });
      setStep(2);
    } catch (error: any) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await fetchApi('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, otp, newPassword })
      });
      await Swal.fire({ icon: 'success', title: 'Success', text: 'Password reset successfully! You can now login.' });
      window.location.href = '/login';
    } catch (error: any) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <Link href="/login" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-bold uppercase tracking-wider">Back to Login</span>
        </Link>

        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
          {step === 1 ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                <Mail className="w-8 h-8 text-brand-blue" />
              </div>
              <h1 className="text-3xl font-black tracking-tight mb-2 uppercase">Forgot Password?</h1>
              <p className="text-gray-500 mb-8 font-medium">Enter your email and we'll send you an OTP to reset your password.</p>

              <form onSubmit={handleSendOtp} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jordan@nlasports.com"
                      className="w-full bg-gray-50 border-0 rounded-2xl px-12 py-4 text-sm font-medium focus:ring-2 ring-brand-blue outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-brand-blue text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-200 hover:shadow-xl hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest"
                >
                  {isLoading ? "Sending..." : "Send Reset OTP"}
                </button>
              </form>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-16 h-16 bg-yellow-50 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8 text-brand-yellow" />
              </div>
              <h1 className="text-3xl font-black tracking-tight mb-2 uppercase">Reset Password</h1>
              <p className="text-gray-500 mb-8 font-medium">We've sent a 6-digit code to <span className="text-gray-900 font-bold">{email}</span></p>

              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">6-Digit OTP</label>
                  <div className="relative">
                    <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="000000"
                      className="w-full bg-gray-50 border-0 rounded-2xl px-12 py-4 text-sm font-black tracking-[0.5em] focus:ring-2 ring-brand-blue outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-gray-50 border-0 rounded-2xl px-12 py-4 text-sm font-medium focus:ring-2 ring-brand-blue outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-brand-yellow text-black font-black py-4 rounded-2xl shadow-lg shadow-yellow-100 hover:shadow-xl hover:bg-yellow-400 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest"
                >
                  {isLoading ? "Resetting..." : "Update Password"}
                </button>

                <p className="text-center text-xs text-gray-400">
                  Didn't receive the code?{" "}
                  <button type="button" onClick={handleSendOtp} className="text-brand-blue font-bold hover:underline">Resend OTP</button>
                </p>
              </form>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 font-medium italic">
            "Your comeback is always stronger than your setback."
          </p>
        </div>
      </div>
    </div>
  );
}
