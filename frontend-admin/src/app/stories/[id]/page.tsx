"use client";

import AdminLayout from "@/components/AdminLayout";
import { fetchApi, uploadFile } from "@/lib/api";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getImageUrl, UPLOAD_FOLDERS } from "@/lib/constants";
import confetti from "canvas-confetti";
import "react-quill-new/dist/quill.snow.css";

import { 
  ChevronLeft, 
  CheckCircle, 
  XCircle, 
  Star, 
  Save, 
  Upload, 
  Heart, 
  MessageSquare,
  Layers,
  Info,
  Video,
  Image as ImageIcon,
  Edit2,
  X,
  User as UserIcon,
  Clock
} from "lucide-react";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function StoryReviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [story, setStory] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [editForm, setEditForm] = useState({ 
    title: "", 
    description: "",
    content: "", 
    challenge: "", 
    motivation: "", 
    achievement: "", 
    categoryId: "", 
    mediaUrl: "",
    isExclusive: false,
    type: "image",
    status: "PENDING"
  });

  useEffect(() => {
    loadStory();
  }, [id]);

  const loadStory = async () => {
    try {
      const [storyRes, catRes] = await Promise.all([
        fetchApi(`/posts/${id}`),
        fetchApi("/categories")
      ]);
      setStory(storyRes.data);
      setCategories(catRes.data);
      setEditForm({ 
        title: storyRes.data.title, 
        description: storyRes.data.description || "",
        content: storyRes.data.content || "",
        challenge: storyRes.data.challenge || "",
        motivation: storyRes.data.motivation || "",
        achievement: storyRes.data.achievement || "",
        categoryId: storyRes.data.categoryId || "",
        mediaUrl: storyRes.data.mediaUrl || "",
        isExclusive: storyRes.data.isExclusive || false,
        type: storyRes.data.type || "image",
        status: storyRes.data.status || "PENDING"
      });
    } catch (error) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Failed to load story details', showConfirmButton: false, timer: 3000 });
      router.push("/stories");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const filename = await uploadFile(file, UPLOAD_FOLDERS.STORIES);
      setEditForm(prev => ({ ...prev, mediaUrl: filename }));
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Media uploaded successfully', showConfirmButton: false, timer: 3000 });
    } catch (err: any) {
      Swal.fire({ title: 'Upload Failed', text: err.message, icon: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const approveStory = async () => {
    try {
      await fetchApi(`/admin/posts/${id}/approve`, { method: "PUT" });
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#1ABB9C', '#FFD700', '#2A3F54']
      });
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Story approved successfully', showConfirmButton: false, timer: 3000 });
      loadStory();
    } catch (error) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Failed to approve story', showConfirmButton: false, timer: 3000 });
    }
  };

  const saveEdits = async () => {
    setIsSaving(true);
    try {
      await fetchApi(`/posts/${id}`, {
        method: "PUT",
        body: JSON.stringify(editForm)
      });
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Story updated successfully', showConfirmButton: false, timer: 3000 });
      loadStory();
      setIsEditing(false);
    } catch (error) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Failed to update story', showConfirmButton: false, timer: 3000 });
    } finally {
      setIsSaving(false);
    }
  };

  const rejectStory = async () => {
    if (!rejectReason.trim()) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'warning', title: 'Please provide a reason for rejection', showConfirmButton: false, timer: 3000 });
      return;
    }
    try {
      await fetchApi(`/admin/posts/${id}/reject`, { 
        method: "PUT",
        body: JSON.stringify({ rejectReason })
      });
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Story rejected', showConfirmButton: false, timer: 3000 });
      setShowRejectModal(false);
      router.push("/stories");
    } catch (error) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Failed to reject story', showConfirmButton: false, timer: 3000 });
    }
  };

  if (isLoading) return (
    <AdminLayout>
      <div className="flex justify-center items-center h-64">
        <span className="w-8 h-8 border-4 border-admin-teal/30 border-t-admin-teal rounded-full animate-spin"></span>
      </div>
    </AdminLayout>
  );

  if (!story) return null;

  return (
    <AdminLayout>
      <style jsx global>{`
        .quill-editor-container .ql-editor {
          min-height: 200px;
          font-size: 14px;
          line-height: 1.6;
        }
        .quill-editor-container .ql-toolbar.ql-snow {
          border-top-left-radius: 4px;
          border-top-right-radius: 4px;
          border-color: #d1d5db;
          background: #f9fafb;
        }
        .quill-editor-container .ql-container.ql-snow {
          border-bottom-left-radius: 4px;
          border-bottom-right-radius: 4px;
          border-color: #d1d5db;
        }
        .view-mode .ql-toolbar { display: none; }
        .view-mode .ql-container { border: none !important; }
        .view-mode .ql-editor { padding: 0; min-height: unset; }
      `}</style>

      <div className="mb-8">
        <Link 
          href="/stories" 
          className="flex items-center gap-2 text-admin-teal hover:underline text-sm font-medium mb-4 w-fit"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Stories
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
               {isEditing ? "Edit Story" : "Story Details"}
            </h1>
            <p className="text-gray-500 mt-1">
               {isEditing ? "Update story content and settings." : "Review and manage this athlete's journey."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 rounded border border-gray-200 font-bold text-gray-500 hover:bg-gray-50 transition-all"
                >
                  Discard
                </button>
                <button 
                  onClick={saveEdits}
                  disabled={isSaving}
                  className="px-8 py-2.5 bg-admin-teal text-white rounded font-bold shadow-md hover:shadow-admin-teal/20 transition-all flex items-center gap-2"
                >
                  {isSaving ? "Saving..." : <><Save className="w-4 h-4" /> Save Changes</>}
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2.5 rounded border border-admin-teal text-admin-teal font-bold hover:bg-admin-teal hover:text-white transition-all flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" /> Edit Story
                </button>
                {story.status === 'PENDING' && (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setShowRejectModal(true)}
                      className="px-5 py-2.5 rounded bg-red-50 text-red-600 font-bold hover:bg-red-600 hover:text-white transition-all flex items-center gap-2 border border-red-100"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                    <button 
                      onClick={approveStory}
                      className="px-5 py-2.5 rounded bg-admin-teal text-white font-bold shadow-md hover:shadow-admin-teal/20 transition-all flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Content Card */}
          <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
              <Layers className="w-5 h-5 text-admin-teal" />
              <h2 className="text-lg font-bold text-gray-800">Story Content</h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Story Title</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded border transition-all text-sm font-bold ${isEditing ? 'border-gray-300 focus:ring-1 focus:ring-admin-teal' : 'border-transparent bg-transparent text-xl p-0 font-black'}`}
                  value={editForm.title}
                  onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Short Description / Hook</label>
                <div className={`quill-editor-container ${!isEditing ? 'view-mode' : ''}`}>
                  <ReactQuill
                    theme={isEditing ? "snow" : "bubble"}
                    readOnly={!isEditing}
                    value={editForm.description}
                    onChange={val => {
                      if (val !== editForm.description) {
                        setEditForm(prev => ({ ...prev, description: val }));
                      }
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Narrative</label>
                <div className={`quill-editor-container ${!isEditing ? 'view-mode' : ''}`}>
                  <ReactQuill
                    theme={isEditing ? "snow" : "bubble"}
                    readOnly={!isEditing}
                    value={editForm.content}
                    onChange={val => {
                      if (val !== editForm.content) {
                        setEditForm(prev => ({ ...prev, content: val }));
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Editorial Highlights Card */}
          <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
              <Star className="w-5 h-5 text-admin-teal" />
              <h2 className="text-lg font-bold text-gray-800">Editorial Highlights</h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-black text-gray-400 mb-2 uppercase tracking-widest">The Challenge</label>
                  <div className={`quill-editor-container ${!isEditing ? 'view-mode' : ''}`}>
                    <ReactQuill
                      theme={isEditing ? "snow" : "bubble"}
                      readOnly={!isEditing}
                      value={editForm.challenge}
                      onChange={val => {
                        if (val !== editForm.challenge) {
                          setEditForm(prev => ({ ...prev, challenge: val }));
                        }
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-gray-400 mb-2 uppercase tracking-widest">The Motivation</label>
                  <div className={`quill-editor-container ${!isEditing ? 'view-mode' : ''}`}>
                    <ReactQuill
                      theme={isEditing ? "snow" : "bubble"}
                      readOnly={!isEditing}
                      value={editForm.motivation}
                      onChange={val => {
                        if (val !== editForm.motivation) {
                          setEditForm(prev => ({ ...prev, motivation: val }));
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-black text-gray-400 mb-2 uppercase tracking-widest">The Achievement</label>
                <div className={`quill-editor-container ${!isEditing ? 'view-mode' : ''}`}>
                  <ReactQuill
                    theme={isEditing ? "snow" : "bubble"}
                    readOnly={!isEditing}
                    value={editForm.achievement}
                    onChange={val => {
                      if (val !== editForm.achievement) {
                        setEditForm(prev => ({ ...prev, achievement: val }));
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Community & Feedback Section (Only in View Mode) */}
          {!isEditing && (
            <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-2">
                   <MessageSquare className="w-5 h-5 text-admin-teal" />
                   <h2 className="text-lg font-bold text-gray-800">Community Feedback</h2>
                </div>
                <div className="flex items-center gap-1.5 text-red-500 bg-red-50 px-3 py-1 rounded-full text-xs font-black">
                   <Heart className="w-4 h-4 fill-red-500" />
                   {story._count?.likes || 0} LIKES
                </div>
              </div>
              
              <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                {story.comments && story.comments.length > 0 ? (
                  story.comments.map((comment: any) => (
                    <div key={comment.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 relative group">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
                           {comment.user.profile?.avatarUrl ? (
                             <img src={getImageUrl(comment.user.profile.avatarUrl, UPLOAD_FOLDERS.AVATARS) || ""} alt="U" className="w-full h-full object-cover" />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs font-bold">
                                {comment.user.profile?.fullName?.charAt(0) || "U"}
                             </div>
                           )}
                        </div>
                        <div>
                          <p className="text-xs font-black text-gray-900">{comment.user.profile?.fullName || "Anonymous"}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">
                             {new Date(comment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{comment.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-sm text-gray-400 font-medium">No comments on this story yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Status & Actions Card */}
          <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <h2 className="text-sm font-bold text-gray-800">Story Status</h2>
              </div>
              {isEditing ? (
                <select 
                  className="text-[10px] font-black px-2 py-0.5 rounded border border-gray-200 uppercase tracking-widest outline-none bg-white"
                  value={editForm.status}
                  onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              ) : (
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                  story.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                  story.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                }`}>
                  {story.status}
                </span>
              )}
            </div>
            
            <div className="p-5 space-y-6">
              <div>
                <label className="block text-[11px] font-black text-gray-400 mb-2 uppercase tracking-widest">Category</label>
                <select
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 text-sm rounded border transition-all font-bold ${isEditing ? 'border-gray-300 focus:ring-1 focus:ring-admin-teal' : 'border-transparent bg-transparent p-0 cursor-default'}`}
                  value={editForm.categoryId}
                  onChange={e => setEditForm({ ...editForm, categoryId: e.target.value })}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <label className={`flex items-center gap-3 group ${isEditing ? 'cursor-pointer' : 'cursor-default'}`}>
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${editForm.isExclusive ? 'bg-admin-teal border-admin-teal' : 'border-gray-300'}`}>
                    <input
                      type="checkbox"
                      className="hidden"
                      disabled={!isEditing}
                      checked={editForm.isExclusive}
                      onChange={e => setEditForm({ ...editForm, isExclusive: e.target.checked })}
                    />
                    {editForm.isExclusive && <Star className="w-3 h-3 text-white fill-white" />}
                  </div>
                  <span className={`text-xs font-bold text-gray-700 ${isEditing ? 'group-hover:text-admin-teal transition-colors' : ''} uppercase tracking-tight`}>Exclusive Content</span>
                </label>
              </div>

              {/* Author Details (Sidebar) */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-[11px] font-black text-gray-400 mb-3 uppercase tracking-widest">Author</p>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
                    {story.author.profile?.avatarUrl ? (
                      <img src={getImageUrl(story.author.profile.avatarUrl, UPLOAD_FOLDERS.AVATARS) || ""} alt="A" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                        {story.author.profile?.fullName?.charAt(0) || "U"}
                      </div>
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-black text-gray-900 truncate">{story.author.profile?.fullName || "Staff Writer"}</p>
                    <p className="text-[10px] text-gray-500 truncate">{story.author.email}</p>
                  </div>
                </div>
              </div>

              {/* Timing */}
              <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                <div className="flex items-center gap-1">
                   <Clock className="w-3 h-3" />
                   Submitted {new Date(story.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                   <Edit2 className="w-3 h-3" />
                   Type: {editForm.type}
                </div>
              </div>
            </div>
          </div>

          {/* Media Card */}
          <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
               <div className="flex items-center gap-2">
                 <ImageIcon className="w-4 h-4 text-admin-teal" />
                 <h2 className="text-sm font-bold text-gray-800">Media Asset</h2>
               </div>
               {isEditing && (
                 <div className="flex items-center gap-1 p-0.5 bg-gray-100 rounded-lg">
                   <button
                     type="button"
                     onClick={() => setEditForm({ ...editForm, type: 'image' })}
                     className={`p-1.5 rounded-md transition-all ${editForm.type === 'image' ? 'bg-white shadow-sm text-admin-teal' : 'text-gray-400'}`}
                   >
                     <ImageIcon className="w-3.5 h-3.5" />
                   </button>
                   <button
                     type="button"
                     onClick={() => setEditForm({ ...editForm, type: 'video' })}
                     className={`p-1.5 rounded-md transition-all ${editForm.type === 'video' ? 'bg-white shadow-sm text-admin-teal' : 'text-gray-400'}`}
                   >
                     <Video className="w-3.5 h-3.5" />
                   </button>
                 </div>
               )}
            </div>
            <div className="p-5">
              {editForm.type === 'video' ? (
                <div className="space-y-4">
                  {isEditing && (
                    <input
                      type="text"
                      placeholder="YouTube URL..."
                      className="w-full px-3 py-2 text-xs rounded border border-gray-300 focus:ring-1 focus:ring-admin-teal outline-none transition-all"
                      value={editForm.mediaUrl}
                      onChange={e => setEditForm({ ...editForm, mediaUrl: e.target.value })}
                    />
                  )}
                  {editForm.mediaUrl && (
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-100 bg-black">
                      <iframe 
                        src={`https://www.youtube.com/embed/${editForm.mediaUrl.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/)?.[2] || ""}`}
                        className="absolute inset-0 w-full h-full"
                        frameBorder="0"
                        allowFullScreen
                      ></iframe>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {editForm.mediaUrl ? (
                    <div className="relative group rounded-lg overflow-hidden border border-gray-200">
                      <img src={getImageUrl(editForm.mediaUrl, UPLOAD_FOLDERS.POSTS) || ""} alt="Cover" className="w-full h-40 object-cover shadow-inner" />
                      {isEditing && (
                        <button 
                          type="button" 
                          onClick={() => setEditForm({ ...editForm, mediaUrl: "" })}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ) : isEditing ? (
                    <label className={`w-full flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 cursor-pointer transition-all ${isUploading ? 'bg-gray-50 border-gray-200' : 'border-gray-200 hover:border-admin-teal/50 hover:bg-admin-teal/5'}`}>
                      {isUploading ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-admin-teal"></div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-300 mb-2" />
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Replace Media</span>
                          <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                        </>
                      )}
                    </label>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          {/* Rejection Note */}
          {story.status === 'REJECTED' && story.rejectReason && (
            <div className="bg-red-50 p-6 rounded border border-red-100">
               <h3 className="text-xs font-black text-red-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                 <XCircle className="w-4 h-4" /> Rejection Note
               </h3>
               <p className="text-sm text-red-700 leading-relaxed">{story.rejectReason}</p>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
               <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                  <XCircle className="w-6 h-6" />
               </div>
               <div>
                  <h2 className="text-xl font-bold text-gray-900">Reject Submission</h2>
                  <p className="text-sm text-gray-500">Provide a reason for the athlete to review.</p>
               </div>
            </div>
            <div className="p-6">
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-red-500 min-h-[150px] resize-y text-sm"
                placeholder="Describe why this submission is being rejected..."
                autoFocus
              />
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={() => setShowRejectModal(false)}
                className="px-5 py-2.5 rounded font-bold text-gray-500 hover:bg-white transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={rejectStory}
                className="px-6 py-2.5 rounded bg-red-600 text-white font-bold hover:bg-red-700 shadow-md transition-all"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
