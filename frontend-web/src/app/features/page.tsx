"use client";

import React from 'react';
import { 
  Users, Trophy, MessageSquare, Edit3, Image, 
  ShieldCheck, Layout, Activity, ArrowRight,
  Globe, Lock, Database, Zap
} from 'lucide-react';
import Link from 'next/link';

const FeaturesPage = () => {
  return (
    <div className="min-h-screen bg-[#05070a] text-white selection:bg-teal-500/30">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-teal-500/10 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        {/* Header Section */}
        <header className="text-center mb-32">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-teal-400">
            <Activity className="w-3 h-3 animate-pulse" /> Platform Specification v1.0
          </div>
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-8 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
            NLA SPORTS
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            A high-performance sports ecosystem engineered for athletes, fans, and administrators. 
            Discover, engage, and grow in the modern digital age.
          </p>

          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Link 
              href="/login" 
              className="px-10 py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-teal-500 text-white font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-xl shadow-blue-500/20 flex items-center gap-3"
            >
              Athlete Portal <ArrowRight className="w-4 h-4" />
            </Link>
            <a 
              href="https://nla-admin-portal.vercel.app" 
              target="_blank"
              rel="noopener noreferrer"
              className="px-10 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all flex items-center gap-3"
            >
              Admin Dashboard <Lock className="w-4 h-4" />
            </a>
          </div>
        </header>

        {/* Feature Grid */}
        <section className="mb-40">
          <div className="flex items-center gap-6 mb-16">
            <h2 className="text-3xl font-black tracking-tight whitespace-nowrap">PLATFORM ECOSYSTEM</h2>
            <div className="h-[1px] w-full bg-gradient-to-r from-white/20 to-transparent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Fan Experience */}
            <div className="group p-10 rounded-[40px] bg-white/2 border border-white/5 hover:bg-white/5 transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-colors" />
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-8">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-extrabold mb-4 group-hover:text-blue-400 transition-colors">Fan Experience</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-8">
                A rich content environment where supporters can follow athlete journeys and engage with high-quality media.
              </p>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-center gap-3 font-bold uppercase tracking-wider text-[10px]">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Story Ecosystem
                </li>
                <li className="flex items-center gap-3 font-bold uppercase tracking-wider text-[10px]">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Engagement Engine
                </li>
                <li className="flex items-center gap-3 font-bold uppercase tracking-wider text-[10px]">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Personal Bookmarks
                </li>
              </ul>
            </div>

            {/* Athlete Studio */}
            <div className="group p-10 rounded-[40px] bg-white/2 border border-white/5 hover:bg-white/5 transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-orange-500/20 transition-colors" />
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 mb-8">
                <Edit3 className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-extrabold mb-4 group-hover:text-orange-400 transition-colors">Athlete Studio</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-8">
                Powerful storytelling tools designed to help elite talent build their brand and reach a global audience.
              </p>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-center gap-3 font-bold uppercase tracking-wider text-[10px]">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500" /> S3 Media Uploads
                </li>
                <li className="flex items-center gap-3 font-bold uppercase tracking-wider text-[10px]">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Identity Branding
                </li>
                <li className="flex items-center gap-3 font-bold uppercase tracking-wider text-[10px]">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Growth Analytics
                </li>
              </ul>
            </div>

            {/* Admin Control */}
            <div className="group p-10 rounded-[40px] bg-white/2 border border-white/5 hover:bg-white/5 transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-teal-500/20 transition-colors" />
              <div className="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-500 mb-8">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-extrabold mb-4 group-hover:text-teal-400 transition-colors">Admin Control</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-8">
                Total oversight of platform governance, from user moderation to real-time infrastructure diagnostics.
              </p>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-center gap-3 font-bold uppercase tracking-wider text-[10px]">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500" /> User Governance
                </li>
                <li className="flex items-center gap-3 font-bold uppercase tracking-wider text-[10px]">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500" /> Health Monitoring
                </li>
                <li className="flex items-center gap-3 font-bold uppercase tracking-wider text-[10px]">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500" /> Content Moderation
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Technical Stack */}
        <section className="bg-white/2 rounded-[50px] border border-white/5 p-16 text-center overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-b from-teal-500/5 to-transparent pointer-events-none" />
          <h2 className="text-4xl font-black mb-12 relative z-10 uppercase tracking-tighter">TECHNICAL CORE</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex flex-col items-center gap-3">
              <Zap className="w-6 h-6 text-yellow-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Next.js 15</span>
            </div>
            <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex flex-col items-center gap-3">
              <Database className="w-6 h-6 text-blue-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">PostgreSQL 16</span>
            </div>
            <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex flex-col items-center gap-3">
              <Globe className="w-6 h-6 text-teal-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">AWS / Vercel</span>
            </div>
            <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex flex-col items-center gap-3">
              <Lock className="w-6 h-6 text-red-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">JWT Security</span>
            </div>
          </div>

          <p className="mt-16 text-[10px] text-gray-600 font-bold uppercase tracking-[0.5em] relative z-10">
            &copy; 2026 NLA SPORTS PLATFORM • BUILT FOR EXCELLENCE
          </p>
        </section>
      </div>
    </div>
  );
};

export default FeaturesPage;
