"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, Medal, Crown, Star, Eye, Heart } from "lucide-react";
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

export default function AthleteLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<Athlete[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const res = await fetchApi('/users/leaderboard');
        setLeaderboard(res.data.leaderboard || []);
      } catch (err) {
        console.error("Leaderboard load failed", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadLeaderboard();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton h-20 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (leaderboard.length === 0) return null;

  return (
    <div className="space-y-4">
      {leaderboard.map((athlete, index) => (
        <Link 
          key={athlete.id} 
          href={`/users/${athlete.id}`}
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          className="flex items-center gap-4 p-4 rounded-2xl border transition-all hover:scale-[1.02] shadow-sm hover:shadow-md group"
        >
          {/* Rank Badge */}
          <div className="w-10 h-10 shrink-0 flex items-center justify-center font-black text-lg">
            {index === 0 ? <Crown className="w-6 h-6 text-brand-yellow fill-brand-yellow" /> :
             index === 1 ? <Medal className="w-6 h-6 text-gray-400" /> :
             index === 2 ? <Medal className="w-6 h-6 text-amber-600" /> :
             <span style={{ color: 'var(--muted)' }}>#{index + 1}</span>}
          </div>

          {/* Avatar */}
          <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-brand-blue/20">
            {athlete.avatarUrl ? (
              <img 
                src={getImageUrl(athlete.avatarUrl, UPLOAD_FOLDERS.AVATARS) || ""} 
                alt={athlete.fullName} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-brand-blue flex items-center justify-center text-white font-bold">
                {athlete.fullName.charAt(0)}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h4 style={{ color: 'var(--foreground)' }} className="font-bold truncate group-hover:text-brand-blue transition-colors">
              {athlete.fullName}
            </h4>
            <p className="text-[10px] text-muted truncate uppercase font-black tracking-widest">
              {athlete.tagline}
            </p>
          </div>

          {/* Stats */}
          <div className="hidden sm:flex items-center gap-4 px-4 text-xs font-bold" style={{ color: 'var(--muted)' }}>
            <div className="flex flex-col items-center">
              <span style={{ color: 'var(--foreground)' }}>{athlete.totalViews}</span>
              <Eye className="w-3 h-3" />
            </div>
            <div className="flex flex-col items-center">
              <span style={{ color: 'var(--foreground)' }}>{athlete.totalLikes}</span>
              <Heart className="w-3 h-3 text-brand-red" />
            </div>
            <div className="flex flex-col items-center">
              <span style={{ color: 'var(--foreground)' }}>{athlete.storyCount}</span>
              <Trophy className="w-3 h-3 text-brand-blue" />
            </div>
          </div>

          {/* Score Badge */}
          <div className="bg-brand-blue/10 px-3 py-1 rounded-full text-brand-blue text-[10px] font-black">
            {athlete.score} PTS
          </div>
        </Link>
      ))}
    </div>
  );
}
