"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, Edit, Trash2, ArrowLeft, Eye } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Swal from "sweetalert2";

export default function MyStories() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [stories, setStories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStories = async () => {
      try {
        const res = await fetchApi('/posts/my-posts');
        setStories(res.data);
      } catch (error) {
        console.error("Failed to load stories", error);
        Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Failed to load your stories.', showConfirmButton: false, timer: 3000 });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadStories();
    } else if (!isAuthLoading) {
      setIsLoading(false);
    }
  }, [user, isAuthLoading]);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You want to delete this story?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });
    
    if (!result.isConfirmed) return;
    
    try {
      await fetchApi(`/posts/${id}`, { method: 'DELETE' });
      setStories(stories.filter(s => s.id !== id));
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Story deleted', showConfirmButton: false, timer: 3000 });
    } catch (error) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Failed to delete story', showConfirmButton: false, timer: 3000 });
    }
  };

  const getStatusColor = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'approved': return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'pending': return 'bg-brand-yellow/20 text-brand-yellow border-brand-yellow/30';
      case 'draft': return 'bg-surface-hover text-muted border-gray-100';
      case 'rejected': return 'bg-red-500/20 text-red-500 border-red-500/30';
      default: return 'bg-surface-hover text-muted';
    }
  };

  const getYouTubeId = (url?: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-yellow"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 flex justify-center items-center h-screen bg-background flex-col gap-4">
        <h1 className="text-2xl font-bold">Please log in to view your stories.</h1>
        <Link href="/login" className="px-6 py-2 bg-brand-yellow text-black font-bold rounded-xl">Login</Link>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background text-gray-900 pb-20">
      <div className="container mx-auto px-4 mt-12 max-w-5xl">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="w-10 h-10 rounded-full bg-surface hover:bg-surface-hover flex items-center justify-center transition-colors border border-gray-100">
              <ArrowLeft className="w-5 h-5 text-gray-900" />
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">My Stories</h1>
              <p className="text-muted text-sm">Manage and track the status of your submissions.</p>
            </div>
          </div>
          <Link href="/submit" className="flex items-center gap-2 px-6 py-3 bg-brand-yellow text-black font-bold rounded-xl hover:bg-yellow-400 transition-colors w-fit">
            <PlusCircle className="w-5 h-5" /> Create New
          </Link>
        </div>

        {/* Stories List */}
        <div className="bg-surface border border-gray-100 rounded-3xl overflow-hidden">
          {/* Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 p-6 border-b border-gray-100 text-sm font-bold text-muted uppercase tracking-wider">
            <div className="col-span-5">Story Details</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1">Views</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {/* List */}
          <div className="divide-y divide-surface-hover">
            {stories.length === 0 ? (
              <div className="p-8 text-center text-muted font-bold">
                You haven't submitted any stories yet.
              </div>
            ) : (
              stories.map((story) => {
                const isVideo = story.type === 'video';
                const youtubeId = isVideo ? getYouTubeId(story.mediaUrl) : null;
                const thumb = isVideo ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : (story.mediaUrl || "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=200&auto=format&fit=crop");
                const date = new Date(story.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

                return (
                  <div key={story.id} className="p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center hover:bg-surface-hover/30 transition-colors">
                    
                    {/* Mobile Label: Story Details */}
                    <div className="col-span-5 flex items-start gap-4">
                      <div className="w-16 h-12 bg-surface-hover rounded-lg overflow-hidden shrink-0 hidden sm:block relative">
                        <img src={thumb} alt="Thumbnail" className="w-full h-full object-cover opacity-80" />
                        {isVideo && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <div className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center">
                              <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-black border-b-[4px] border-b-transparent ml-0.5"></div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg leading-tight mb-1">{story.title}</h3>
                        <span className="text-xs text-muted font-bold uppercase">{story.type}</span>
                      </div>
                    </div>

                    <div className="col-span-2 text-sm text-muted">
                      <span className="md:hidden font-bold mr-2">Date:</span>{date}
                    </div>

                    <div className="col-span-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border capitalize ${getStatusColor(story.status)}`}>
                        {story.status?.toLowerCase()}
                      </span>
                      {story.status === 'REJECTED' && (
                        <p className="text-xs text-red-400 mt-1">Check notifications for reason</p>
                      )}
                    </div>

                    <div className="col-span-1 text-sm font-bold">
                      <span className="md:hidden font-bold text-muted mr-2">Views:</span>{story.viewCount}
                    </div>

                    <div className="col-span-2 flex items-center justify-end gap-2">
                      <Link href={`/stories/${story.id}`} className="w-10 h-10 rounded-full bg-surface hover:bg-surface-hover border border-gray-100 flex items-center justify-center transition-colors text-gray-900" title="View Story">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link href={`/stories/${story.id}/edit`} className="w-10 h-10 rounded-full bg-surface hover:bg-surface-hover border border-gray-100 flex items-center justify-center transition-colors text-gray-900" title="Edit">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDelete(story.id)} className="w-10 h-10 rounded-full bg-surface hover:bg-surface-hover border border-gray-100 flex items-center justify-center transition-colors text-red-500" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
