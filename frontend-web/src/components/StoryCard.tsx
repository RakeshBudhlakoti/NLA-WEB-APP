"use client";

import { useState } from "react";
import Link from "next/link";
import { Play, Heart, MessageCircle, Star, Eye, Share2, Bookmark, BookmarkCheck } from "lucide-react";
import { getImageUrl, UPLOAD_FOLDERS } from "@/lib/constants";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Swal from "sweetalert2";

interface StoryCardProps {
  post: {
    id: string;
    title: string;
    content: string;
    mediaUrl?: string;
    type: string;
    viewCount: number;
    status: string;
    isExclusive?: boolean;
    rejectReason?: string;
    createdAt: string;
    _count?: {
      likes: number;
      comments: number;
    };
    author: {
      id: string;
      profile?: {
        fullName: string;
        avatarUrl?: string;
      };
    };
  };
  index: number;
  isBookmarked?: boolean;
  onBookmarkToggle?: (id: string, state: boolean) => void;
}

export default function StoryCard({ post, index, isBookmarked: initialBookmarked = false, onBookmarkToggle }: StoryCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const { user } = useAuth();
  const isVideo = post.type === 'video';
  
  const getYouTubeId = (url?: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const youtubeId = isVideo ? getYouTubeId(post.mediaUrl) : null;
  
  const stripHtml = (html: string) => {
    return html?.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ') || "";
  };
  
  const thumbnails = [
    "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=600&auto=format&fit=crop"
  ];

  let thumb = thumbnails[index % thumbnails.length];
  if (isVideo && youtubeId) {
    thumb = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
  } else if (post.mediaUrl) {
    thumb = getImageUrl(post.mediaUrl, UPLOAD_FOLDERS.POSTS) || thumbnails[index % thumbnails.length];
  }

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      Swal.fire({ title: "Login Required", text: "Please login to save stories.", icon: "info" });
      return;
    }

    try {
      const res = await fetchApi(`/bookmarks/${post.id}`, { method: 'POST' });
      setIsBookmarked(res.data.bookmarked);
      if (onBookmarkToggle) onBookmarkToggle(post.id, res.data.bookmarked);
    } catch (err: any) {
      console.error("Bookmark failed", err);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    const shareUrl = `${window.location.origin}/stories/${post.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: `Check out this athlete's story on NLA Sports!`,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share failed', err);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      Swal.fire({
        title: "Link Copied!",
        text: "Story link copied to clipboard.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    }
  };
  
  return (
    <div style={{ background: 'var(--surface)', borderColor: 'var(--border)' }} className="rounded-2xl overflow-hidden group flex flex-col h-full shadow-sm hover:shadow-md transition-all border relative">
      <Link href={`/stories/${post.id}`} className="relative h-48 w-full shrink-0 block overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 z-10"></div>
        <img src={thumb} alt="Story thumbnail" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        
        <div className="absolute top-3 right-3 z-20 flex gap-2">
          <button 
            onClick={handleBookmark}
            className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-brand-yellow hover:text-black transition-all"
          >
            {isBookmarked ? <BookmarkCheck className="w-4 h-4 fill-current" /> : <Bookmark className="w-4 h-4" />}
          </button>
          <button 
            onClick={handleShare}
            className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-brand-blue transition-all"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-brand-blue group-hover:text-white transition-colors shadow-sm pointer-events-auto">
              <Play className="w-5 h-5 fill-current ml-1 text-gray-900 group-hover:text-white" />
            </div>
          </div>
        )}

        {post.isExclusive && (
          <div className="absolute top-4 left-4 z-20 bg-brand-yellow px-2 py-1 rounded text-[10px] font-black uppercase flex items-center gap-1 text-black shadow-lg">
            <Star className="w-3 h-3 fill-black" /> Exclusive
          </div>
        )}
      </Link>
      
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-[10px] font-bold uppercase tracking-wider ${index % 3 === 0 ? 'text-[#DD2A7B]' : index % 2 === 0 ? 'text-brand-blue' : 'text-[#F58529]'}`}>
            {index % 3 === 0 ? 'MOTIVATIONAL' : index % 2 === 0 ? 'ATHLETE HUB' : 'PERSONAL'}
          </span>
          <div className="flex items-center gap-1 text-muted text-[10px] font-bold">
            <Eye className="w-3 h-3" /> {post.viewCount || 0}
          </div>
        </div>
        
        <Link href={`/stories/${post.id}`} style={{ color: 'var(--foreground)' }} className="block font-bold leading-tight mb-2 hover:text-brand-blue transition-colors text-lg">
          {post.title}
        </Link>

        {post.status === 'REJECTED' && (
          <div className="mb-3 p-2 bg-red-50 border border-red-100 rounded-lg">
            <p className="text-[10px] font-bold text-red-600 uppercase mb-1">Reason for rejection:</p>
            <p className="text-[11px] text-red-700 leading-tight">{post.rejectReason || "No reason provided."}</p>
          </div>
        )}

        {post.status === 'PENDING' && (
          <div className="mb-3 px-2 py-1 bg-yellow-100 border border-yellow-200 rounded text-[10px] font-bold text-yellow-700 w-fit">
            PENDING APPROVAL
          </div>
        )}
        
        <p className="text-muted text-xs line-clamp-2 mb-4 leading-relaxed flex-1">
          {stripHtml(post.content)}
        </p>
        
        <div style={{ borderColor: 'var(--border)' }} className="mt-auto flex items-center justify-between pt-4 border-t">
          <Link href={`/users/${post.author.id}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold overflow-hidden ${index % 3 === 0 ? 'bg-brand-blue' : index % 2 === 0 ? 'bg-brand-red' : 'bg-brand-yellow'}`}>
              {post.author.profile?.avatarUrl ? (
                <img src={getImageUrl(post.author.profile.avatarUrl, UPLOAD_FOLDERS.AVATARS) || ""} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                post.author.profile?.fullName.charAt(0) || "U"
              )}
            </div>
            <span style={{ color: 'var(--foreground)' }} className="text-xs font-bold">{post.author.profile?.fullName || 'Unknown Athlete'}</span>
          </Link>
          <div className="flex items-center gap-3 text-muted text-xs">
            <button className="flex items-center gap-1 hover:text-brand-red transition-colors font-bold">
              <Heart className="w-3.5 h-3.5" /> {post._count?.likes || 0}
            </button>
            <Link href={`/stories/${post.id}`} className="flex items-center gap-1 hover:text-brand-blue transition-colors font-bold">
              <MessageCircle className="w-3.5 h-3.5" /> {post._count?.comments || 0}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
