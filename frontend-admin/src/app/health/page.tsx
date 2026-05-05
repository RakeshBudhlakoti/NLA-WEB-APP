"use client";

import { useEffect, useState } from "react";
import { Activity, ShieldCheck, Database, Globe, RefreshCcw, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function HealthPage() {
  const [status, setStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<string>("");

  const checkHealth = async () => {
    setIsLoading(true);
    try {
      const start = Date.now();
      const res = await fetch('/api/v1/health');
      const data = await res.json();
      const latency = Date.now() - start;
      
      setStatus({ ...data, latency: latency + 'ms', ok: res.ok });
    } catch (err) {
      setStatus({ ok: false, error: "Cannot reach API. Check AWS Security Groups and PM2 status." });
    } finally {
      setIsLoading(false);
      setLastChecked(new Date().toLocaleTimeString());
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-admin-teal transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Admin Dashboard</span>
          </Link>
          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
            Infrastructure Health
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-xl relative overflow-hidden">
          {/* Subtle decoration */}
          <div className={`absolute top-0 right-0 w-32 h-32 rounded-full opacity-5 -mr-16 -mt-16 ${status?.ok ? 'bg-admin-teal' : 'bg-red-500'}`}></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-1">NLA Admin</h1>
                <p className="text-gray-500 text-sm flex items-center gap-2 font-medium">
                  <Globe className="w-4 h-4" /> Production API Monitoring
                </p>
              </div>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${status?.ok ? 'bg-teal-50 text-admin-teal' : 'bg-red-50 text-red-500'}`}>
                <Activity className={`w-7 h-7 ${status?.ok ? 'animate-pulse' : ''}`} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-50 border border-gray-100 p-5 rounded-2xl">
                <div className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> API
                </div>
                <div className={`text-xl font-black ${status?.ok ? 'text-admin-teal' : 'text-red-500'}`}>
                  {isLoading ? '...' : (status?.ok ? 'ONLINE' : 'OFFLINE')}
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-100 p-5 rounded-2xl">
                <div className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" /> DATABASE
                </div>
                <div className="text-xl font-black text-gray-900">
                  {isLoading ? '...' : (status?.database || 'ERROR')}
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-100 p-5 rounded-2xl">
                <div className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <RefreshCcw className="w-3.5 h-3.5" /> SPEED
                </div>
                <div className="text-xl font-black text-gray-900">
                  {isLoading ? '...' : (status?.latency || 'N/A')}
                </div>
              </div>
            </div>

            {status?.error && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-red-600 text-[13px] font-medium mb-8 leading-relaxed">
                <span className="font-bold">Error:</span> {status.error}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button 
                onClick={checkHealth}
                disabled={isLoading}
                className="bg-gray-900 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-black/10 disabled:opacity-50 active:scale-95"
              >
                {isLoading ? 'Rechecking...' : 'Run Diagnostics'}
              </button>
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                Last Ping: {lastChecked}
              </div>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
          Automated Infrastructure Verification System
        </p>
      </div>
    </div>
  );
}
