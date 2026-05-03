"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronRight, ChevronLeft, Play } from "lucide-react";
import { fetchApi, uploadFileToS3 } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Swal from "sweetalert2";
import { Upload } from "lucide-react";

export default function EditStory({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [step, setStep] = useState(1);
  const totalSteps = 4;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  
  const [challenge, setChallenge] = useState("");
  const [motivation, setMotivation] = useState("");
  const [achievement, setAchievement] = useState("");

  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [type, setType] = useState("story");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [catsRes, postRes] = await Promise.all([
          fetchApi('/categories'),
          fetchApi(`/posts/${id}`)
        ]);
        
        setCategories(catsRes.data);
        const post = postRes.data;

        if (post.author.id !== user?.id && user?.role !== 'ADMIN') {
          Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Unauthorized', showConfirmButton: false, timer: 3000 });
          router.push('/dashboard/stories');
          return;
        }

        setTitle(post.title || "");
        setCategoryId(post.categoryId || "");
        setType(post.type || "story");

        // Parse content back into 3 fields if formatted
        if (post.content) {
          const contentStr = post.content as string;
          if (contentStr.startsWith("Challenge: ")) {
            const parts = contentStr.split(/\n\nMotivation: |\n\nAchievement: /);
            if (parts.length === 3) {
              setChallenge(parts[0].replace(/^Challenge: /, ""));
              setMotivation(parts[1]);
              setAchievement(parts[2]);
            } else {
              setChallenge(contentStr);
            }
          } else {
            setChallenge(contentStr);
          }
        }

        if (post.type === 'video') {
          setYoutubeUrl(post.mediaUrl || "");
        } else {
          setMediaUrl(post.mediaUrl || "");
        }
        
      } catch (err) {
        Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Failed to load story', showConfirmButton: false, timer: 3000 });
        router.push('/dashboard/stories');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchData();
  }, [id, user, isAuthLoading, router]);

  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };
  
  const videoId = getYoutubeId(youtubeUrl);
  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : (mediaUrl || "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800&auto=format&fit=crop");

  const handleNext = () => {
    if (step === 1 && (!title)) return Swal.fire({ toast: true, position: 'top-end', icon: 'warning', title: 'Please fill title', showConfirmButton: false, timer: 3000 });
    if (step === 2 && (!challenge)) return Swal.fire({ toast: true, position: 'top-end', icon: 'warning', title: 'Please write your story', showConfirmButton: false, timer: 3000 });
    setStep((prev) => Math.min(prev + 1, totalSteps));
  };
  const handlePrev = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadFileToS3(file, 'stories');
      setMediaUrl(url);
      setYoutubeUrl(""); // Clear youtube URL if direct upload is used
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Media uploaded successfully', showConfirmButton: false, timer: 3000 });
    } catch (error) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Failed to upload media', showConfirmButton: false, timer: 3000 });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setError("");

    const content = `Challenge: ${challenge}\n\nMotivation: ${motivation}\n\nAchievement: ${achievement}`;
    
    try {
      await fetchApi(`/posts/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title,
          content,
          categoryId,
          mediaUrl: mediaUrl || (videoId ? `https://youtube.com/watch?v=${videoId}` : null)
        })
      });
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Story updated successfully!', showConfirmButton: false, timer: 3000 });
      router.push('/dashboard/stories');
    } catch (err: any) {
      setError(err.message || "Failed to update story");
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: err.message || "Failed to update story", showConfirmButton: false, timer: 3000 });
      setIsSubmitting(false);
    }
  };

  if (isLoading || isAuthLoading) {
    return (
      <div className="flex-1 flex justify-center items-center h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-yellow"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background text-gray-900 pb-20">
      <div className="container mx-auto px-4 mt-12 max-w-3xl">
        
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Edit Your Journey</h1>
          <p className="text-muted">Update your story details and save your changes.</p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-12 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-surface-hover z-0"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-yellow z-0 transition-all duration-300"
            style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
          ></div>
          
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${
              step >= i ? 'bg-brand-yellow text-black shadow-[0_0_15px_rgba(255,221,0,0.3)]' : 'bg-surface border-2 border-gray-100 text-muted'
            }`}>
              {step > i ? <CheckCircle2 className="w-5 h-5" /> : i}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-bold text-center">
            {error}
          </div>
        )}

        {/* Form Container */}
        <div className="bg-surface border border-gray-100 rounded-3xl p-6 md:p-10 min-h-[400px] flex flex-col">
          
          <div className="flex-1">
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-2xl font-bold mb-6">Step 1: Basic Info</h2>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Story Title</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-hover border border-gray-100 rounded-xl text-gray-900 placeholder-muted focus:outline-none focus:ring-1 focus:ring-brand-yellow transition-all"
                    placeholder="e.g. My Road to Victory"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Category</label>
                  <select 
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-hover border border-gray-100 rounded-xl text-gray-900 focus:outline-none focus:ring-1 focus:ring-brand-yellow transition-all"
                  >
                    <option value="" disabled>Select a category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-2xl font-bold mb-6">Step 2: The Story</h2>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">What was your biggest challenge?</label>
                  <textarea 
                    rows={3}
                    value={challenge}
                    onChange={e => setChallenge(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-hover border border-gray-100 rounded-xl text-gray-900 placeholder-muted focus:outline-none focus:ring-1 focus:ring-brand-yellow transition-all resize-y"
                    placeholder="Describe the obstacles you faced..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">What kept you motivated?</label>
                  <textarea 
                    rows={3}
                    value={motivation}
                    onChange={e => setMotivation(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-hover border border-gray-100 rounded-xl text-gray-900 placeholder-muted focus:outline-none focus:ring-1 focus:ring-brand-yellow transition-all resize-y"
                    placeholder="Who or what pushed you forward?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">The Achievement</label>
                  <textarea 
                    rows={3}
                    value={achievement}
                    onChange={e => setAchievement(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-hover border border-gray-100 rounded-xl text-gray-900 placeholder-muted focus:outline-none focus:ring-1 focus:ring-brand-yellow transition-all resize-y"
                    placeholder="Describe the moment of success..."
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-2xl font-bold mb-6">Step 3: Media Upload</h2>
                
                <div className="bg-surface-hover p-6 rounded-xl border border-dashed border-gray-300 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm text-brand-blue">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold mb-1">Upload Media</h3>
                  <p className="text-xs text-muted mb-4">Upload an image or video file</p>
                  <label className="cursor-pointer">
                    <span className="px-6 py-2.5 bg-brand-blue text-white font-bold rounded-lg hover:bg-blue-700 transition-colors inline-block">
                      {isUploading ? "Uploading..." : "Browse Files"}
                    </span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                  </label>
                  {mediaUrl && !youtubeUrl && (
                    <p className="text-xs text-green-600 mt-3 font-bold break-all">✓ Uploaded: {mediaUrl}</p>
                  )}
                </div>

                <div className="flex items-center gap-4 py-2">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="text-xs font-bold text-muted uppercase tracking-wider">OR</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">YouTube Video Link</label>
                  <input 
                    type="url" 
                    value={youtubeUrl}
                    onChange={(e) => {
                      setYoutubeUrl(e.target.value);
                      if (e.target.value) setMediaUrl("");
                    }}
                    className="w-full px-4 py-3 bg-surface-hover border border-gray-100 rounded-xl text-gray-900 placeholder-muted focus:outline-none focus:ring-1 focus:ring-brand-yellow transition-all"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                  {videoId && (
                    <p className="text-xs text-brand-yellow mt-2 font-bold">✓ Valid YouTube link detected</p>
                  )}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-2xl font-bold mb-6">Step 4: Preview & Save</h2>
                <div className="bg-surface-hover rounded-2xl p-6 border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-brand-yellow text-black text-xs font-bold rounded-full uppercase">Preview</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{title}</h3>
                  <div className="aspect-video bg-surface rounded-xl mb-6 overflow-hidden relative">
                    <img src={thumbnailUrl} alt="Preview" className="w-full h-full object-cover opacity-80" />
                    {videoId && (
                      <div className="absolute inset-0 flex items-center justify-center z-20">
                        <div className="w-16 h-16 bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center border border-gray-200">
                          <Play className="w-8 h-8 fill-brand-yellow text-brand-yellow ml-1" />
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {challenge}
                  </p>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-muted">
                  <span className="text-brand-blue font-bold">Note:</span> Your edits will be saved instantly.
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-100">
            {step > 1 ? (
              <button 
                onClick={handlePrev}
                className="flex items-center gap-2 px-6 py-3 bg-surface hover:bg-surface-hover text-gray-900 font-bold rounded-xl transition-colors border border-gray-100"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <Link 
                href="/dashboard/stories"
                className="px-6 py-3 text-muted hover:text-gray-900 font-bold transition-colors"
              >
                Cancel
              </Link>
            )}

            {step < totalSteps ? (
              <button 
                onClick={handleNext}
                className="flex items-center gap-2 px-8 py-3 bg-brand-blue text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={handleSave}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3 bg-brand-yellow text-black font-bold rounded-xl hover:bg-yellow-400 transition-colors shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
