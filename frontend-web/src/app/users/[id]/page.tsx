"use client";

import { useState, use, useEffect, useRef } from "react";
import Link from "next/link";
import { Mail, MapPin, MessageSquare, Star, Play, Heart, X, Send, User, ChevronRight, Trophy, BookOpen, Share2, CheckCircle, Award, Link2, Layout } from "lucide-react";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";
import ReCAPTCHA from "react-google-recaptcha";
import StoryCard from "@/components/StoryCard";
import { SkeletonProfileHero, SkeletonText, SkeletonCardGrid } from "@/components/Skeleton";
import { fetchApi } from "@/lib/api";
import { getImageUrl, UPLOAD_FOLDERS, RECAPTCHA_SITE_KEY } from "@/lib/constants";
import Swal from "sweetalert2";

export default function AthleteDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<'about' | 'stories'>('about');
  
  const [athlete, setAthlete] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<ReCAPTCHA>(null);
  const [connectForm, setConnectForm] = useState({
    name: "", email: "", reason: "", message: ""
  });

  useEffect(() => {
    const loadAthleteData = async () => {
      try {
        const [athleteRes, postsRes] = await Promise.all([
          fetchApi(`/users/${id}`),
          fetchApi(`/posts?limit=100`) 
        ]);
        setAthlete(athleteRes.data);
        const athletePosts = postsRes.data.filter((p: any) => p.authorId === id && p.status === 'APPROVED');
        setPosts(athletePosts);
      } catch (error) {
        console.error("Failed to load athlete", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadAthleteData();
  }, [id]);

  const copyProfileLink = () => {
    navigator.clipboard.writeText(window.location.href);
    Swal.fire({
      title: 'Link Copied!',
      text: 'Profile link copied to clipboard.',
      icon: 'success',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000
    });
  };

  const totalLikes = posts.reduce((sum, p) => sum + (p._count?.likes || 0), 0);
  const badges = [
    { id: 'first', label: 'Trailblazer', icon: <Star className="w-3 h-3" />, active: posts.length > 0, description: 'Published their first story', color: '#A855F7', bg: 'rgba(168, 85, 247, 0.1)' },
    { id: 'verified', label: 'Verified Elite', icon: <CheckCircle className="w-3 h-3" />, active: athlete?.isVerified, description: 'Official NLA verified athlete', color: '#2563EB', bg: 'rgba(37, 99, 235, 0.1)' },
    { id: 'likes', label: 'Rising Star', icon: <Heart className="w-3 h-3" />, active: totalLikes >= 5, description: 'Earned 5+ community likes', color: '#EAB308', bg: 'rgba(234, 179, 8, 0.1)' },
    { id: 'pro', label: 'Impact Maker', icon: <Award className="w-3 h-3" />, active: posts.length >= 5, description: 'Published 5+ stories', color: '#E11D48', bg: 'rgba(225, 29, 72, 0.1)' },
  ];

  const handleConnectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken) {
      Swal.fire({ title: 'Verification Required', text: 'Please complete the CAPTCHA.', icon: 'warning' });
      return;
    }

    setIsSubmitting(true);
    try {
      await fetchApi('/connections', {
        method: 'POST',
        body: JSON.stringify({ ...connectForm, receiverId: id, captchaToken })
      });
      Swal.fire({ title: 'Request Sent!', text: `Your connection request has been sent to ${athlete?.profile?.fullName}.`, icon: 'success' });
      setIsConnectModalOpen(false);
      setConnectForm({ name: "", email: "", reason: "", message: "" });
      setCaptchaToken(null);
      captchaRef.current?.reset();
    } catch (error: any) {
      Swal.fire({ title: 'Error', text: error.message, icon: 'error' });
      captchaRef.current?.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="container mx-auto px-4 py-20"><SkeletonProfileHero /><div className="mt-12"><SkeletonText lines={10} /></div></div>;

  if (!athlete) return <div className="flex-1 flex justify-center items-center h-screen" style={{ color: 'var(--foreground)' }}><h1 className="text-2xl font-bold">Athlete not found.</h1></div>;

  const profile = athlete.profile || {};

  return (
    <div style={{ background: 'var(--background)', color: 'var(--foreground)' }} className="flex-1 pb-20">
      
      {/* Unified Profile Identity Section (Synced with Dashboard) */}
      <div className="relative pb-8">
        {/* Full-width Background Banner */}
        <div className="h-64 md:h-80 w-full bg-zinc-900 overflow-hidden relative">
          {profile.coverUrl ? (
            <img 
              src={getImageUrl(profile.coverUrl, UPLOAD_FOLDERS.STORIES)} 
              className="w-full h-full object-cover" 
              alt="Cover Banner" 
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center opacity-40">
                <Layout className="w-20 h-20 text-white/10" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/20"></div>
        </div>

        {/* Master Identity Card (Dashboard Style) */}
        <div className="container mx-auto px-4 max-w-6xl relative z-20 -mt-24 md:-mt-32">
          <div style={{ background: 'var(--surface)', borderColor: 'var(--border)' }} className="rounded-[2.5rem] shadow-2xl border p-6 md:p-10">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Avatar */}
              <div className="w-40 h-40 md:w-44 md:h-44 rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-[var(--surface)] flex items-center justify-center bg-[var(--surface)] shrink-0 -mt-16 md:-mt-20 relative z-30">
                {profile.avatarUrl ? (
                  <img 
                    src={getImageUrl(profile.avatarUrl, UPLOAD_FOLDERS.AVATARS)} 
                    alt={profile.fullName} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full bg-brand-blue/5 flex items-center justify-center">
                      <span className="text-6xl font-black text-brand-blue/20">{profile.fullName?.charAt(0)}</span>
                  </div>
                )}
              </div>

              {/* Identity & Actions Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-6">
                  <div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 flex items-center justify-center md:justify-start gap-3">
                      {profile.fullName || "Athlete"}
                      {athlete.isVerified && <CheckCircle className="w-6 h-6 text-brand-blue fill-brand-blue/10" />}
                    </h1>
                    <p className="text-brand-blue font-black uppercase tracking-[0.2em] text-[10px] md:text-xs mb-4">
                      {profile.tagline || "NLA ELITE ATHLETE"}
                    </p>
                    
                    <div className="flex flex-wrap justify-center md:justify-start gap-6 text-xs font-bold text-muted">
                      {profile.city && <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-brand-red" /> {profile.city}</span>}
                      <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-brand-blue" /> {athlete.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    <button onClick={copyProfileLink} className="w-12 h-12 bg-surface-hover border border-[var(--border)] rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-sm" title="Copy Profile Link">
                      <Link2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => setIsConnectModalOpen(true)} className="px-8 py-3.5 bg-brand-blue text-white font-black rounded-2xl hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-500/20 text-xs uppercase tracking-[0.2em]">
                      Connect
                    </button>
                  </div>
                </div>

                {/* Socials & Badges Row */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 pt-6 border-t border-[var(--border)]">
                   <div className="flex items-center gap-3">
                      {profile.instagramUrl && (
                        <a href={profile.instagramUrl} target="_blank" className="w-9 h-9 rounded-xl bg-pink-50 flex items-center justify-center text-[#E4405F] hover:bg-[#E4405F] hover:text-white transition-all shadow-sm">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                        </a>
                      )}
                      {profile.twitterUrl && (
                        <a href={profile.twitterUrl} target="_blank" className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-[#1DA1F2] hover:bg-[#1DA1F2] hover:text-white transition-all shadow-sm">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                        </a>
                      )}
                      {profile.youtubeUrl && (
                        <a href={profile.youtubeUrl} target="_blank" className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-[#CD201F] hover:bg-[#CD201F] hover:text-white transition-all shadow-sm">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
                        </a>
                      )}
                      {profile.facebookUrl && (
                        <a href={profile.facebookUrl} target="_blank" className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-all shadow-sm">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                        </a>
                      )}
                   </div>

                   <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    {badges.map(badge => (
                      <div 
                        key={badge.id} 
                        style={badge.active ? { backgroundColor: badge.bg, borderColor: `${badge.color}20`, color: badge.color } : {}}
                        className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all cursor-help ${badge.active ? '' : 'bg-gray-50 border-gray-100 text-gray-300 opacity-40 grayscale'}`}
                      >
                        {badge.icon} {badge.label}
                        
                        {/* Custom Premium Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 p-3 bg-zinc-900/95 backdrop-blur-md text-white rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 pointer-events-none transition-all duration-300 z-50 border border-white/10 text-center">
                           <p style={{ color: badge.color }} className="text-[10px] font-black mb-1 uppercase tracking-tighter">{badge.label}</p>
                           <p className="text-[9px] font-medium leading-relaxed text-white/70 italic">"{badge.description}"</p>
                           <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-8 border-transparent border-t-zinc-900/95"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="profile-content" className="container mx-auto px-4 mt-8 max-w-5xl relative z-10">
        {/* Tabs */}
        <div className="flex items-center gap-12 border-b mb-12" style={{ borderColor: 'var(--border)' }}>
          <button onClick={() => setActiveTab('about')} className={`font-black text-xs uppercase tracking-[0.3em] pb-6 border-b-4 transition-all ${activeTab === 'about' ? 'text-brand-blue border-brand-blue' : 'text-muted border-transparent hover:text-[var(--foreground)]'}`}>ATHLETE BIO</button>
          <button onClick={() => setActiveTab('stories')} className={`font-black text-xs uppercase tracking-[0.3em] pb-6 border-b-4 transition-all ${activeTab === 'stories' ? 'text-brand-blue border-brand-blue' : 'text-muted border-transparent hover:text-[var(--foreground)]'}`}>PUBLISHED STORIES ({posts.length})</button>
        </div>

        {/* Tab Content */}
        <div className="space-y-12">
          {activeTab === 'about' ? (
            <div style={{ background: 'var(--surface)', borderColor: 'var(--border)' }} className="border rounded-[2.5rem] p-10 shadow-sm">
              <h3 className="text-sm font-black text-brand-blue uppercase tracking-[0.3em] mb-8 flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-brand-blue" /> JOURNEY & BIO</h3>
              <div className="text-muted text-lg leading-relaxed whitespace-pre-wrap font-medium">
                {profile.bio || "No biography provided yet."}
              </div>
            </div>
          ) : (
            posts.length === 0 ? (
              <div style={{ background: 'var(--surface)', borderColor: 'var(--border)' }} className="rounded-[2.5rem] p-24 text-center border border-dashed">
                <BookOpen className="w-12 h-12 text-muted mx-auto mb-4 opacity-20" />
                <p className="text-muted font-bold uppercase tracking-widest text-xs">No stories yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {posts.map((post, i) => <StoryCard key={post.id} post={post} index={i} />)}
              </div>
            )
          )}
        </div>
      </div>

      {/* Connect Modal */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div style={{ background: 'var(--surface)' }} className="rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col">
            <div style={{ borderColor: 'var(--border)' }} className="p-8 border-b flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-tighter">CONNECT WITH {profile.fullName?.split(' ')[0]}</h2>
              <button onClick={() => setIsConnectModalOpen(false)} className="w-10 h-10 rounded-2xl bg-surface-hover flex items-center justify-center"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleConnectSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-muted mb-2">Name</label>
                  <input type="text" value={connectForm.name} onChange={e => setConnectForm({...connectForm, name: e.target.value})} className="w-full px-5 py-4 bg-surface-hover rounded-2xl focus:ring-1 ring-brand-blue outline-none border-0" required />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-muted mb-2">Email</label>
                  <input type="email" value={connectForm.email} onChange={e => setConnectForm({...connectForm, email: e.target.value})} className="w-full px-5 py-4 bg-surface-hover rounded-2xl focus:ring-1 ring-brand-blue outline-none border-0" required />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-muted mb-2">Reason</label>
                <select value={connectForm.reason} onChange={e => setConnectForm({...connectForm, reason: e.target.value})} className="w-full px-5 py-4 bg-surface-hover rounded-2xl focus:ring-1 ring-brand-blue outline-none border-0" required>
                  <option value="">Select a reason</option>
                  <option value="recruitment">Recruitment</option>
                  <option value="sponsorship">Sponsorship</option>
                  <option value="fan">Hello!</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-muted mb-2">Message</label>
                <textarea rows={4} value={connectForm.message} onChange={e => setConnectForm({...connectForm, message: e.target.value})} className="w-full px-5 py-4 bg-surface-hover rounded-2xl focus:ring-1 ring-brand-blue outline-none border-0 resize-none" required />
              </div>

              <div className="flex justify-center py-2">
                <ReCAPTCHA ref={captchaRef} sitekey={RECAPTCHA_SITE_KEY} theme="dark" onChange={setCaptchaToken} />
              </div>

              <button type="submit" disabled={isSubmitting || !captchaToken} className="w-full py-5 bg-brand-blue text-white font-black rounded-2xl hover:shadow-xl shadow-blue-500/20 disabled:opacity-50 uppercase tracking-widest text-[10px] flex items-center justify-center gap-2">
                <Send className="w-4 h-4" /> {isSubmitting ? 'SENDING...' : 'SEND MESSAGE'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
