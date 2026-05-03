"use client";

import { useEffect, useState } from "react";
import { Bookmark, LayoutGrid, ArrowLeft } from "lucide-react";
import Link from "next/link";
import StoryCard from "@/components/StoryCard";
import { SkeletonCardGrid } from "@/components/Skeleton";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    const loadBookmarks = async () => {
      try {
        const res = await fetchApi('/bookmarks');
        setBookmarks(res.data.bookmarks || []);
      } catch (err) {
        console.error("Failed to load bookmarks", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) loadBookmarks();
  }, [user, status, router]);

  const handleBookmarkToggle = (id: string, state: boolean) => {
    if (!state) {
      setBookmarks(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
              className="w-10 h-10 rounded-full flex items-center justify-center border hover:bg-surface-hover transition-all"
            >
              <ArrowLeft className="w-5 h-5" style={{ color: 'var(--foreground)' }} />
            </Link>
            <div>
              <h1 style={{ color: 'var(--foreground)' }} className="text-4xl font-black tracking-tight">Saved Stories</h1>
              <p className="text-muted text-sm flex items-center gap-2 mt-1">
                <Bookmark className="w-4 h-4" /> Your personal collection of inspiration.
              </p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2 bg-brand-blue/10 px-4 py-2 rounded-xl text-brand-blue font-bold text-sm">
            <LayoutGrid className="w-4 h-4" /> {bookmarks.length} {bookmarks.length === 1 ? 'Story' : 'Stories'}
          </div>
        </div>

        {isLoading ? (
          <SkeletonCardGrid count={4} />
        ) : bookmarks.length === 0 ? (
          <div style={{ background: 'var(--surface)', borderColor: 'var(--border)' }} className="text-center py-32 rounded-3xl border border-dashed">
            <div className="w-20 h-20 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bookmark className="w-10 h-10 text-brand-blue opacity-50" />
            </div>
            <h2 style={{ color: 'var(--foreground)' }} className="text-2xl font-bold mb-2">No saved stories yet</h2>
            <p className="text-muted mb-8 max-w-xs mx-auto">Explore stories and click the bookmark icon to save them here for later.</p>
            <Link href="/stories" className="bg-brand-blue text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors inline-block">
              Start Exploring
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bookmarks.map((post, i) => (
              <StoryCard 
                key={post.id} 
                post={post} 
                index={i} 
                isBookmarked={true} 
                onBookmarkToggle={handleBookmarkToggle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
