"use client";

import React from 'react';
import { 
  Users, Trophy, MessageSquare, Edit3, Image, 
  ShieldCheck, Layout, Activity, ArrowRight,
  Globe, Lock, Database, Zap, CheckCircle2,
  Share2, ShieldAlert, BarChart3, Mail, Key, 
  Settings2, Heart, MessageCircle, Bookmark
} from 'lucide-react';
import Link from 'next/link';

const FeaturesPage = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-teal-500/30 font-sans">
      {/* Background Subtle Gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-blue-100/50 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-teal-100/50 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        {/* Header Section */}
        <header className="text-center mb-40">
          <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white border border-slate-200 text-[11px] font-black uppercase tracking-[0.3em] mb-10 text-teal-600 shadow-sm">
            <Activity className="w-3.5 h-3.5 animate-pulse" /> Production Ready Master Specification
          </div>
          <h1 className="text-7xl md:text-[10rem] font-black tracking-tighter mb-10 bg-gradient-to-b from-slate-900 to-slate-500 bg-clip-text text-transparent leading-none">
            NLA SPORTS
          </h1>
          <p className="text-2xl text-slate-500 max-w-3xl mx-auto leading-relaxed font-medium">
            The ultimate sports narrative platform. A high-performance ecosystem designed for excellence.
          </p>

          <div className="mt-16 flex flex-wrap justify-center gap-6">
            <Link 
              href="/login" 
              className="group px-12 py-6 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-[0.2em] text-xs hover:scale-105 transition-all shadow-2xl shadow-slate-900/20 flex items-center gap-4"
            >
              Launch Athlete Portal <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a 
              href="https://nla-admin-portal.vercel.app" 
              target="_blank"
              rel="noopener noreferrer"
              className="px-12 py-6 rounded-2xl bg-white border border-slate-200 text-slate-900 font-black uppercase tracking-[0.2em] text-xs hover:bg-slate-50 transition-all flex items-center gap-4 shadow-sm"
            >
              Access Admin Dashboard <Lock className="w-5 h-5" />
            </a>
          </div>
        </header>

        {/* --- SECTION 1: FAN EXPERIENCE --- */}
        <section className="mb-40">
          <div className="flex items-center gap-8 mb-20">
            <h2 className="text-5xl font-black tracking-tight text-blue-600">FAN EXPERIENCE</h2>
            <div className="h-[2px] flex-grow bg-gradient-to-r from-blue-200 to-transparent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-10 rounded-[48px] bg-white border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -mr-16 -mt-16" />
              <div className="w-16 h-16 rounded-3xl bg-blue-50 flex items-center justify-center text-blue-600 mb-10 shadow-lg shadow-blue-500/10">
                <Layout className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black mb-6">Content Ecosystem</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">Professional discovery hub for athlete stories with advanced category filtering.</p>
              <ul className="space-y-4">
                {['Infinite-scroll content feed', 'Category narratives (Wrestling, Training)', 'Exclusive vs Public content toggles'].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" /> {f}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-10 rounded-[48px] bg-white border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -mr-16 -mt-16" />
              <div className="w-16 h-16 rounded-3xl bg-blue-50 flex items-center justify-center text-blue-600 mb-10 shadow-lg shadow-blue-500/10">
                <Trophy className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black mb-6">Social Rankings</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">Data-driven systems to highlight top athletes and search for trending content.</p>
              <ul className="space-y-4">
                {['Engagement-based Leaderboard', 'Fast Keyword Search Engine', 'Rich Media Athlete Profiles'].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" /> {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-10 rounded-[48px] bg-white border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -mr-16 -mt-16" />
              <div className="w-16 h-16 rounded-3xl bg-blue-50 flex items-center justify-center text-blue-600 mb-10 shadow-lg shadow-blue-500/10">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black mb-6">Interaction Tools</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">Full engagement suite to support favorite athletes and save content.</p>
              <ul className="space-y-4">
                {['Support via Story Likes', 'Personalized Comment Threads', 'Private Bookmark Collections'].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* --- SECTION 2: ATHLETE STUDIO --- */}
        <section className="mb-40">
          <div className="flex items-center gap-8 mb-20">
            <h2 className="text-5xl font-black tracking-tight text-orange-600">ATHLETE STUDIO</h2>
            <div className="h-[2px] flex-grow bg-gradient-to-r from-orange-200 to-transparent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-10 rounded-[48px] bg-white border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl -mr-16 -mt-16" />
              <div className="w-16 h-16 rounded-3xl bg-orange-50 flex items-center justify-center text-orange-600 mb-10 shadow-lg shadow-orange-500/10">
                <Edit3 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black mb-6">Publishing Center</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">Manage and publish narratives with professional media assets.</p>
              <ul className="space-y-4">
                {['High-Speed Media Uploads', 'Manage Own Stories (Edit/Delete)', 'Automatic SEO Meta Generation'].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-orange-500" /> {f}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-10 rounded-[48px] bg-white border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl -mr-16 -mt-16" />
              <div className="w-16 h-16 rounded-3xl bg-orange-50 flex items-center justify-center text-orange-600 mb-10 shadow-lg shadow-orange-500/10">
                <Key className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black mb-6">Identity & Security</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">Complete control over your security and personal brand identity.</p>
              <ul className="space-y-4">
                {['Change & Forgot Password', 'Custom Avatars & Banners', 'Social Link Tree Integration'].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-orange-500" /> {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-10 rounded-[48px] bg-white border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl -mr-16 -mt-16" />
              <div className="w-16 h-16 rounded-3xl bg-orange-50 flex items-center justify-center text-orange-600 mb-10 shadow-lg shadow-orange-500/10">
                <Mail className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black mb-6">Email Ecosystem</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">Automated notifications for every stage of the user journey.</p>
              <ul className="space-y-4">
                {['Account Signup Confirmation', 'Identity Verification Emails', 'Password Reset Assistance'].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-orange-500" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* --- SECTION 3: PLATFORM JOURNEYS --- */}
        <section className="mb-40">
          <div className="flex items-center gap-8 mb-20">
            <h2 className="text-5xl font-black tracking-tight text-slate-900">PLATFORM JOURNEYS</h2>
            <div className="h-[2px] flex-grow bg-gradient-to-r from-slate-200 to-transparent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="p-10 rounded-[40px] bg-blue-50/30 border border-blue-100">
                <h4 className="text-xs font-black uppercase tracking-[0.4em] text-blue-600 mb-12">The Fan Path</h4>
                <div className="relative pl-8 space-y-12 border-l-2 border-blue-200">
                    {[
                        { title: 'DISCOVER', desc: 'Browse narratives and explore the Athlete Leaderboard.' },
                        { title: 'JOIN', desc: 'Securely Sign Up and receive Welcome Verification Email.' },
                        { title: 'ENGAGE', desc: 'Support talent via Likes, Comments, and Bookmarks.' }
                    ].map((step, idx) => (
                        <div key={idx} className="relative">
                            <div className="absolute -left-[41px] w-5 h-5 rounded-full bg-white border-4 border-blue-500" />
                            <h5 className="font-black text-sm mb-2 text-blue-900">{step.title}</h5>
                            <p className="text-slate-500 text-xs leading-relaxed">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-10 rounded-[40px] bg-orange-50/30 border border-orange-100">
                <h4 className="text-xs font-black uppercase tracking-[0.4em] text-orange-600 mb-12">The Athlete Path</h4>
                <div className="relative pl-8 space-y-12 border-l-2 border-orange-200">
                    {[
                        { title: 'ONBOARD', desc: 'Create account and receive Secure OTP via Email.' },
                        { title: 'BRAND', desc: 'Upload professional banners and manage profile links.' },
                        { title: 'PUBLISH', desc: 'Draft stories, manage existing content, and track reach.' }
                    ].map((step, idx) => (
                        <div key={idx} className="relative">
                            <div className="absolute -left-[41px] w-5 h-5 rounded-full bg-white border-4 border-orange-500" />
                            <h5 className="font-black text-sm mb-2 text-orange-900">{step.title}</h5>
                            <p className="text-slate-500 text-xs leading-relaxed">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-10 rounded-[40px] bg-teal-50/30 border border-teal-100">
                <h4 className="text-xs font-black uppercase tracking-[0.4em] text-teal-600 mb-12">The Admin Path</h4>
                <div className="relative pl-8 space-y-12 border-l-2 border-teal-200">
                    {[
                        { title: 'OVERSEE', desc: 'Login to monitor user growth and system statistics.' },
                        { title: 'MODERATE', desc: 'Approve or Edit content and manage sport categories.' },
                        { title: 'MONITOR', desc: 'Track system uptime, DB status, and server latency.' }
                    ].map((step, idx) => (
                        <div key={idx} className="relative">
                            <div className="absolute -left-[41px] w-5 h-5 rounded-full bg-white border-4 border-teal-500" />
                            <h5 className="font-black text-sm mb-2 text-teal-900">{step.title}</h5>
                            <p className="text-slate-500 text-xs leading-relaxed">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        </section>

        {/* Technical Core Section */}
        <section className="p-20 rounded-[64px] bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-transparent pointer-events-none" />
          <h2 className="text-4xl font-black mb-16 relative z-10 uppercase tracking-tighter text-slate-900">TECHNICAL INFRASTRUCTURE</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
            <div className="p-8 rounded-[32px] bg-slate-50 border border-slate-100 flex flex-col items-center gap-4">
              <Zap className="w-8 h-8 text-yellow-500" />
              <div>
                <div className="text-[11px] font-black uppercase tracking-widest text-slate-900 mb-1">Performance</div>
                <p className="text-[10px] text-slate-500 leading-tight">Next.js 15 & Turbopack Core</p>
              </div>
            </div>
            <div className="p-8 rounded-[32px] bg-slate-50 border border-slate-100 flex flex-col items-center gap-4">
              <Database className="w-8 h-8 text-blue-500" />
              <div>
                <div className="text-[11px] font-black uppercase tracking-widest text-slate-900 mb-1">Database</div>
                <p className="text-[10px] text-slate-500 leading-tight">PostgreSQL 16 & Prisma Core</p>
              </div>
            </div>
            <div className="p-8 rounded-[32px] bg-slate-50 border border-slate-100 flex flex-col items-center gap-4">
              <Globe className="w-8 h-8 text-teal-500" />
              <div>
                <div className="text-[11px] font-black uppercase tracking-widest text-slate-900 mb-1">Cloud</div>
                <p className="text-[10px] text-slate-500 leading-tight">AWS EC2 & Vercel Edge</p>
              </div>
            </div>
            <div className="p-8 rounded-[32px] bg-slate-50 border border-slate-100 flex flex-col items-center gap-4">
              <Lock className="w-8 h-8 text-red-500" />
              <div>
                <div className="text-[11px] font-black uppercase tracking-widest text-slate-900 mb-1">Security</div>
                <p className="text-[10px] text-slate-500 leading-tight">JWT & Bcrypt Encryption</p>
              </div>
            </div>
          </div>

          <p className="mt-20 text-[11px] text-slate-400 font-black uppercase tracking-[0.6em] relative z-10">
            &copy; 2026 NLA SPORTS PLATFORM • PRODUCTION READY SYSTEM
          </p>
        </section>
      </div>
    </div>
  );
};

export default FeaturesPage;
