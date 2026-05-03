"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Play, Trophy, Users, TrendingUp, ArrowRight } from "lucide-react";
import StoryCard from "@/components/StoryCard";
import { SkeletonCardGrid } from "@/components/Skeleton";
import { fetchApi } from "@/lib/api";
import { getImageUrl, UPLOAD_FOLDERS } from "@/lib/constants";

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [exclusivePosts, setExclusivePosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const [recentRes, exclusiveRes] = await Promise.all([
          fetchApi('/posts?limit=8'),
          fetchApi('/posts?limit=3&isExclusive=true')
        ]);
        setPosts(recentRes.data || []);
        setExclusivePosts(exclusiveRes.data || []);
      } catch (error) {
        console.error("Failed to load posts", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPosts();
  }, []);

  const getYouTubeId = (url?: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const stripHtml = (html: string) => {
    return html?.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ') || "";
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="relative min-h-[50vh] lg:min-h-[75vh] flex flex-col justify-center border-b border-gray-100 overflow-hidden bg-white">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2500&auto=format&fit=crop" alt="Hero background" className="w-full h-full object-cover opacity-10 scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
        </div>
        
        <section className="container mx-auto px-4 relative z-20 py-16 lg:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-brand-blue bg-blue-50 mb-8">
              <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest">GLOBAL ATHLETE HUB</span>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.8] text-gray-900">
              FUEL YOUR <br/>
              <span className="text-gradient-insta">PURSUIT</span>
            </h1>
            
            <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
              A centralized platform for the wrestling and athletics community to share journeys, celebrate success, and inspire the next generation.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6">
              <Link 
                href="/stories" 
                className="px-10 py-4 bg-brand-red text-white rounded-2xl font-black hover:bg-red-600 transition-all shadow-xl shadow-red-500/20 text-sm uppercase tracking-widest"
              >
                Explore Stories
              </Link>
              <Link 
                href="/leaderboard" 
                className="px-10 py-4 bg-white text-gray-900 border-2 border-gray-100 rounded-2xl font-black hover:bg-gray-50 transition-all text-sm uppercase tracking-widest flex items-center gap-2"
              >
                Top Athletes <Trophy className="w-4 h-4 text-brand-yellow" />
              </Link>
            </div>
          </div>
        </section>
      </div>

      <div className="container mx-auto px-4 py-20">
        {/* Main Content */}
        <div className="space-y-24">
          
          {/* Exclusive Videos */}
          <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-4xl font-black mb-2 tracking-tighter uppercase">NLA Exclusives</h2>
                <div className="h-1.5 w-20 bg-brand-red rounded-full" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="skeleton h-64 w-full rounded-3xl" />
                ))
              ) : exclusivePosts.length === 0 ? (
                <div className="col-span-3 text-center py-10 text-muted italic">No exclusive content yet.</div>
              ) : (
                exclusivePosts.map((video) => {
                  const ytId = getYouTubeId(video.mediaUrl);
                  const thumb = ytId 
                    ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` 
                    : (getImageUrl(video.mediaUrl, UPLOAD_FOLDERS.POSTS) || "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600&auto=format&fit=crop");

                  return (
                    <div key={video.id} className="bg-white border border-gray-100 rounded-3xl overflow-hidden group transition-all hover:shadow-2xl h-full flex flex-col">
                      <Link href={`/stories/${video.id}`} className="block relative h-52 w-full shrink-0 overflow-hidden bg-gray-100">
                        <img src={thumb} alt={video.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                          <div className="w-14 h-14 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg group-hover:bg-brand-red group-hover:text-white transition-all">
                            <Play className="w-6 h-6 fill-current ml-1" />
                          </div>
                        </div>
                      </Link>
                      <div className="p-8">
                        <h3 className="text-2xl font-black leading-tight mb-3 group-hover:text-brand-red transition-colors">
                          {video.title}
                        </h3>
                        <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
                          {stripHtml(video.content)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Inspiring Stories */}
          <section id="stories" className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-4xl font-black mb-2 tracking-tighter uppercase">Recent Stories</h2>
                <div className="h-1.5 w-20 bg-brand-blue rounded-full" />
              </div>
              <Link href="/stories" className="group flex items-center gap-2 text-brand-blue font-black text-xs uppercase tracking-widest hover:underline">
                Explore All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {isLoading ? (
              <SkeletonCardGrid count={8} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {posts.map((post, i) => (
                  <StoryCard key={post.id} post={post} index={i} />
                ))}
              </div>
            )}
          </section>

          {/* Newsletter / CTA */}
          <section className="bg-zinc-900 rounded-[3rem] p-12 md:p-20 text-white text-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-1000">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/20 blur-[100px] rounded-full -mr-32 -mt-32"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter">SHARE YOUR STORY</h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10">Join thousands of athletes who are using NLA to document their journey and get noticed by recruiters.</p>
              <Link href="/submit" className="inline-block bg-brand-yellow text-black font-black px-10 py-4 rounded-2xl text-sm uppercase tracking-widest hover:scale-105 transition-transform shadow-xl shadow-yellow-500/20">
                Get Started Now
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
