"use client";

import { useState, use, useEffect, useRef } from "react";
import Link from "next/link";
import { Play, Heart, MessageCircle, Share2, Bookmark, BookmarkCheck, X, Star, Eye, MessageSquare, BarChart3, TrendingUp, CheckCircle, MoreHorizontal, Edit3 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Swal from "sweetalert2";
import { getImageUrl, UPLOAD_FOLDERS } from "@/lib/constants";

export default function StoryDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLiked, setHasLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const viewCounted = useRef<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [postRes, commentsRes] = await Promise.all([
          fetchApi(`/posts/${id}`),
          fetchApi(`/comments?postId=${id}`)
        ]);
        setPost(postRes.data);
        setComments(commentsRes.data);

        if (viewCounted.current !== id) {
          fetchApi(`/posts/${id}/view`, { method: 'POST' }).catch(() => { });
          viewCounted.current = id;
        }

        if (user) {
          const [likeRes, bookmarkRes] = await Promise.all([
            fetchApi(`/likes/check/${id}`),
            fetchApi(`/bookmarks/ids`)
          ]);
          setHasLiked(likeRes.data?.hasLiked || false);
          setIsBookmarked(bookmarkRes.data?.ids?.includes(id) || false);
        }
      } catch (error) {
        console.error("Failed to load post data", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id, user]);

  const handleLike = async () => {
    if (!user) return Swal.fire({ toast: true, position: 'top-end', icon: 'warning', title: 'Please log in to like.', showConfirmButton: false, timer: 3000 });
    try {
      if (hasLiked) {
        await fetchApi(`/likes/${id}`, { method: 'DELETE' });
        setPost({ ...post, _count: { ...post._count, likes: Math.max(0, (post._count?.likes || 0) - 1) } });
        setHasLiked(false);
      } else {
        await fetchApi(`/likes/${id}`, { method: 'POST' });
        setPost({ ...post, _count: { ...post._count, likes: (post._count?.likes || 0) + 1 } });
        setHasLiked(true);
      }
    } catch (error: any) {
      console.error("Failed to toggle like", error);
    }
  };

  const handleBookmark = async () => {
    if (!user) return Swal.fire({ toast: true, position: 'top-end', icon: 'warning', title: 'Please log in to save.', showConfirmButton: false, timer: 3000 });
    try {
      const res = await fetchApi(`/bookmarks/${id}`, { method: 'POST' });
      setIsBookmarked(res.data.bookmarked);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: res.data.bookmarked ? 'Saved to bookmarks' : 'Removed from bookmarks',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error("Failed to toggle bookmark", error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!newComment.trim()) return;

    try {
      const res = await fetchApi(`/comments`, {
        method: 'POST',
        body: JSON.stringify({ postId: id, content: newComment })
      });
      setComments([res.data, ...comments]);
      setNewComment("");
    } catch (error) {
      console.error("Failed to post comment", error);
    }
  };

  const shareSocial = (platform: string) => {
    const url = window.location.href;
    const text = `Check out this athlete's story on NLA: ${post.title}`;
    let shareUrl = "";

    switch (platform) {
      case 'twitter': shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`; break;
      case 'whatsapp': shareUrl = `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`; break;
      case 'linkedin': shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`; break;
    }
    if (shareUrl) window.open(shareUrl, '_blank');
  };

  if (isLoading) return (
    <div className="flex-1 flex justify-center items-center h-screen bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-yellow"></div>
    </div>
  );

  if (!post) return (
    <div className="flex-1 flex justify-center items-center h-screen bg-white">
      <h1 className="text-2xl font-bold text-gray-900">Story not found.</h1>
    </div>
  );

  const isVideo = post.type === 'video';
  const getYouTubeId = (url?: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const youtubeId = isVideo ? getYouTubeId(post.mediaUrl) : null;
  const currentMediaUrl = getImageUrl(post.mediaUrl, UPLOAD_FOLDERS.POSTS);

  return (
    <div className="flex-1 bg-white pb-32">
      {/* Video Modal */}
      {isPlaying && isVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 animate-in fade-in duration-300">
          <button
            onClick={() => setIsPlaying(false)}
            className="absolute top-8 right-8 w-12 h-12 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center transition-all z-[110]"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <div className="w-full max-w-6xl aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl relative border border-white/10">
            <iframe src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`} title="Video" frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen className="absolute inset-0 w-full h-full"></iframe>
          </div>
        </div>
      )}

      {/* Editorial Hero */}
      <div className="w-full h-[70vh] relative overflow-hidden group">
        <img src={isVideo && youtubeId ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : (currentMediaUrl || "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=2000&auto=format&fit=crop")} alt="Hero" className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-[2s]" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent"></div>

        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <button 
              onClick={() => setIsPlaying(true)} 
              className="w-24 h-24 bg-brand-yellow rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-[0_0_50px_rgba(255,221,0,0.4)] pointer-events-auto"
            >
              <Play className="w-10 h-10 fill-black text-black ml-1" />
            </button>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 container mx-auto z-10">
          <div className="max-w-5xl">
            <div className="flex items-center gap-4 mb-6">
              {post.category && <span className="px-4 py-1.5 bg-black text-white text-[10px] font-black rounded-full uppercase tracking-widest">{post.category.name}</span>}
              {post.isExclusive && <span className="px-4 py-1.5 bg-brand-red text-white text-[10px] font-black rounded-full uppercase tracking-widest flex items-center gap-1 shadow-lg shadow-brand-red/20"><Star className="w-3.5 h-3.5 fill-white" /> Exclusive Story</span>}
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-10 leading-[0.8] text-gray-900">{post.title}</h1>

            <div className="flex items-center justify-between flex-wrap gap-8">
              <Link href={`/users/${post.author.id}`} className="flex items-center gap-4 group">
                <div className="w-16 h-16 rounded-2xl border-2 border-white overflow-hidden shrink-0 shadow-2xl group-hover:scale-105 transition-transform duration-300">
                  {post.author.profile?.avatarUrl ? <img src={getImageUrl(post.author.profile.avatarUrl, UPLOAD_FOLDERS.AVATARS) || ""} alt="Avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-brand-blue flex items-center justify-center text-white font-bold">{post.author.profile?.fullName?.charAt(0)}</div>}
                </div>
                <div>
                  <div className="font-black text-2xl text-gray-900">{post.author.profile?.fullName}</div>
                  <div className="text-[10px] text-brand-blue font-black uppercase tracking-[0.4em]">Elite NLA Athlete</div>
                </div>
              </Link>

              <div className="flex items-center gap-4">
                {user?.id === post.authorId && (
                  <Link 
                    href="/dashboard"
                    className="flex items-center gap-2 px-6 py-4 bg-gray-900 text-white font-black rounded-full hover:bg-black transition-all shadow-xl text-xs uppercase tracking-widest mr-2"
                  >
                    <Edit3 className="w-4 h-4" /> Edit Story
                  </Link>
                )}
                <button
                  onClick={handleBookmark}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-xl ${isBookmarked ? 'bg-brand-yellow text-black' : 'bg-white text-gray-400 hover:text-gray-900 border border-gray-100'}`}
                >
                  {isBookmarked ? <BookmarkCheck className="w-7 h-7 fill-current" /> : <Bookmark className="w-7 h-7" />}
                </button>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: post.title, url: window.location.href });
                    } else {
                      shareSocial('twitter');
                    }
                  }}
                  className="w-14 h-14 rounded-full flex items-center justify-center bg-white text-gray-400 hover:text-gray-900 border border-gray-100 transition-all shadow-xl"
                >
                  <Share2 className="w-7 h-7" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-8 mt-16 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

          <div className="lg:col-span-8 space-y-20">
            {/* Massive Lead Text (Description) */}
            {post.description && (
              <div className="relative">
                <div
                  className="text-xl md:text-xl text-gray-900 leading-[1.2] tracking-tight quill-content break-words mb-16"
                  dangerouslySetInnerHTML={{ __html: post.description }}
                />
              </div>
            )}

            <div className="space-y-24">
              {post.challenge && (
                <section>
                  <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight mb-8">
                    THE CHALLENGE
                  </h2>
                  <div className="text-xl text-gray-800 leading-relaxed font-medium quill-content" dangerouslySetInnerHTML={{ __html: post.challenge }} />
                </section>
              )}

              {post.motivation && (
                <section>
                  <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight mb-8">
                    THE MOTIVATION
                  </h2>
                  <div className="text-xl text-gray-800 leading-relaxed font-medium quill-content" dangerouslySetInnerHTML={{ __html: post.motivation }} />
                </section>
              )}

              {post.achievement && (
                <section>
                  <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight mb-8">
                    THE ACHIEVEMENT
                  </h2>
                  <div className="text-xl text-gray-800 leading-relaxed font-medium quill-content" dangerouslySetInnerHTML={{ __html: post.achievement }} />
                </section>
              )}

              {!post.challenge && !post.motivation && !post.achievement && (
                <section>
                  <div className="text-xl text-gray-800 leading-relaxed font-medium quill-content" dangerouslySetInnerHTML={{ __html: post.content }} />
                </section>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-12">
            {/* Clean Engagement Card */}
            <div className="bg-gray-50/50 rounded-[2.5rem] p-10 border border-gray-100">
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] mb-10 text-gray-900">Engagement</h3>

              <div className="grid grid-cols-2 gap-8 mb-12">
                <div className="flex flex-col items-center gap-3">
                  <button onClick={handleLike} className={`w-16 h-16 rounded-full flex items-center justify-center transition-all border ${hasLiked ? 'bg-brand-red border-brand-red text-white shadow-xl shadow-brand-red/20' : 'bg-white border-gray-100 text-gray-400 hover:text-brand-red'}`}>
                    <Heart className={`w-7 h-7 ${hasLiked ? 'fill-current' : ''}`} />
                  </button>
                  <span className="text-lg font-black text-gray-900">{(post._count?.likes || 0).toLocaleString()}</span>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400">
                    <MessageCircle className="w-7 h-7" />
                  </div>
                  <span className="text-lg font-black text-gray-900">{comments.length}</span>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-yellow mb-4">Top Comments</h4>
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">Be the first to share your thoughts.</p>
                  ) : comments.slice(0, 3).map(c => (
                    <div key={c.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm transition-all hover:translate-x-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-7 h-7 rounded-full bg-brand-blue flex items-center justify-center text-[8px] text-white font-bold overflow-hidden">
                          {c.user?.profile?.avatarUrl ? <img src={getImageUrl(c.user.profile.avatarUrl, UPLOAD_FOLDERS.AVATARS) || ""} alt="Avatar" className="w-full h-full object-cover" /> : c.user?.profile?.fullName?.charAt(0)}
                        </div>
                        <span className="text-[11px] font-black text-gray-900 uppercase">{c.user?.profile?.fullName}</span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed font-medium">"{c.content}"</p>
                    </div>
                  ))}
                </div>
              </div>

              {user ? (
                <form onSubmit={handleComment} className="mt-8 relative">
                  <input
                    type="text"
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Join the conversation..."
                    className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 text-xs font-bold focus:ring-2 ring-brand-blue/10 outline-none transition-all pr-12 shadow-sm"
                  />
                  <button type="submit" disabled={!newComment.trim()} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-blue p-2 disabled:opacity-30">
                    <CheckCircle className="w-5 h-5" />
                  </button>
                </form>
              ) : (
                <Link href="/login" className="block w-full mt-8 py-4 bg-gray-900 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] text-center hover:bg-black transition-all">Log in to comment</Link>
              )}
            </div>

            {/* Premium Insights (Light Theme) */}
            <div className="bg-gray-50/50 rounded-[2.5rem] p-10 border border-gray-100 overflow-hidden relative group">
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] mb-10 flex items-center gap-3 text-gray-900">
                <BarChart3 className="w-5 h-5 text-brand-blue" /> Performance
              </h3>
              
              <div className="grid grid-cols-2 gap-6 mb-12">
                <div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Impact</div>
                  <div className="text-4xl font-black text-gray-900 tracking-tighter">{(post.viewCount + (post._count?.likes || 0) * 10).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Engagement</div>
                  <div className="text-4xl font-black text-brand-blue tracking-tighter">{post.viewCount > 0 ? ((post._count?.likes / post.viewCount) * 100).toFixed(1) : 0}%</div>
                </div>
              </div>

              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { views: Math.floor(post.viewCount * 0.1) },
                    { views: Math.floor(post.viewCount * 0.4) },
                    { views: Math.floor(post.viewCount * 0.3) },
                    { views: Math.floor(post.viewCount * 0.7) },
                    { views: Math.floor(post.viewCount * 0.6) },
                    { views: post.viewCount },
                  ]}>
                    <defs>
                      <linearGradient id="chartGradientLight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1877F2" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#1877F2" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="views" stroke="#1877F2" strokeWidth={3} fill="url(#chartGradientLight)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-2 mt-6 text-[9px] font-black uppercase tracking-widest text-gray-400">
                <TrendingUp className="w-4 h-4 text-green-500" /> Story velocity is trending up
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
