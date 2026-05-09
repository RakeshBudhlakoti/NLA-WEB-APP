"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Play, Trophy, Users, TrendingUp, ArrowRight, Star } from "lucide-react";
import StoryCard from "@/components/StoryCard";
import { SkeletonCardGrid } from "@/components/Skeleton";
import { fetchApi } from "@/lib/api";
import { getImageUrl, UPLOAD_FOLDERS } from "@/lib/constants";

export default function Home() {
  const router = useRouter();
  const [adminPicks, setAdminPicks] = useState<any[]>([]);
  const [exclusivePosts, setExclusivePosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [picksRes, exclusiveRes] = await Promise.all([
          fetchApi('/posts?limit=8&isAdminPick=true'),
          fetchApi('/posts?limit=3&isExclusive=true')
        ]);
        setAdminPicks(picksRes.data || []);
        setExclusivePosts(exclusiveRes.data || []);
      } catch (error) {
        console.error("Failed to load home data", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/stories?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with Parallax */}
      <div className="relative min-h-[70vh] lg:min-h-[90vh] flex flex-col justify-center border-b border-gray-100 overflow-hidden bg-white">
        <div 
          className="absolute inset-0 z-0 transition-transform duration-75 ease-out"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        >
          <img 
            src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2500&auto=format&fit=crop" 
            alt="Hero background" 
            className="w-full h-full object-cover opacity-10" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
        </div>
        
        <section className="container mx-auto px-4 relative z-20 py-16 lg:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-brand-blue bg-blue-50 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest">NICHE SPORTS PLATFORM</span>
            </div>
            
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter mb-8 leading-[0.8] text-gray-900 animate-in fade-in slide-in-from-bottom-8 duration-700">
              FUEL YOUR <br/>
              <span className="text-gradient-insta">PURSUIT</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-10 duration-1000">
              A centralized platform for the wrestling and athletics community to share journeys, celebrate success, and inspire the next generation.
            </p>
            
            {/* Global Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12 relative animate-in fade-in zoom-in-95 duration-700 delay-300">
              <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-brand-blue transition-colors" />
                <input 
                  type="text"
                  placeholder="Search Athlete, Sports, Stories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-16 pr-32 py-6 bg-white border-2 border-gray-100 rounded-[2rem] shadow-xl shadow-gray-100/50 focus:border-brand-blue focus:ring-0 outline-none transition-all text-gray-900 font-bold"
                />
                <button 
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-8 py-3.5 bg-brand-blue text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg"
                >
                  Search
                </button>
              </div>
            </form>
            
            <div className="flex flex-wrap justify-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
              <Link 
                href="/submit" 
                className="px-10 py-4 bg-brand-red text-white rounded-2xl font-black hover:bg-red-600 transition-all shadow-xl shadow-red-500/20 text-sm uppercase tracking-widest"
              >
                Submit Your Story
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
                exclusivePosts.map((video, i) => {
                  const adminVideo = {
                    ...video,
                    author: {
                      id: "admin",
                      profile: {
                        fullName: "NLA Administration",
                        avatarUrl: video.author?.profile?.avatarUrl || ""
                      }
                    }
                  };
                  return <StoryCard key={video.id} post={adminVideo} index={i} minimal={true} />;
                })
              )}
            </div>
          </section>

          {/* Admin's Top 8 Picks (Replaces Recent Stories) */}
          <section id="admin-picks" className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-4xl font-black mb-2 tracking-tighter uppercase">Admin's Top 8 Picks</h2>
                <div className="h-1.5 w-20 bg-brand-yellow rounded-full" />
              </div>
              <Link href="/stories" className="group flex items-center gap-2 text-brand-blue font-black text-xs uppercase tracking-widest hover:underline">
                Explore All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {isLoading ? (
              <SkeletonCardGrid count={8} />
            ) : adminPicks.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-[3rem] border border-dashed">
                <Star className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <p className="text-muted font-bold uppercase tracking-widest text-xs">No picks selected yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {adminPicks.map((post, i) => (
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
