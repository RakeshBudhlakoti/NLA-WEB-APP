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
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold uppercase tracking-widest">Back to Home</span>
          </Link>
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/10">
            System Monitoring
          </div>
        </div>

        <div className="bg-[#111] rounded-3xl border border-white/10 p-8 shadow-2xl overflow-hidden relative">
          {/* Background Glow */}
          <div className={`absolute top-0 right-0 w-64 h-64 blur-[120px] rounded-full opacity-20 -mr-32 -mt-32 transition-colors duration-1000 ${status?.ok ? 'bg-green-500' : 'bg-red-500'}`}></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h1 className="text-4xl font-black tracking-tighter mb-2">NLA Platform</h1>
                <p className="text-gray-400 text-sm flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Production API Status Check
                </p>
              </div>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${status?.ok ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                <Activity className={`w-8 h-8 ${status?.ok ? 'animate-pulse' : ''}`} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">
                  <ShieldCheck className="w-3 h-3" /> API Status
                </div>
                <div className={`text-xl font-black ${status?.ok ? 'text-green-500' : 'text-red-500'}`}>
                  {isLoading ? '...' : (status?.ok ? 'ONLINE' : 'OFFLINE')}
                </div>
              </div>
              <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">
                  <Database className="w-3 h-3" /> Database
                </div>
                <div className="text-xl font-black text-white">
                  {isLoading ? '...' : (status?.database || 'ERROR')}
                </div>
              </div>
              <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">
                  <RefreshCcw className="w-3 h-3" /> Latency
                </div>
                <div className="text-xl font-black text-white">
                  {isLoading ? '...' : (status?.latency || 'N/A')}
                </div>
              </div>
            </div>

            {status?.error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 text-xs font-medium mb-8">
                ⚠️ {status.error}
              </div>
            )}

            <div className="flex items-center justify-between">
              <button 
                onClick={checkHealth}
                disabled={isLoading}
                className="bg-white text-black px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Refreshing...' : 'Refresh Status'}
              </button>
              <div className="text-[10px] text-gray-500 font-medium">
                Last updated: {lastChecked}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-8 text-[10px] text-gray-600 font-bold uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> System Normal
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div> Maintenance
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Critical
          </div>
        </div>
      </div>
    </div>
  );
}
