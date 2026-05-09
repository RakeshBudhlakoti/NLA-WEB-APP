"use client";

import AdminLayout from "@/components/AdminLayout";
import { fetchApi } from "@/lib/api";
import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import { Eye, CheckCircle, Star, Heart, MessageSquare, Trash2 } from "lucide-react";
import confetti from "canvas-confetti";
import { getImageUrl, UPLOAD_FOLDERS } from "@/lib/constants";

interface Story {
  id: string;
  title: string;
  type: string;
  status: string;
  mediaUrl: string;
  isExclusive: boolean;
  isAdminPick: boolean;
  viewCount: number;
  updatedAt: string;
  author: {
    id: string;
    email: string;
    profile?: {
      fullName?: string;
    }
  };
  _count?: {
    likes: number;
    comments: number;
  };
}

type FilterStatus = "ALL" | "PENDING" | "APPROVED" | "REJECTED" | "TRASH";

function StoriesContent() {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStories, setSelectedStories] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [filter, setFilter] = useState<FilterStatus>("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({ ALL: 0, PENDING: 0, APPROVED: 0, REJECTED: 0, TRASH: 0 });
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const categoryIdFromUrl = searchParams.get("categoryId");

  // Handle search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (categoryIdFromUrl) setSelectedCategory(categoryIdFromUrl);
  }, [categoryIdFromUrl]);

  const loadStories = useCallback(async () => {
    setIsLoading(true);
    try {
      let endpoint = `/admin/posts?page=${page}&limit=10&status=${filter}`;

      if (userId) endpoint += `&userId=${userId}`;
      if (selectedCategory) endpoint += `&categoryId=${selectedCategory}`;
      if (debouncedSearch) endpoint += `&search=${encodeURIComponent(debouncedSearch)}`;

      const [storiesRes, catRes] = await Promise.all([
        fetchApi(endpoint),
        fetchApi("/categories")
      ]);

      if (storiesRes && storiesRes.data) {
        setStories(storiesRes.data.posts || []);
        setTotalPages(storiesRes.data.pagination?.totalPages || 1);
        setStatusCounts(storiesRes.data.statusCounts || { ALL: 0, PENDING: 0, APPROVED: 0, REJECTED: 0, TRASH: 0 });
      }
      if (catRes && catRes.data) {
        setCategories(catRes.data);
      }
    } catch (error: any) {
      console.error('Load stories error:', error);
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: error.message || 'Failed to load stories', showConfirmButton: false, timer: 3000 });
    } finally {
      setIsLoading(false);
    }
  }, [page, filter, userId, selectedCategory, debouncedSearch]);

  useEffect(() => {
    loadStories();
  }, [loadStories]);

  const deleteStory = async (id: string) => {
    const result = await Swal.fire({
      title: 'Move to Trash?',
      text: "You can restore it later from the Trash tab.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Move to Trash'
    });
    
    if (!result.isConfirmed) return;
    try {
      await fetchApi(`/admin/posts/${id}`, { method: "DELETE" });
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Moved to trash', showConfirmButton: false, timer: 3000 });
      loadStories();
    } catch (error: any) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: error.message || 'Failed to delete', showConfirmButton: false, timer: 3000 });
    }
  };

  const restoreStory = async (id: string) => {
    try {
      await fetchApi(`/admin/posts/${id}/restore`, { method: "PUT" });
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Restored successfully', showConfirmButton: false, timer: 3000 });
      loadStories();
    } catch (error: any) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: error.message || 'Failed to restore', showConfirmButton: false, timer: 3000 });
    }
  };

  const bulkAction = async (action: 'APPROVE' | 'DELETE') => {
    if (selectedStories.length === 0) return;
    
    const result = await Swal.fire({
      title: `Bulk ${action === 'APPROVE' ? 'Approve' : 'Delete'}?`,
      text: `Apply this action to ${selectedStories.length} stories?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Apply'
    });

    if (!result.isConfirmed) return;

    setIsBulkProcessing(true);
    try {
      await Promise.all(selectedStories.map(id => {
        if (action === 'APPROVE') return fetchApi(`/admin/posts/${id}/approve`, { method: 'PUT' });
        return fetchApi(`/admin/posts/${id}`, { method: 'DELETE' });
      }));
      
      if (action === 'APPROVE') {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }

      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Action applied', showConfirmButton: false, timer: 3000 });
      setSelectedStories([]);
      loadStories();
    } catch (error: any) {
      Swal.fire({ icon: 'error', title: error.message || 'Bulk action failed' });
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedStories.length === stories.length) setSelectedStories([]);
    else setSelectedStories(stories.map(s => s.id));
  };

  const toggleSelect = (id: string) => {
    setSelectedStories(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const getYouTubeId = (url?: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const [pendingBulkAction, setPendingBulkAction] = useState("");
  const [pendingCategory, setPendingCategory] = useState("");

  const handleApplyBulkAction = () => {
    if (!pendingBulkAction || selectedStories.length === 0) return;
    bulkAction(pendingBulkAction as any);
  };

  const handleApplyFilter = () => {
    setSelectedCategory(pendingCategory);
    setPage(1);
  };

  return (
    <div className="p-0">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-medium text-gray-800">Stories</h1>
        <Link 
          href="/stories/create" 
          className="px-3 py-1 text-sm border border-admin-teal text-admin-teal rounded hover:bg-admin-teal hover:text-white transition-colors font-medium"
        >
          Add New
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
        {/* Status Filter Links */}
        <div className="flex items-center text-[13px] text-gray-500 gap-0">
          {(["ALL", "PENDING", "APPROVED", "REJECTED", "TRASH"] as FilterStatus[]).map((s, idx) => (
            <div key={s} className="flex items-center">
              <button
                onClick={() => { setFilter(s); setPage(1); setSelectedStories([]); }}
                className={`relative py-1 group transition-all ${filter === s ? "text-admin-teal font-bold" : "hover:text-admin-teal"}`}
              >
                <span>{s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}</span>
                <span className={`ml-1 font-normal ${filter === s ? "text-admin-teal/70" : "text-gray-400 group-hover:text-admin-teal/70"}`}>
                  ({statusCounts[s] || 0})
                </span>
                
                {/* Hover/Active Underline */}
                <div className={`absolute bottom-0 left-0 h-0.5 bg-admin-teal transition-all duration-300 ${filter === s ? "w-full opacity-100" : "w-0 opacity-0 group-hover:w-full group-hover:opacity-100"}`}></div>
              </button>
              {idx < 4 && <span className="mx-3 text-gray-300 select-none">|</span>}
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2">
          <input 
            type="text" 
            placeholder="Search stories..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-admin-teal outline-none w-64 bg-gray-50"
          />
        </div>
      </div>

      {/* Bulk Actions & Category Filter Row */}
      <div className="flex items-center gap-2 mb-4 bg-white p-3 border border-gray-200 rounded shadow-sm">
        <select 
          className="px-3 py-1.5 border border-gray-300 rounded text-sm outline-none bg-white text-gray-700"
          value={pendingBulkAction}
          onChange={(e) => setPendingBulkAction(e.target.value)}
        >
          <option value="">Bulk actions</option>
          {filter === "PENDING" && <option value="APPROVE">Approve</option>}
          <option value="DELETE">Move to Trash</option>
        </select>
        <button 
          onClick={handleApplyBulkAction}
          className="px-4 py-1.5 border border-gray-300 rounded text-sm bg-white hover:bg-gray-50 text-gray-700 font-medium disabled:opacity-50"
          disabled={!pendingBulkAction || selectedStories.length === 0 || isBulkProcessing}
        >
          {isBulkProcessing ? "Applying..." : "Apply"}
        </button>

        <div className="h-6 w-px bg-gray-200 mx-2"></div>

        <select 
          className="px-3 py-1.5 border border-gray-300 rounded text-sm outline-none bg-white text-gray-700"
          value={pendingCategory}
          onChange={(e) => setPendingCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <button 
          onClick={handleApplyFilter}
          className="px-4 py-1.5 border border-gray-300 rounded text-sm bg-white hover:bg-gray-50 text-gray-700 font-medium"
        >
          Filter
        </button>
        
        <div className="ml-auto text-sm text-gray-500 font-medium">
          {stories.length} items
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-bold border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 w-10 border-r border-gray-100 text-center">
                  <input type="checkbox" checked={selectedStories.length > 0 && selectedStories.length === stories.length} onChange={toggleSelectAll} className="rounded border-gray-300" />
                </th>
                <th className="px-4 py-3 border-r border-gray-100 text-center">Image</th>
                <th className="px-6 py-3 border-r border-gray-100">Title</th>
                <th className="px-6 py-3 border-r border-gray-100 text-center">Engagement</th>
                <th className="px-6 py-3 border-r border-gray-100">Author</th>
                <th className="px-6 py-3 border-r border-gray-100 text-center">Status</th>
                <th className="px-6 py-3 border-r border-gray-100">Date</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400 italic font-medium">Loading stories...</td>
                </tr>
              ) : stories.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400 font-medium">No stories found.</td>
                </tr>
              ) : (
                stories.map((story) => {
                  const youtubeId = story.type === 'video' ? getYouTubeId(story.mediaUrl) : null;
                  const thumbUrl = youtubeId 
                    ? `https://img.youtube.com/vi/${youtubeId}/default.jpg`
                    : getImageUrl(story.mediaUrl, UPLOAD_FOLDERS.STORIES) || '/placeholder-image.png';

                  return (
                    <tr key={story.id} className="group hover:bg-blue-50/30 transition-colors border-b border-gray-50 last:border-0">
                      <td className="px-6 py-4 border-r border-gray-100 text-center">
                        <input type="checkbox" checked={selectedStories.includes(story.id)} onChange={() => toggleSelect(story.id)} className="rounded border-gray-300" />
                      </td>
                      <td className="px-4 py-4 border-r border-gray-100">
                        <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden border border-gray-200 mx-auto relative group-hover:border-admin-teal transition-colors">
                          <img 
                            src={thumbUrl} 
                            alt={story.title} 
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as any).src = '/placeholder-image.png' }}
                          />
                          {story.type === 'video' && (
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <Star className="w-4 h-4 fill-white text-white drop-shadow-md" />
                            </div>
                          )}
                        </div>
                      </td>
                    <td className="px-6 py-4 border-r border-gray-100">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <Link href={`/stories/${story.id}`} className="font-bold text-admin-teal hover:text-teal-700">
                            {story.title}
                          </Link>
                          <div className="flex gap-1">
                            {story.isAdminPick && (
                              <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-[9px] font-black uppercase rounded border border-yellow-200 tracking-tighter" title="Admin's Top 8 Pick">
                                Top Pick
                              </span>
                            )}
                            {story.isExclusive && (
                              <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[9px] font-black uppercase rounded border border-purple-200 tracking-tighter" title="Exclusive Content">
                                Exclusive
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mt-0.5">
                          {story.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 border-r border-gray-100">
                      <div className="flex items-center justify-center gap-4">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-red-500">
                          <Heart className="w-3.5 h-3.5 fill-red-500" /> {story._count?.likes || 0}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                          <MessageSquare className="w-3.5 h-3.5" /> {story._count?.comments || 0}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 border-r border-gray-100 text-gray-600 font-medium whitespace-nowrap">
                      <Link href={`/users/${story.author.id}`} className="hover:text-admin-teal hover:underline transition-colors">
                        {story.author?.profile?.fullName || story.author?.email}
                      </Link>
                    </td>
                    <td className="px-6 py-4 border-r border-gray-100 font-medium text-center">
                      {story.status === 'APPROVED' ? <span className="text-green-600">Published</span> : 
                       story.status === 'PENDING' ? <span className="text-yellow-600">Pending</span> : 
                       <span className="text-red-500">{story.status}</span>}
                    </td>
                    <td className="px-6 py-4 border-r border-gray-100 text-gray-500 font-medium leading-tight">
                      <div className="text-[11px] text-gray-400 uppercase font-bold mb-1">
                        {story.status === 'APPROVED' ? 'Published' : 'Last Modified'}
                      </div>
                      <span className="text-xs">{new Date(story.updatedAt).toLocaleDateString()}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/stories/${story.id}`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Review Story">
                          <Eye className="w-4 h-4" />
                        </Link>
                        {filter === "TRASH" ? (
                          <button onClick={() => restoreStory(story.id)} className="p-1.5 text-teal-600 hover:bg-teal-50 rounded transition-colors" title="Restore Story">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        ) : (
                          <button onClick={() => deleteStory(story.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors" title="Move to Trash">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-3 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-500 font-medium">
              Showing page {page} of {totalPages}
            </div>
            <div className="flex gap-1">
              <button 
                disabled={page === 1} 
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 border border-gray-300 rounded bg-white text-gray-600 text-xs font-bold hover:bg-gray-100 disabled:opacity-50"
              >
                &lsaquo; Prev
              </button>
              <button 
                disabled={page === totalPages} 
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 border border-gray-300 rounded bg-white text-gray-600 text-xs font-bold hover:bg-gray-100 disabled:opacity-50"
              >
                Next &rsaquo;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function StoriesPage() {
  return (
    <AdminLayout>
      <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading Stories Module...</div>}>
        <StoriesContent />
      </Suspense>
    </AdminLayout>
  );
}
