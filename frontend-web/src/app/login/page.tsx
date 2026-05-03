"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchApi } from "@/lib/api";
import Swal from "sweetalert2";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password })
      });
      
      login(res.data.accessToken, res.data.user);
      Swal.fire({
        title: 'Welcome back!',
        text: 'Successfully logged in.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
      Swal.fire({
        title: 'Error',
        text: err.message || 'Failed to login',
        icon: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md bg-surface border-x border-gray-100 p-8 md:p-12 space-y-8 min-h-screen md:min-h-0 md:rounded-3xl flex flex-col justify-center">
        
        <div className="text-center mb-8">
          <div className="text-4xl font-black text-brand-yellow tracking-tighter mb-8">NLA</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Welcome Back</h1>
          <p className="text-muted text-sm">Enter your credentials to access your NLA profile.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Email or Username</label>
            <input 
              type="text" 
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className="w-full px-4 py-3 bg-surface-hover border border-gray-100 rounded-xl text-gray-900 placeholder-muted focus:outline-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow transition-all"
              placeholder="athlete@nla.com or athlete_handle"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-surface-hover border border-gray-100 rounded-xl text-gray-900 placeholder-muted focus:outline-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow transition-all"
              placeholder="••••••••"
            />
          </div>
          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-brand-yellow text-sm font-bold hover:underline">
              Forgot Password?
            </Link>
          </div>
          
          <button 
            disabled={isLoading}
            className="w-full py-3.5 bg-brand-yellow text-black font-bold rounded-xl hover:bg-yellow-400 transition-colors mt-4 disabled:opacity-50"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Social Logins Hidden Temporarily */}
        {/* 
        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-xs font-bold tracking-wider">
            <span className="px-4 bg-surface text-muted uppercase">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-2 py-3 bg-surface-hover rounded-xl hover:bg-zinc-800 hover:text-white transition-colors font-bold text-gray-900">
            Google
          </button>
          <button className="flex items-center justify-center gap-2 py-3 bg-surface-hover rounded-xl hover:bg-zinc-800 hover:text-white transition-colors font-bold text-gray-900">
            Facebook
          </button>
        </div> 
        */}

        <p className="text-center text-sm text-muted mt-8">
          New to NLA Wrestling?{" "}
          <Link href="/register" className="font-bold text-brand-yellow hover:underline">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}
