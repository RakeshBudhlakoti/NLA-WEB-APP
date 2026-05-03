"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { fetchApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { 
  ChevronLeft, 
  Save, 
  Upload, 
  Video, 
  Image as ImageIcon, 
  Star,
  Layers,
  Info,
  CheckCircle,
  X
} from "lucide-react";
import Link from "next/link";
import { UPLOAD_FOLDERS, getImageUrl } from "@/lib/constants";

import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function CreateStoryPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    challenge: "",
    motivation: "",
    achievement: "",
    editorialHighlights: "",
    type: "image",
    categoryId: "",
    mediaUrl: "",
    isExclusive: false
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetchApi("/categories");
        setCategories(res.data || []);
        if (res.data && res.data.length > 0) {
          setFormData(prev => ({ ...prev, categoryId: res.data[0].id }));
        }
      } catch (error) {
        console.error("Failed to load categories", error);
      }
    };
    loadCategories();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      
      const res = await fetchApi("/upload/file?folder=posts", {
        method: "POST",
        body: uploadData,
      });

      setFormData(prev => ({ ...prev, mediaUrl: res.data.fileUrl }));
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'File uploaded', showConfirmButton: false, timer: 2000 });
    } catch (error: any) {
      Swal.fire({ icon: 'error', title: 'Upload Failed', text: error.message });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content || !formData.categoryId) {
      return Swal.fire({ icon: 'warning', title: 'Missing Fields', text: 'Title, Content and Category are required.' });
    }

    setIsLoading(true);
    try {
      await fetchApi("/posts", {
        method: "POST",
        body: JSON.stringify(formData)
      });

      Swal.fire({
        title: 'Story Created!',
        text: 'The story has been published successfully.',
        icon: 'success',
        confirmButtonText: 'Go to Stories'
      }).then(() => {
        router.push("/stories");
      });
    } catch (error: any) {
      Swal.fire({ icon: 'error', title: 'Failed to create story', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <Link 
          href="/stories" 
          className="flex items-center gap-2 text-admin-teal hover:underline text-sm font-medium mb-4 w-fit"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Stories
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Add New Story</h1>
        <p className="text-gray-500 mt-1">Publish a new administrative story. These posts are automatically approved.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Story Content */}
          <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-admin-teal" />
              <h2 className="text-lg font-bold text-gray-800">Story Content</h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  Story Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter a compelling title..."
                  className="w-full px-4 py-3 rounded border border-gray-300 focus:ring-1 focus:ring-admin-teal outline-none transition-all text-sm font-bold"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Short Description / Hook</label>
                <textarea
                  rows={2}
                  placeholder="A brief hook for the story feed..."
                  className="w-full px-4 py-3 rounded border border-gray-300 focus:ring-1 focus:ring-admin-teal outline-none transition-all text-sm resize-none"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <style jsx global>{`
                .quill-editor-container .ql-editor {
                  min-height: 300px;
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
              `}</style>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Narrative <span className="text-red-500">*</span></label>
                <div className="quill-editor-container">
                  <ReactQuill
                    theme="snow"
                    placeholder="The core story of the athlete's journey..."
                    value={formData.content}
                    onChange={content => {
                      if (content !== formData.content) {
                        setFormData(prev => ({ ...prev, content }));
                      }
                    }}
                    className="bg-white rounded border border-gray-300"
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['link', 'clean']
                      ],
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Editorial Sections */}
          <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center gap-2">
              <Star className="w-5 h-5 text-admin-teal" />
              <h2 className="text-lg font-bold text-gray-800">Editorial Highlights</h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-black text-gray-400 mb-2 uppercase tracking-widest">The Challenge</label>
                  <div className="quill-editor-container">
                    <ReactQuill
                      theme="snow"
                      value={formData.challenge}
                      onChange={val => setFormData(prev => ({ ...prev, challenge: val }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-gray-400 mb-2 uppercase tracking-widest">The Motivation</label>
                  <div className="quill-editor-container">
                    <ReactQuill
                      theme="snow"
                      value={formData.motivation}
                      onChange={val => setFormData(prev => ({ ...prev, motivation: val }))}
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-black text-gray-400 mb-2 uppercase tracking-widest">The Achievement</label>
                <div className="quill-editor-container">
                  <ReactQuill
                    theme="snow"
                    value={formData.achievement}
                    onChange={val => setFormData(prev => ({ ...prev, achievement: val }))}
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <label className="block text-[11px] font-black text-gray-400 mb-2 uppercase tracking-widest">Editorial Takeaways / Highlights</label>
                <div className="quill-editor-container">
                  <ReactQuill
                    theme="snow"
                    placeholder="Key highlights for front-page promotion..."
                    value={formData.editorialHighlights}
                    onChange={val => setFormData(prev => ({ ...prev, editorialHighlights: val }))}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar / Options */}
        <div className="space-y-8">
          {/* Media Section */}
          <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <ImageIcon className="w-4 h-4 text-admin-teal" />
                 <h2 className="text-sm font-bold text-gray-800">Cover Media</h2>
               </div>
               <div className="flex items-center gap-1 p-0.5 bg-gray-100 rounded-lg">
                  <button type="button" onClick={() => setFormData({...formData, type: 'image'})} className={`p-1.5 rounded-md transition-all ${formData.type === 'image' ? 'bg-white shadow-sm text-admin-teal' : 'text-gray-400'}`}>
                    <ImageIcon className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => setFormData({...formData, type: 'video'})} className={`p-1.5 rounded-md transition-all ${formData.type === 'video' ? 'bg-white shadow-sm text-admin-teal' : 'text-gray-400'}`}>
                    <Video className="w-3.5 h-3.5" />
                  </button>
               </div>
            </div>
            
            <div className="p-5">
              {formData.type === 'video' ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="YouTube URL..."
                    className="w-full px-3 py-2 text-xs rounded border border-gray-300 focus:ring-1 focus:ring-admin-teal outline-none transition-all"
                    value={formData.mediaUrl}
                    onChange={e => setFormData({ ...formData, mediaUrl: e.target.value })}
                  />
                  {formData.mediaUrl && (
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-100 bg-black">
                      <iframe 
                        src={`https://www.youtube.com/embed/${formData.mediaUrl.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/)?.[2] || ""}`}
                        className="absolute inset-0 w-full h-full"
                        frameBorder="0"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                      ></iframe>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.mediaUrl ? (
                    <div className="relative group rounded-lg overflow-hidden border border-gray-200">
                      <img src={getImageUrl(formData.mediaUrl, UPLOAD_FOLDERS.POSTS) || ""} alt="Cover" className="w-full h-40 object-cover" />
                      <button 
                        type="button" 
                        onClick={() => setFormData({ ...formData, mediaUrl: "" })}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className={`w-full flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 cursor-pointer transition-all ${uploading ? 'bg-gray-50 border-gray-200' : 'border-gray-200 hover:border-admin-teal/50 hover:bg-admin-teal/5'}`}>
                      {uploading ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-admin-teal"></div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-300 mb-2" />
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Upload Cover</span>
                          <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                        </>
                      )}
                    </label>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Publishing Card */}
          <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <h2 className="text-sm font-bold text-gray-800">Publish</h2>
            </div>
            
            <div className="p-5 space-y-6">
              <div>
                <label className="block text-[11px] font-black text-gray-400 mb-2 uppercase tracking-widest">Category</label>
                <select
                  required
                  className="w-full px-3 py-2 text-sm rounded border border-gray-300 focus:ring-1 focus:ring-admin-teal outline-none transition-all font-bold"
                  value={formData.categoryId}
                  onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${formData.isExclusive ? 'bg-admin-teal border-admin-teal' : 'border-gray-300'}`}>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={formData.isExclusive}
                      onChange={e => setFormData({ ...formData, isExclusive: e.target.checked })}
                    />
                    {formData.isExclusive && <Star className="w-3 h-3 text-white fill-white" />}
                  </div>
                  <span className="text-xs font-bold text-gray-700 group-hover:text-admin-teal transition-colors uppercase tracking-tight">Exclusive Content</span>
                </label>
              </div>

              <div className="pt-4 space-y-3">
                <button
                  type="submit"
                  disabled={isLoading || !formData.title || !formData.content}
                  className="w-full py-3 bg-admin-teal text-white rounded font-black text-xs uppercase tracking-[0.2em] shadow-md hover:shadow-admin-teal/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? "Publishing..." : <><Save className="w-4 h-4" /> Publish Story</>}
                </button>
                <Link
                  href="/stories"
                  className="w-full block text-center py-3 bg-gray-50 text-gray-500 rounded font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-100 transition-all border border-gray-200"
                >
                  Discard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
