"use client";

import { useEffect, useState } from "react";
import { Filter, Search, Grid } from "lucide-react";
import StoryCard from "@/components/StoryCard";
import { SkeletonCardGrid } from "@/components/Skeleton";
import { fetchApi } from "@/lib/api";

export default function StoriesListing() {
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    // Load categories
    fetchApi('/categories').then(res => setCategories(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    // Load posts based on active category
    const loadPosts = async () => {
      setIsLoading(true);
      try {
        let endpoint = `/posts?limit=12&page=${page}`;
        if (activeCategory) {
          endpoint += `&category=${activeCategory}`;
        }
        if (searchQuery) {
          endpoint = `/search?q=${searchQuery}`;
        }
        const res = await fetchApi(endpoint);
        setPosts(res.data);
      } catch (error) {
        console.error("Failed to fetch stories", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search slightly
    const timer = setTimeout(() => {
      loadPosts();
    }, 300);

    return () => clearTimeout(timer);
  }, [activeCategory, searchQuery, page]);

  return (
    <div style={{ background: 'var(--background)', color: 'var(--foreground)' }} className="flex-1 pb-20">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-black tracking-tight mb-2">Explore Stories</h1>
            <p className="text-muted flex items-center gap-2"><Grid className="w-4 h-4" /> Discover inspiring journeys from athletes worldwide.</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search athletes or sports..." 
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
                className="w-full pl-12 pr-4 py-3.5 border rounded-2xl focus:outline-none focus:ring-1 focus:ring-brand-blue outline-none"
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-10 overflow-x-auto pb-2 scrollbar-hide">
          <button 
            onClick={() => setActiveCategory(null)}
            className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${!activeCategory ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' : 'bg-[var(--surface)] border border-[var(--border)] text-muted hover:border-brand-blue'}`}
          >
            All Stories
          </button>
          {categories.map((cat) => (
            <button 
              key={cat.id} 
              onClick={() => setActiveCategory(cat.name)}
              className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeCategory === cat.name ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' : 'bg-[var(--surface)] border border-[var(--border)] text-muted hover:border-brand-blue'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {isLoading ? (
          <SkeletonCardGrid count={8} />
        ) : posts.length === 0 ? (
          <div style={{ background: 'var(--surface)', borderColor: 'var(--border)' }} className="text-center py-32 rounded-3xl border border-dashed">
             <div className="w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted" />
             </div>
             <h2 className="text-xl font-bold mb-1">No stories found</h2>
             <p className="text-muted text-sm">Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {posts.map((post, i) => (
                <StoryCard key={post.id} post={post} index={i} />
              ))}
            </div>

            {/* Pagination */}
            {!searchQuery && (
              <div className="flex justify-center items-center gap-6 mt-16">
                <button 
                  disabled={page === 1}
                  onClick={() => {
                    setPage(p => p - 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
                  className="px-6 py-3 rounded-xl border font-bold disabled:opacity-30 hover:bg-surface-hover transition-colors"
                >
                  Previous
                </button>
                <span className="font-bold text-xs uppercase tracking-widest text-muted">Page {page}</span>
                <button 
                  disabled={posts.length < 12}
                  onClick={() => {
                    setPage(p => p + 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-8 py-3 rounded-xl bg-brand-blue text-white font-bold disabled:opacity-30 hover:bg-blue-700 transition-all shadow-md active:scale-95"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
