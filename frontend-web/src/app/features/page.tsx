"use client";

import React from 'react';
import { 
  Users, Trophy, MessageSquare, Edit3, Image, 
  ShieldCheck, Layout, Activity, ArrowRight,
  Globe, Lock, Database, Zap, CheckCircle2,
  Share2, ShieldAlert, BarChart3, Settings2
} from 'lucide-react';
import Link from 'next/link';

const FeaturesPage = () => {
  return (
    <div className="min-h-screen bg-[#05070a] text-white selection:bg-teal-500/30 font-sans">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-blue-500/5 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-teal-500/5 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        {/* Header Section */}
        <header className="text-center mb-40">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] mb-10 text-teal-400 shadow-2xl">
            <Activity className="w-3 h-3 animate-pulse" /> Production Ready Master Specification
          </div>
          <h1 className="text-8xl md:text-[10rem] font-black tracking-tighter mb-10 bg-gradient-to-b from-white to-white/20 bg-clip-text text-transparent leading-none">
            NLA SPORTS
          </h1>
          <p className="text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-medium">
            The definitive technical roadmap and feature specification for the elite athlete narrative platform.
          </p>

          <div className="mt-16 flex flex-wrap justify-center gap-6">
            <Link 
              href="/login" 
              className="group px-12 py-6 rounded-2xl bg-gradient-to-r from-blue-600 to-teal-500 text-white font-black uppercase tracking-[0.2em] text-xs hover:scale-105 transition-all shadow-2xl shadow-blue-500/30 flex items-center gap-4"
            >
              Launch Athlete Portal <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a 
              href="https://nla-admin-portal.vercel.app" 
              target="_blank"
              rel="noopener noreferrer"
              className="px-12 py-6 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.2em] text-xs hover:bg-white/10 transition-all flex items-center gap-4"
            >
              Access Admin Dashboard <Lock className="w-5 h-5" />
            </a>
          </div>
        </header>

        {/* --- SECTION 1: FAN EXPERIENCE --- */}
        <section className="mb-40">
          <div className="flex items-center gap-8 mb-20">
            <h2 className="text-5xl font-black tracking-tight text-blue-500">FAN EXPERIENCE</h2>
            <div className="h-[2px] flex-grow bg-gradient-to-r from-blue-500/50 to-transparent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-10 rounded-[48px] bg-white/[0.02] border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl -mr-16 -mt-16" />
              <div className="w-16 h-16 rounded-3xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-10 shadow-xl shadow-blue-500/10">
                <Layout className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black mb-6">Story Ecosystem</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-8">High-performance hub for sports narratives with professional filtering and categorization.</p>
              <ul className="space-y-4">
                {['Infinite-scroll optimization', 'Category-specific narratives', 'Exclusive content toggles'].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" /> {f}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-10 rounded-[48px] bg-white/[0.02] border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl -mr-16 -mt-16" />
              <div className="w-16 h-16 rounded-3xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-10 shadow-xl shadow-blue-500/10">
                <Trophy className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black mb-6">Social Discovery</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-8">Data-driven systems to highlight top talent and trending stories globally.</p>
              <ul className="space-y-4">
                {['Engagement-based Leaderboard', 'Keyword-optimized Search', 'Rich Media Athlete Bios'].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" /> {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-10 rounded-[48px] bg-white/[0.02] border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl -mr-16 -mt-16" />
              <div className="w-16 h-16 rounded-3xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-10 shadow-xl shadow-blue-500/10">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black mb-6">Interaction</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-8">Secure engagement tools designed to build strong community bonds.</p>
              <ul className="space-y-4">
                {['Verified Comment Threads', 'Post Reactions (Likes)', 'Personal Bookmarks'].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-gray-300">
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
            <h2 className="text-5xl font-black tracking-tight text-orange-500">ATHLETE STUDIO</h2>
            <div className="h-[2px] flex-grow bg-gradient-to-r from-orange-500/50 to-transparent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-10 rounded-[48px] bg-white/[0.02] border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-3xl -mr-16 -mt-16" />
              <div className="w-16 h-16 rounded-3xl bg-orange-500/10 flex items-center justify-center text-orange-500 mb-10 shadow-xl shadow-orange-500/10">
                <Image className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black mb-6">Content Creation</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-8">Professional publishing tools with integrated AWS S3 media support.</p>
              <ul className="space-y-4">
                {['Multi-image Upload (S3)', 'Draft & Slug Generation', 'Rich Text Narrative Editor'].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-orange-500" /> {f}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-10 rounded-[48px] bg-white/[0.02] border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-3xl -mr-16 -mt-16" />
              <div className="w-16 h-16 rounded-3xl bg-orange-500/10 flex items-center justify-center text-orange-500 mb-10 shadow-xl shadow-orange-500/10">
                <Share2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black mb-6">Brand Management</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-8">Total control over digital identity and social media link aggregation.</p>
              <ul className="space-y-4">
                {['Custom Avatars & Banners', 'Integrated Link Tree', 'Biography Showcases'].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-orange-500" /> {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-10 rounded-[48px] bg-white/[0.02] border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-3xl -mr-16 -mt-16" />
              <div className="w-16 h-16 rounded-3xl bg-orange-500/10 flex items-center justify-center text-orange-500 mb-10 shadow-xl shadow-orange-500/10">
                <BarChart3 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black mb-6">Growth Analytics</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-8">Transparent engagement data to track reach and fan sentiment.</p>
              <ul className="space-y-4">
                {['Live Engagement Pings', 'Interaction Dashboards', 'Post-level Performance'].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-gray-300">
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
            <h2 className="text-5xl font-black tracking-tight bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">USER JOURNEYS</h2>
            <div className="h-[2px] flex-grow bg-gradient-to-r from-purple-500/50 to-transparent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-12">
                <h4 className="text-xs font-black uppercase tracking-[0.4em] text-blue-500">The Fan Path</h4>
                <div className="relative pl-8 space-y-12 border-l border-white/10">
                    {[
                        { title: 'DISCOVER', desc: 'Browse the infinite feed and explore top athletes.' },
                        { title: 'JOIN', desc: 'Securely login to unlock community engagement.' },
                        { title: 'ENGAGE', desc: 'Like, comment, and save stories to personal folders.' }
                    ].map((step, idx) => (
                        <div key={idx} className="relative">
                            <div className="absolute -left-[37px] w-4 h-4 rounded-full bg-blue-500 border-4 border-[#05070a]" />
                            <h5 className="font-black text-sm mb-2">{step.title}</h5>
                            <p className="text-gray-500 text-xs leading-relaxed">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-12">
                <h4 className="text-xs font-black uppercase tracking-[0.4em] text-orange-500">The Athlete Path</h4>
                <div className="relative pl-8 space-y-12 border-l border-white/10">
                    {[
                        { title: 'ONBOARD', desc: 'Verify identity and create secure content creator account.' },
                        { title: 'BRAND', desc: 'Upload S3 banners and aggregate social media presence.' },
                        { title: 'PUBLISH', desc: 'Share high-media stories and monitor fan growth.' }
                    ].map((step, idx) => (
                        <div key={idx} className="relative">
                            <div className="absolute -left-[37px] w-4 h-4 rounded-full bg-orange-500 border-4 border-[#05070a]" />
                            <h5 className="font-black text-sm mb-2">{step.title}</h5>
                            <p className="text-gray-500 text-xs leading-relaxed">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-12">
                <h4 className="text-xs font-black uppercase tracking-[0.4em] text-teal-500">The Admin Path</h4>
                <div className="relative pl-8 space-y-12 border-l border-white/10">
                    {[
                        { title: 'OVERSEE', desc: 'Access high-level analytics and user statistics.' },
                        { title: 'MODERATE', desc: 'Approve, edit, or remove content and categories.' },
                        { title: 'MONITOR', desc: 'Track system health, database, and API latency.' }
                    ].map((step, idx) => (
                        <div key={idx} className="relative">
                            <div className="absolute -left-[37px] w-4 h-4 rounded-full bg-teal-500 border-4 border-[#05070a]" />
                            <h5 className="font-black text-sm mb-2">{step.title}</h5>
                            <p className="text-gray-500 text-xs leading-relaxed">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        </section>

        {/* Technical Core Section */}
        <section className="p-20 rounded-[64px] bg-white/[0.02] border border-white/5 relative overflow-hidden text-center">
          <div className="absolute inset-0 bg-gradient-to-b from-teal-500/10 to-transparent pointer-events-none" />
          <h2 className="text-4xl font-black mb-16 relative z-10 uppercase tracking-tighter">TECHNICAL INFRASTRUCTURE</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
            <div className="p-8 rounded-[32px] bg-black/40 border border-white/5 flex flex-col items-center gap-4">
              <Zap className="w-8 h-8 text-yellow-400" />
              <div>
                <div className="text-[11px] font-black uppercase tracking-widest text-white mb-1">Performance</div>
                <p className="text-[10px] text-gray-500 leading-tight">Next.js 15, React 19, & Turbopack Core</p>
              </div>
            </div>
            <div className="p-8 rounded-[32px] bg-black/40 border border-white/5 flex flex-col items-center gap-4">
              <Database className="w-8 h-8 text-blue-400" />
              <div>
                <div className="text-[11px] font-black uppercase tracking-widest text-white mb-1">Database</div>
                <p className="text-[10px] text-gray-500 leading-tight">PostgreSQL 16 & Prisma Type-Safety</p>
              </div>
            </div>
            <div className="p-8 rounded-[32px] bg-black/40 border border-white/5 flex flex-col items-center gap-4">
              <Globe className="w-8 h-8 text-teal-400" />
              <div>
                <div className="text-[11px] font-black uppercase tracking-widest text-white mb-1">Deployment</div>
                <p className="text-[10px] text-gray-500 leading-tight">AWS EC2, S3, & Vercel Edge Proxy</p>
              </div>
            </div>
            <div className="p-8 rounded-[32px] bg-black/40 border border-white/5 flex flex-col items-center gap-4">
              <Lock className="w-8 h-8 text-red-400" />
              <div>
                <div className="text-[11px] font-black uppercase tracking-widest text-white mb-1">Security</div>
                <p className="text-[10px] text-gray-500 leading-tight">JWT Tokens & Bcrypt Hash Shielding</p>
              </div>
            </div>
          </div>

          <p className="mt-20 text-[11px] text-gray-600 font-black uppercase tracking-[0.6em] relative z-10">
            &copy; 2026 NLA SPORTS PLATFORM • PRODUCTION READY SYTEM
          </p>
        </section>
      </div>
    </div>
  );
};

export default FeaturesPage;
