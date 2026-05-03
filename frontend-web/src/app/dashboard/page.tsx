"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  PlusCircle, Edit, FileText, Heart, Activity, User, 
  Video, Trash2, Edit3, X, Upload, Play, Eye, MapPin, Mail,
  Settings, LogOut, MessageSquare, Clock, CheckCircle2, ChevronRight, Star, Award
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchApi, uploadFileToS3 } from "@/lib/api";
import { getImageUrl, UPLOAD_FOLDERS } from "@/lib/constants";
import Swal from "sweetalert2";

interface UserProfile {
  fullName?: string;
  avatarUrl?: string;
  coverUrl?: string;
  tagline?: string;
  city?: string;
  bio?: string;
}

export default function UnifiedDashboard() {
  const { user, logout, isLoading: authLoading, refreshUser } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'stories' | 'requests'>('overview');
  const [stats, setStats] = useState({
    postCount: 0,
    totalLikes: 0,
    engagementRate: "0%"
  });
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [allowEditAfterApproval, setAllowEditAfterApproval] = useState(true);

  // Reply Modal State
  const [replyModal, setReplyModal] = useState<{ open: boolean; conn: any | null }>({ open: false, conn: null });
  const [replyMessage, setReplyMessage] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Edit Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    challenge: "",
    motivation: "",
    achievement: "",
    categoryId: "",
    mediaUrl: "",
    youtubeUrl: ""
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchDashboardData();
    }
  }, [user, authLoading]);

  const fetchDashboardData = async () => {
    setIsDataLoading(true);
    try {
      const [statsRes, postsRes, catsRes, connRes] = await Promise.all([
        fetchApi('/users/stats'),
        fetchApi('/posts/my-posts'),
        fetchApi('/categories'),
        fetchApi('/connections/received')
      ]);
      
      if (statsRes.data) setStats(statsRes.data);
      if (postsRes.data) setMyPosts(postsRes.data.posts || []);
      if (catsRes.data) setCategories(catsRes.data || []);
      if (connRes.data) setConnections(connRes.data || []);

      // Check global setting for editing approved posts
      const settingsRes = await fetchApi('/settings');
      if (settingsRes.data && settingsRes.data.allowEditAfterApproval === "false") {
        setAllowEditAfterApproval(false);
      } else {
        setAllowEditAfterApproval(true);
      }
    } catch (err) {
      console.error('[DASHBOARD] Data fetch error:', err);
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleDeletePost = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to delete this story?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    try {
      await fetchApi(`/posts/${id}`, { method: 'DELETE' });
      setMyPosts(myPosts.filter(p => p.id !== id));
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Story deleted', showConfirmButton: false, timer: 3000 });
      // Refresh stats
      fetchApi('/users/stats').then(res => res.data && setStats(res.data));
    } catch (error) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Failed to delete post.', showConfirmButton: false, timer: 3000 });
    }
  };

  const handleEditClick = (post: any) => {
    const isVideo = post.type === 'video';
    setEditingPost(post);
    setEditForm({
      title: post.title || "",
      description: post.description || "",
      challenge: post.challenge || "",
      motivation: post.motivation || "",
      achievement: post.achievement || "",
      categoryId: post.categoryId || "",
      mediaUrl: isVideo ? "" : (post.mediaUrl || ""),
      youtubeUrl: isVideo ? (post.mediaUrl || "") : ""
    });
    setIsEditModalOpen(true);
  };

  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const vId = getYoutubeId(editForm.youtubeUrl);
      const mediaUrlToSave = vId ? editForm.youtubeUrl : editForm.mediaUrl;
      const content = `Challenge: ${editForm.challenge}\n\nMotivation: ${editForm.motivation}\n\nAchievement: ${editForm.achievement}`;

      await fetchApi(`/posts/${editingPost.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...editForm,
          content,
          type: vId ? 'video' : 'story',
          mediaUrl: mediaUrlToSave
        })
      });

      Swal.fire({ icon: 'success', title: 'Updated!', text: 'Your story has been updated successfully.', timer: 2000, showConfirmButton: false });
      setIsEditModalOpen(false);
      fetchDashboardData();
    } catch (error: any) {
      Swal.fire({ icon: 'error', title: 'Update Failed', text: error.message });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const filename = await uploadFileToS3(file, UPLOAD_FOLDERS.POSTS);
      setEditForm(prev => ({ ...prev, mediaUrl: filename, youtubeUrl: "" }));
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Uploaded!', showConfirmButton: false, timer: 2000 });
    } catch (err: any) {
      Swal.fire({ title: 'Upload Failed', text: err.message, icon: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleStatusUpdate = async (connId: string, status: string) => {
    try {
      await fetchApi(`/connections/${connId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      setConnections(connections.map(c => c.id === connId ? { ...c, status } : c));
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `Marked as ${status.toLowerCase()}`, showConfirmButton: false, timer: 2000 });
    } catch (err) {
      Swal.fire({ title: 'Error', text: 'Failed to update status', icon: 'error' });
    }
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !replyModal.conn) return;
    setIsSendingReply(true);
    try {
      await fetchApi(`/connections/${replyModal.conn.id}/reply`, {
        method: 'POST',
        body: JSON.stringify({ replyMessage })
      });
      setConnections(connections.map(c => c.id === replyModal.conn!.id ? { ...c, status: 'REPLIED' } : c));
      setReplyModal({ open: false, conn: null });
      setReplyMessage('');
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Reply sent via email!', showConfirmButton: false, timer: 3000 });
    } catch (err: any) {
      Swal.fire({ title: 'Error', text: err.message, icon: 'error' });
    } finally {
      setIsSendingReply(false);
    }
  };

  if (authLoading || (user && isDataLoading)) {
    return (
      <div className="flex-1 flex justify-center items-center h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-yellow"></div>
          <p className="text-sm font-bold text-muted animate-pulse">Loading your athlete hub...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const profile = (user.profile || {}) as UserProfile;
  const fullName = profile.fullName || "Athlete";
  const firstName = fullName.split(' ')[0];

  const videoId = getYoutubeId(editForm.youtubeUrl);
  let thumbnailUrl = "";
  if (videoId) {
    thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  } else if (editForm.mediaUrl) {
    thumbnailUrl = getImageUrl(editForm.mediaUrl, UPLOAD_FOLDERS.POSTS) || "";
  }

  const badges = [
    { id: 'first', label: 'Trailblazer', icon: <Star className="w-3 h-3" />, active: stats.postCount > 0, description: 'Published their first story', color: '#A855F7', bg: 'rgba(168, 85, 247, 0.1)' },
    { id: 'verified', label: 'Verified Elite', icon: <CheckCircle2 className="w-3 h-3" />, active: user?.isVerified, description: 'Official NLA verified athlete', color: '#2563EB', bg: 'rgba(37, 99, 235, 0.1)' },
    { id: 'likes', label: 'Rising Star', icon: <Heart className="w-3 h-3" />, active: stats.totalLikes >= 5, description: 'Earned 5+ community likes', color: '#EAB308', bg: 'rgba(234, 179, 8, 0.1)' },
    { id: 'pro', label: 'Impact Maker', icon: <Award className="w-3 h-3" />, active: stats.postCount >= 5, description: 'Published 5+ stories', color: '#E11D48', bg: 'rgba(225, 29, 72, 0.1)' },
  ];

  return (
    <div className="flex-1 bg-background text-gray-900 pb-20">
      
      {/* Profile Backdrop/Hero */}
      <div className="h-64 md:h-80 bg-zinc-900 relative overflow-hidden">
        {profile.coverUrl ? (
          <img 
            src={getImageUrl(profile.coverUrl, UPLOAD_FOLDERS.STORIES)} 
            className="w-full h-full object-cover" 
            alt="Dashboard Cover" 
          />
        ) : (
          <img 
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2500&auto=format&fit=crop" 
            className="w-full h-full object-cover opacity-30 mix-blend-overlay blur-sm" 
            alt="Default Cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/20"></div>
      </div>

      <div className="container mx-auto px-4 -mt-32 max-w-6xl relative z-10">
        
        {/* Header Profile Section */}
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="w-40 h-40 rounded-[2.5rem] bg-white overflow-hidden shrink-0 shadow-2xl border-4 border-white -mt-20 md:-mt-24 flex items-center justify-center">
              {profile.avatarUrl ? (
                <img src={getImageUrl(profile.avatarUrl, UPLOAD_FOLDERS.AVATARS) || ""} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-brand-yellow/10 flex items-center justify-center">
                  <User className="w-16 h-16 text-brand-yellow" />
                </div>
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-6">
                <div>
                  <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 flex items-center justify-center md:justify-start gap-3">
                    {fullName}
                    {user.isVerified && <CheckCircle2 className="w-6 h-6 text-brand-blue fill-brand-blue/10" />}
                  </h1>
                  <p className="text-brand-blue font-black uppercase tracking-[0.2em] text-[10px] md:text-xs mb-4">{profile.tagline || "NLA ATHLETE"}</p>
                  
                  <div className="flex flex-wrap justify-center md:justify-start gap-6 text-xs font-bold text-muted">
                    {profile.city && <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-brand-red" /> {profile.city}</span>}
                    <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-brand-blue" /> {user.email}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 justify-center">
                    <Link href="/submit" className="flex items-center gap-2 px-6 py-3 bg-brand-yellow text-black font-black rounded-xl hover:bg-yellow-400 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-yellow/20 text-[10px] uppercase tracking-widest">
                        <PlusCircle className="w-4 h-4" /> Share Story
                    </Link>
                    <Link href="/edit-profile" className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-black rounded-xl hover:bg-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/20 text-[10px] uppercase tracking-widest">
                      <Edit3 className="w-4 h-4" /> Edit Profile
                    </Link>
                    <button onClick={handleLogout} className="w-12 h-12 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-100 shadow-sm" title="Logout">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
              </div>

              {/* Socials & Badges Row (Synced with Public Profile) */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 pt-6 border-t border-gray-50">
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

        {/* Stats Section - Small Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-brand-yellow/10 flex items-center justify-center shrink-0 border border-brand-yellow/20">
              <FileText className="w-6 h-6 text-brand-yellow" />
            </div>
            <div>
              <div className="text-2xl font-black leading-none mb-1">{stats.postCount}</div>
              <div className="text-[10px] font-black text-muted uppercase tracking-wider">Total Stories</div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center shrink-0 border border-brand-blue/20">
              <Heart className="w-6 h-6 text-brand-blue" />
            </div>
            <div>
              <div className="text-2xl font-black leading-none mb-1">
                {stats.totalLikes > 999 ? (stats.totalLikes / 1000).toFixed(1) + 'k' : stats.totalLikes}
              </div>
              <div className="text-[10px] font-black text-muted uppercase tracking-wider">Likes Received</div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-brand-yellow/10 flex items-center justify-center shrink-0 border border-brand-yellow/20">
              <Activity className="w-6 h-6 text-brand-yellow" />
            </div>
            <div>
              <div className="text-2xl font-black leading-none mb-1">{stats.engagementRate}</div>
              <div className="text-[10px] font-black text-muted uppercase tracking-wider">Engagement Rate</div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="relative border-b border-gray-100 mb-10 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-8">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`font-black text-lg tracking-tight pb-4 whitespace-nowrap transition-all duration-300 ${activeTab === 'overview' ? 'text-[#C11E6A]' : 'text-gray-400 hover:text-gray-900'}`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('stories')}
              className={`font-black text-lg tracking-tight pb-4 whitespace-nowrap transition-all duration-300 flex items-center gap-2 ${activeTab === 'stories' ? 'text-[#C11E6A]' : 'text-gray-400 hover:text-gray-900'}`}
            >
              My Stories <span className={`px-2.5 py-1 rounded-full text-xs ${activeTab === 'stories' ? 'bg-[#C11E6A]/10 text-[#C11E6A]' : 'bg-gray-100 text-gray-400'}`}>{myPosts.length}</span>
            </button>
            <button 
              onClick={() => setActiveTab('requests')}
              className={`font-black text-lg tracking-tight pb-4 whitespace-nowrap transition-all duration-300 flex items-center gap-2 ${activeTab === 'requests' ? 'text-[#C11E6A]' : 'text-gray-400 hover:text-gray-900'} relative`}
            >
              Inquiries <span className={`px-2.5 py-1 rounded-full text-xs ${activeTab === 'requests' ? 'bg-[#C11E6A]/10 text-[#C11E6A]' : 'bg-gray-100 text-gray-400'}`}>{connections.length}</span>
              {connections.filter(c => c.status === 'PENDING').length > 0 && (
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse absolute top-0 -right-1.5 border-2 border-white"></span>
              )}
            </button>
          </div>
          
          {/* Animated Underline */}
          <div 
            className="absolute bottom-0 h-0.5 bg-[#C11E6A] transition-all duration-500 ease-in-out rounded-full"
            style={{
              left: activeTab === 'overview' ? '0px' : activeTab === 'stories' ? '108px' : '262px',
              width: activeTab === 'overview' ? '76px' : activeTab === 'stories' ? '122px' : '108px'
            }}
          />
        </div>

        <div className="grid grid-cols-1 gap-10">
            
            {/* Tab Panels */}
            <div>
                {activeTab === 'overview' && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <section className="bg-white rounded-3xl p-8 md:p-10 border border-gray-100 shadow-sm">
                            <h3 className="text-3xl font-black uppercase tracking-tight mb-8 flex items-center gap-4">
                                <div className="w-2 h-8 bg-brand-blue rounded-full" />
                                JOURNEY & BIO
                            </h3>
                            <div className="text-muted leading-relaxed whitespace-pre-wrap font-medium">
                                {profile.bio || "No journey details shared yet. Your story can inspire others!"}
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'stories' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                            <div>
                                <h3 className="text-4xl font-black text-gray-900 tracking-tight mb-2">My Stories</h3>
                                <p className="text-gray-500 font-medium">Manage and track the status of your submissions.</p>
                            </div>
                            <Link href="/submit" className="flex items-center gap-3 px-8 py-4 bg-brand-yellow text-black font-black rounded-2xl hover:bg-yellow-400 transition-all shadow-xl shadow-brand-yellow/20 text-sm uppercase tracking-widest">
                                <PlusCircle className="w-5 h-5" /> Create New
                            </Link>
                        </div>
                        
                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-4 px-8 py-6 border-b border-gray-50 bg-gray-50/30">
                                <div className="col-span-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Story Details</div>
                                <div className="col-span-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Date</div>
                                <div className="col-span-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">Status</div>
                                <div className="col-span-1 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">Views</div>
                                <div className="col-span-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Actions</div>
                            </div>

                            <div className="divide-y divide-gray-50">
                                {myPosts.length === 0 ? (
                                    <div className="text-center py-24">
                                        <Video className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                        <p className="text-gray-400 font-bold mb-6">No stories shared yet.</p>
                                        <Link href="/submit" className="px-8 py-3 bg-brand-blue text-white rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-brand-blue/20">Share First Story</Link>
                                    </div>
                                ) : (
                                    myPosts.map(post => {
                                        const youtubeId = post.type === 'video' ? getYoutubeId(post.mediaUrl) : null;
                                        const thumb = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : (getImageUrl(post.mediaUrl, UPLOAD_FOLDERS.POSTS) || "");

                                        return (
                                            <div key={post.id} className="grid grid-cols-12 gap-4 px-8 py-8 items-center hover:bg-gray-50/50 transition-colors group">
                                                {/* Details */}
                                                <div className="col-span-5 flex items-center gap-6">
                                                    <div className="w-20 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0 shadow-sm border border-gray-100">
                                                        <img src={thumb || "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=200&auto=format&fit=crop"} alt="Thumb" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-gray-900 group-hover:text-brand-blue transition-colors mb-1 leading-tight">{post.title}</h4>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                                {post.category?.name || "Uncategorized"}
                                                            </span>
                                                            <span className="w-1 h-1 bg-gray-200 rounded-full" />
                                                            <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest">
                                                                {post.type}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Date */}
                                                <div className="col-span-2 text-sm font-bold text-gray-500">
                                                    {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>

                                                {/* Status */}
                                                <div className="col-span-2 flex flex-col items-center">
                                                    <span className={`text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest ${
                                                        post.status === 'APPROVED' ? 'bg-green-100 text-green-600' : 
                                                        post.status === 'REJECTED' ? 'bg-red-100 text-red-600' : 
                                                        post.status === 'PENDING' ? 'bg-yellow-100 text-yellow-600' :
                                                        'bg-gray-100 text-gray-500'
                                                    }`}>
                                                        {post.status.charAt(0) + post.status.slice(1).toLowerCase()}
                                                    </span>
                                                    {post.status === 'REJECTED' && (
                                                        <span className="text-[9px] text-red-400 mt-2 font-bold text-center leading-tight">Check notifications for reason</span>
                                                    )}
                                                </div>

                                                {/* Views */}
                                                <div className="col-span-1 text-center font-black text-gray-900">
                                                    {post.status === 'APPROVED' ? (post.viewCount > 999 ? (post.viewCount/1000).toFixed(1) + 'k' : post.viewCount) : '-'}
                                                </div>

                                                {/* Actions */}
                                                <div className="col-span-2 flex items-center justify-end gap-2">
                                                    <Link 
                                                        href={`/stories/${post.id}`}
                                                        className="w-10 h-10 rounded-full bg-white border border-gray-100 text-gray-400 flex items-center justify-center hover:bg-gray-900 hover:text-white transition-all shadow-sm"
                                                        title="View"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </Link>

                                                    {(post.status !== 'APPROVED' || allowEditAfterApproval) && (
                                                        <button 
                                                            onClick={() => handleEditClick(post)}
                                                            className="w-10 h-10 rounded-full bg-white border border-gray-100 text-gray-400 flex items-center justify-center hover:bg-brand-blue hover:text-white transition-all shadow-sm"
                                                            title="Edit"
                                                        >
                                                            <Edit3 className="w-5 h-5" />
                                                        </button>
                                                    )}

                                                    <button 
                                                        onClick={() => handleDeletePost(post.id)} 
                                                        className="w-10 h-10 rounded-full bg-white border border-gray-100 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'requests' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-black uppercase tracking-wider">Connection Inquiries</h3>
                            <p className="text-xs font-bold text-muted">People reaching out to you</p>
                        </div>

                        {connections.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <MessageSquare className="w-10 h-10 text-gray-200" />
                                </div>
                                <h4 className="text-xl font-black mb-2">No inquiries yet</h4>
                                <p className="text-muted text-sm font-medium">When fans or scouts reach out, they will appear here.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {connections.map(conn => (
                                    <div key={conn.id} className={`bg-white border ${conn.status === 'PENDING' ? 'border-brand-blue/30 bg-brand-blue/[0.02]' : 'border-gray-100'} rounded-[2rem] p-8 shadow-sm transition-all hover:shadow-md relative overflow-hidden group`}>
                                        {conn.status === 'PENDING' && (
                                            <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-blue"></div>
                                        )}
                                        
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                            <div className="flex-1 space-y-6">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center shrink-0">
                                                        <User className="w-6 h-6 text-gray-400" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-xl mb-1">{conn.name}</h4>
                                                        <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-muted uppercase tracking-widest">
                                                            <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {conn.email}</span>
                                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(conn.createdAt).toLocaleDateString()}</span>
                                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                            <span className="px-2.5 py-1 bg-brand-blue/10 text-brand-blue rounded-full">{conn.reason}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100/50">
                                                    <p className="text-sm text-gray-600 leading-relaxed italic">"{conn.message}"</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-row md:flex-col items-center gap-3 shrink-0">
                                                {conn.status === 'PENDING' ? (
                                                    <button 
                                                        onClick={() => handleStatusUpdate(conn.id, 'READ')}
                                                        className="flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                                                    >
                                                        Mark Read
                                                    </button>
                                                ) : conn.status === 'REPLIED' ? (
                                                    <div className="flex items-center gap-2 px-5 py-2.5 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-xl border border-green-100">
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> Replied
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 px-5 py-2.5 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-xl border border-green-100">
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> Read
                                                    </div>
                                                )}
                                                <button 
                                                    onClick={() => { setReplyModal({ open: true, conn }); setReplyMessage(''); }}
                                                    className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-900 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-blue hover:text-white hover:border-brand-blue transition-all"
                                                >
                                                    <MessageSquare className="w-3.5 h-3.5" /> Reply
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Reply Modal */}
      {replyModal.open && replyModal.conn && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-brand-blue" />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight">Reply to {replyModal.conn.name}</h2>
                  <p className="text-[10px] text-muted font-black uppercase tracking-widest mt-1">{replyModal.conn.email}</p>
                </div>
              </div>
              <button onClick={() => setReplyModal({ open: false, conn: null })} className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-all hover:rotate-90">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Their Message</p>
                <p className="text-sm text-gray-700 italic leading-relaxed">"{replyModal.conn.message}"</p>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Your Reply</label>
                <textarea
                  rows={5}
                  value={replyMessage}
                  onChange={e => setReplyMessage(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 font-medium transition-all resize-none"
                  placeholder="Type your message here. It will be delivered to their email inbox..."
                />
              </div>
              <button
                onClick={handleSendReply}
                disabled={isSendingReply || !replyMessage.trim()}
                className="w-full py-4 bg-brand-blue text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 uppercase tracking-widest text-xs flex items-center justify-center gap-3"
              >
                {isSendingReply ? 'Sending...' : <><MessageSquare className="w-4 h-4" /> Send Reply via Email</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-yellow/10 flex items-center justify-center border border-brand-yellow/20">
                    <Edit3 className="w-6 h-6 text-brand-yellow" />
                </div>
                <div>
                    <h2 className="text-2xl font-black tracking-tight">Edit Your Story</h2>
                    <p className="text-[10px] text-muted font-black uppercase tracking-[0.2em] mt-1">Status: {editingPost?.status}</p>
                </div>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-all hover:rotate-90">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8 md:p-10">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                
                {/* Form Section */}
                <div className="lg:col-span-3 space-y-8">
                    <form className="space-y-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-muted">Title</label>
                                <input type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-1 ring-brand-blue outline-none transition-all text-sm" />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-muted">Short Description</label>
                                <textarea rows={2} value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-1 ring-brand-blue outline-none transition-all text-sm resize-none" placeholder="A brief summary of your story..." />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Category</label>
                                <select 
                                    value={editForm.categoryId}
                                    onChange={e => setEditForm({...editForm, categoryId: e.target.value})}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-yellow/30 font-bold transition-all appearance-none"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">The Challenge</label>
                                <textarea 
                                    rows={3}
                                    value={editForm.challenge}
                                    onChange={e => setEditForm({...editForm, challenge: e.target.value})}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-yellow/30 text-sm leading-relaxed"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Your Motivation</label>
                                <textarea 
                                    rows={3}
                                    value={editForm.motivation}
                                    onChange={e => setEditForm({...editForm, motivation: e.target.value})}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-yellow/30 text-sm leading-relaxed"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">The Achievement</label>
                                <textarea 
                                    rows={3}
                                    value={editForm.achievement}
                                    onChange={e => setEditForm({...editForm, achievement: e.target.value})}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-yellow/30 text-sm leading-relaxed"
                                />
                            </div>
                        </div>
                    </form>
                </div>

                {/* Preview & Media Section */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100 shadow-inner">
                        <div className="flex items-center gap-2 mb-6">
                            <Eye className="w-5 h-5 text-brand-blue" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-900">Media Master</h3>
                        </div>
                        
                        <div className="aspect-video bg-white rounded-2xl mb-8 overflow-hidden relative shadow-md border-4 border-white">
                            {thumbnailUrl ? (
                                <>
                                    <img src={thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
                                    {videoId && (
                                        <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/20 group">
                                            <div className="w-14 h-14 bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 group-hover:scale-110 transition-transform">
                                                <Play className="w-6 h-6 fill-white text-white ml-1" />
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-muted">
                                    <Video className="w-10 h-10 mb-2 opacity-10" />
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-30">Waiting for Media</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-8">
                            <div className="bg-white p-6 rounded-2xl border border-dashed border-gray-200 flex flex-col items-center text-center hover:border-brand-blue/30 transition-colors">
                                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 shadow-sm text-brand-blue">
                                    <Upload className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-4">Replace Image/Video</span>
                                <label className="cursor-pointer">
                                    <span className="px-6 py-3 bg-brand-blue text-white text-[10px] font-black rounded-xl hover:bg-blue-700 transition-all inline-block uppercase tracking-[0.2em] shadow-lg shadow-brand-blue/20">
                                        {isUploading ? "Uploading..." : "Browse Local"}
                                    </span>
                                    <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileUpload} disabled={isUploading} />
                                </label>
                            </div>

                            <div className="flex flex-col">
                                <label className="block text-[10px] font-black text-gray-400 mb-3 uppercase tracking-widest">Or Link YouTube</label>
                                <input 
                                    type="url" 
                                    value={editForm.youtubeUrl}
                                    onChange={(e) => {
                                        setEditForm({...editForm, youtubeUrl: e.target.value});
                                        if (e.target.value) setEditForm(prev => ({...prev, mediaUrl: ""}));
                                    }}
                                    className="w-full px-5 py-3 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-yellow/30 text-xs font-bold"
                                    placeholder="https://youtube.com/..."
                                />
                                {getYoutubeId(editForm.youtubeUrl) && (
                                    <p className="text-[10px] text-brand-yellow mt-2 font-black uppercase tracking-widest">✓ Link Ready</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end gap-4">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="px-8 py-3 rounded-xl font-black text-muted hover:bg-white transition-all border border-transparent hover:border-gray-200 text-xs uppercase tracking-widest"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdatePost}
                disabled={isUpdating}
                className="px-12 py-3 bg-brand-blue text-white font-black rounded-xl hover:bg-blue-700 transition-all shadow-[0_10px_20px_rgba(37,99,235,0.25)] disabled:opacity-50 text-xs uppercase tracking-[0.2em]"
              >
                {isUpdating ? "Processing..." : "Save Content"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
