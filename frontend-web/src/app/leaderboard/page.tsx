"use client";

import { useEffect, useState } from "react";
import { Trophy, TrendingUp, Users, Eye, Heart, BookOpen, Crown, Medal, ArrowUpRight, BarChart3, Star } from "lucide-react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { getImageUrl, UPLOAD_FOLDERS } from "@/lib/constants";

interface Athlete {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  tagline: string;
  storyCount: number;
  totalLikes: number;
  totalViews: number;
  score: number;
}

interface PlatformStats {
  totalViews: number;
  totalLikes: number;
  totalAthletes: number;
  topCategory: string;
  totalStories: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<Athlete[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetchApi('/users/leaderboard');
        const leaderboardData = res.data.leaderboard || [];
        setLeaderboard(leaderboardData);

        // Auto-calculate stats from the leaderboard objects (Reliable fallback)
        const calculatedStats: PlatformStats = {
          totalViews: leaderboardData.reduce((acc: number, curr: Athlete) => acc + (curr.totalViews || 0), 0),
          totalLikes: leaderboardData.reduce((acc: number, curr: Athlete) => acc + (curr.totalLikes || 0), 0),
          totalStories: leaderboardData.reduce((acc: number, curr: Athlete) => acc + (curr.storyCount || 0), 0),
          totalAthletes: leaderboardData.length,
          topCategory: res.data.stats?.topCategory || 'Wrestling'
        };

        // Use backend stats if available, otherwise use calculated ones
        setStats(res.data.stats?.totalViews > 0 ? res.data.stats : calculatedStats);
      } catch (err) {
        console.error("Leaderboard load failed", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="h-40 w-full skeleton rounded-3xl mb-12" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 skeleton rounded-3xl" />)}
        </div>
        <div className="space-y-4">
          {[...Array(10)].map((_, i) => <div key={i} className="h-20 skeleton rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20">
      {/* Header Section */}
      <div className="bg-zinc-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#1877F2,transparent)]" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-blue/20 text-brand-blue text-[10px] font-black uppercase tracking-widest mb-4">
                <Trophy className="w-4 h-4" /> Official NLA Rankings
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 uppercase">Top Athletes</h1>
              <p className="text-gray-400 text-lg max-w-xl font-medium">Ranking the best performers across NLA Sports based on engagement, views, and story impact.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] text-center min-w-[200px]">
                <div className="text-4xl font-black text-brand-yellow mb-1">#{stats?.totalAthletes || 0}</div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Athletes</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <div className="container mx-auto px-4 -mt-12 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            label="Total Platform Views" 
            value={stats?.totalViews.toLocaleString() || '0'} 
            icon={<Eye className="w-5 h-5 text-brand-blue" />} 
            color="blue"
          />
          <StatCard 
            label="Community Loves" 
            value={stats?.totalLikes.toLocaleString() || '0'} 
            icon={<Heart className="w-5 h-5 text-brand-red" />} 
            color="red"
          />
          <StatCard 
            label="Published Stories" 
            value={stats?.totalStories.toLocaleString() || '0'} 
            icon={<BookOpen className="w-5 h-5 text-green-500" />} 
            color="green"
          />
          <StatCard 
            label="Trending Category" 
            value={stats?.topCategory || 'N/A'} 
            icon={<TrendingUp className="w-5 h-5 text-brand-yellow" />} 
            color="yellow"
          />
        </div>

        {/* Leaderboard Grid */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3 uppercase">
              <Crown className="w-6 h-6 text-brand-yellow" /> Hall of Fame
            </h2>
            <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Updated Real-Time</div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* The Top 3 Podium */}
            <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {leaderboard.slice(0, 3).map((athlete, index) => (
                <div 
                  key={athlete.id} 
                  className={`relative p-8 rounded-[3rem] border shadow-xl transition-transform hover:scale-[1.02] bg-white overflow-hidden ${index === 0 ? 'border-brand-yellow ring-4 ring-brand-yellow/10' : 'border-gray-100'}`}
                >
                  {index === 0 && <div className="absolute top-6 right-8"><Crown className="w-10 h-10 text-brand-yellow" /></div>}
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-6">
                      <div className={`w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 ${index === 0 ? 'border-brand-yellow' : index === 1 ? 'border-gray-300' : 'border-amber-600'}`}>
                        {athlete.avatarUrl ? (
                          <img src={getImageUrl(athlete.avatarUrl, UPLOAD_FOLDERS.AVATARS) || ""} alt={athlete.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-brand-blue flex items-center justify-center text-white text-3xl font-black">{athlete.fullName.charAt(0)}</div>
                        )}
                      </div>
                      <div className={`absolute -bottom-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-lg ${index === 0 ? 'bg-brand-yellow' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'}`}>
                        {index + 1}
                      </div>
                    </div>
                    <h3 className="text-2xl font-black mb-1">{athlete.fullName}</h3>
                    <p className="text-[10px] font-black text-brand-blue uppercase tracking-widest mb-6">{athlete.tagline}</p>
                    
                    <div className="grid grid-cols-3 gap-4 w-full pt-6 border-t border-gray-100">
                      <div>
                        <div className="text-sm font-black">{athlete.totalViews}</div>
                        <div className="text-[8px] text-gray-400 font-black uppercase">Views</div>
                      </div>
                      <div>
                        <div className="text-sm font-black">{athlete.totalLikes}</div>
                        <div className="text-[8px] text-gray-400 font-black uppercase">Likes</div>
                      </div>
                      <div>
                        <div className="text-sm font-black">{athlete.score}</div>
                        <div className="text-[8px] text-gray-400 font-black uppercase">PTS</div>
                      </div>
                    </div>
                    <Link href={`/users/${athlete.id}`} className="mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-brand-blue transition-colors">
                      View Profile <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* List for the rest */}
            <div className="lg:col-span-12 space-y-4">
              {leaderboard.slice(3).map((athlete, index) => (
                <Link 
                  key={athlete.id} 
                  href={`/users/${athlete.id}`}
                  className="flex items-center gap-6 p-4 bg-white rounded-2xl border border-gray-100 hover:border-brand-blue transition-all group"
                >
                  <div className="w-8 text-center font-black text-gray-300 group-hover:text-brand-blue">#{index + 4}</div>
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                     {athlete.avatarUrl ? <img src={getImageUrl(athlete.avatarUrl, UPLOAD_FOLDERS.AVATARS) || ""} alt={athlete.fullName} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-brand-blue flex items-center justify-center text-white font-black text-xs">{athlete.fullName.charAt(0)}</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black truncate">{athlete.fullName}</h4>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest truncate">{athlete.tagline}</p>
                  </div>
                  <div className="hidden md:flex items-center gap-8 px-8 border-x border-gray-50">
                    <div className="text-center">
                      <div className="text-xs font-black">{athlete.totalViews}</div>
                      <div className="text-[8px] font-black text-gray-400 uppercase">Views</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-black">{athlete.totalLikes}</div>
                      <div className="text-[8px] font-black text-gray-400 uppercase">Likes</div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-2 rounded-xl text-brand-blue text-[10px] font-black">
                    {athlete.score} PTS
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string, value: string, icon: React.ReactNode, color: string }) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600'
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 flex flex-col gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <div className="text-3xl font-black tracking-tight">{value}</div>
        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</div>
      </div>
    </div>
  );
}
