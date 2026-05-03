"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, User, Lock, ShieldCheck, X, KeyRound, ArrowLeft, Share2, Layout, Upload, Camera } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchApi, uploadFileToS3 } from "@/lib/api";
import { getImageUrl, UPLOAD_FOLDERS } from "@/lib/constants";
import Swal from "sweetalert2";

export default function EditProfile() {
  const { user, logout, isLoading, refreshUser } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [tagline, setTagline] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  
  // Password Modal States
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    } else if (user && !isSaving) {
      setFullName(user.profile?.fullName || "");
      setTagline(user.profile?.tagline || "");
      setBio(user.profile?.bio || "");
      setCity(user.profile?.city || "");
      setAvatarUrl(user.profile?.avatarUrl || "");
      setCoverUrl(user.profile?.coverUrl || "");
      setInstagramUrl(user.profile?.instagramUrl || "");
      setTwitterUrl(user.profile?.twitterUrl || "");
      setYoutubeUrl(user.profile?.youtubeUrl || "");
      setFacebookUrl(user.profile?.facebookUrl || "");
    }
  }, [user, isLoading, router, isSaving]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetchApi('/users/me', {
        method: 'PUT',
        body: JSON.stringify({ 
          fullName, tagline, bio, city, avatarUrl, coverUrl,
          instagramUrl, twitterUrl, youtubeUrl, facebookUrl 
        })
      });
      await refreshUser(); // Update AuthContext
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Profile saved successfully!', showConfirmButton: false, timer: 3000 });
    } catch (error: any) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: error.message || "Failed to save profile", showConfirmButton: false, timer: 3000 });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      const filename = await uploadFileToS3(file, UPLOAD_FOLDERS.AVATARS);
      setAvatarUrl(filename);
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Profile picture updated!', showConfirmButton: false, timer: 3000 });
    } catch (err: any) {
      Swal.fire({ title: 'Upload Failed', text: err.message, icon: 'error' });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCover(true);
    try {
      const filename = await uploadFileToS3(file, UPLOAD_FOLDERS.STORIES);
      setCoverUrl(filename);
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Cover image updated!', showConfirmButton: false, timer: 3000 });
    } catch (err: any) {
      Swal.fire({ title: 'Upload Failed', text: err.message, icon: 'error' });
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return Swal.fire({ title: 'Error', text: 'Passwords do not match', icon: 'error' });
    }
    setIsChangingPassword(true);
    try {
      await fetchApi('/users/change-password', {
        method: 'PUT',
        body: JSON.stringify({ oldPassword, newPassword })
      });
      Swal.fire({ title: 'Success', text: 'Password changed successfully!', icon: 'success' });
      setIsPasswordModalOpen(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      Swal.fire({ title: 'Error', text: err.message, icon: 'error' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex-1 flex justify-center items-center h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-yellow"></div>
      </div>
    );
  }

  const currentAvatarDisplayUrl = getImageUrl(avatarUrl, UPLOAD_FOLDERS.AVATARS);

  return (
    <div className="flex-1 bg-background text-gray-900 pb-20">
      <div className="container mx-auto px-4 mt-12 max-w-4xl">
        
        <div className="flex flex-col gap-2 mb-8">
          <Link href="/dashboard" className="flex items-center gap-2 text-muted hover:text-gray-900 transition-colors text-sm font-bold">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Edit Profile</h1>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsPasswordModalOpen(true)}
                className="flex items-center gap-2 px-6 py-2 bg-white border border-gray-200 text-gray-900 rounded-full hover:bg-gray-50 transition-colors text-sm font-bold shadow-sm"
              >
                <Lock className="w-4 h-4" /> Change Password
              </button>
              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 border border-red-500/30 text-red-500 rounded-full hover:bg-red-500/10 transition-colors text-sm font-bold shadow-sm">
                <LogOut className="w-4 h-4" /> Log Out
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* COVER & AVATAR SECTION */}
          <div className="bg-surface border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            {/* Cover Image Preview */}
            <div className="relative group h-48 md:h-64 bg-gray-100">
              {coverUrl ? (
                <img 
                  src={getImageUrl(coverUrl, UPLOAD_FOLDERS.STORIES)} 
                  alt="Cover" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-muted">
                  <Layout className="w-12 h-12 mb-2 opacity-20" />
                  <p className="text-xs font-bold uppercase tracking-widest">No Cover Banner</p>
                </div>
              )}
              <div className="absolute bottom-6 right-6 flex gap-2 z-30">
                <label className="cursor-pointer px-5 py-2.5 bg-black/70 hover:bg-black/90 text-white rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md transition-all flex items-center gap-2 border border-white/20 shadow-2xl active:scale-95">
                  {isUploadingCover ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Uploading...
                    </div>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      Change Banner
                    </>
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={handleCoverUpload} disabled={isUploadingCover} />
                </label>
              </div>
              <div className="absolute top-4 left-4 p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 max-w-[250px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">About Cover Images</p>
                <p className="text-[10px] text-white/80 leading-relaxed">This banner appears at the top of your public profile. Professional action shots work best here. Ratio: 3:1.</p>
              </div>
            </div>

            <div className="px-6 md:px-8 pb-8 pt-0 -mt-16 relative z-10 flex flex-col md:flex-row items-end gap-6">
              <div className="relative group">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden border-[6px] border-white shadow-2xl bg-gray-50 flex items-center justify-center relative">
                  {currentAvatarDisplayUrl ? (
                    <img src={currentAvatarDisplayUrl} alt="Avatar" className={`w-full h-full object-cover ${isUploadingAvatar ? 'opacity-40' : ''}`} />
                  ) : (
                    <User className="w-16 h-16 text-gray-200" />
                  )}
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-brand-yellow/30 border-t-brand-yellow rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <label className={`absolute -bottom-2 -right-2 cursor-pointer w-10 h-10 bg-brand-yellow text-black rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all border-4 border-white ${isUploadingAvatar ? 'opacity-50 pointer-events-none' : ''}`}>
                  <Camera className="w-5 h-5" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={isUploadingAvatar} />
                </label>
              </div>
              <div className="flex-1 pb-2">
                <h2 className="text-2xl font-black tracking-tight text-gray-900">{fullName || "Athlete Name"}</h2>
                <p className="text-sm font-bold text-muted uppercase tracking-widest">{tagline || "Professional Athlete"}</p>
              </div>
            </div>
          </div>

          {/* PERSONAL DETAILS & ABOUT ME */}
          <div className="bg-surface border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <User className="w-5 h-5 text-gray-900" />
                <h2 className="text-sm font-black uppercase tracking-wider text-gray-900">Personal Details</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-xs font-bold text-muted mb-2 uppercase tracking-widest">Full Name</label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-muted focus:outline-none focus:ring-1 focus:ring-brand-yellow transition-all text-sm shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted mb-2 uppercase tracking-widest">Tagline / Title</label>
                  <input 
                    type="text" 
                    value={tagline}
                    onChange={e => setTagline(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-muted focus:outline-none focus:ring-1 focus:ring-brand-yellow transition-all text-sm shadow-sm"
                    placeholder="e.g. Pro Athlete"
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-xs font-bold text-muted mb-2 uppercase tracking-widest">City</label>
                <input 
                  type="text" 
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-muted focus:outline-none focus:ring-1 focus:ring-brand-yellow transition-all text-sm shadow-sm"
                  placeholder="e.g. Los Angeles, CA"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted mb-2 uppercase tracking-widest">My Journey (Bio)</label>
              <textarea 
                rows={5}
                value={bio}
                onChange={e => setBio(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-muted focus:outline-none focus:ring-1 focus:ring-brand-yellow transition-all resize-y text-sm leading-relaxed shadow-sm"
                placeholder="Share your athletic journey, challenges and achievements..."
              />
            </div>
          </div>

          {/* SOCIAL PRESENCE */}
          <div className="bg-surface border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <Share2 className="w-5 h-5 text-gray-900" />
              <h2 className="text-sm font-black uppercase tracking-wider text-gray-900">Social Presence</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-muted mb-2 uppercase tracking-widest">Instagram URL</label>
                <input 
                  type="url" 
                  value={instagramUrl}
                  onChange={e => setInstagramUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-muted focus:outline-none focus:ring-1 focus:ring-brand-yellow transition-all text-sm shadow-sm"
                  placeholder="https://instagram.com/yourprofile"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted mb-2 uppercase tracking-widest">Twitter (X) URL</label>
                <input 
                  type="url" 
                  value={twitterUrl}
                  onChange={e => setTwitterUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-muted focus:outline-none focus:ring-1 focus:ring-brand-yellow transition-all text-sm shadow-sm"
                  placeholder="https://twitter.com/yourprofile"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted mb-2 uppercase tracking-widest">YouTube URL</label>
                <input 
                  type="url" 
                  value={youtubeUrl}
                  onChange={e => setYoutubeUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-muted focus:outline-none focus:ring-1 focus:ring-brand-yellow transition-all text-sm shadow-sm"
                  placeholder="https://youtube.com/c/yourchannel"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted mb-2 uppercase tracking-widest">Facebook URL</label>
                <input 
                  type="url" 
                  value={facebookUrl}
                  onChange={e => setFacebookUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-muted focus:outline-none focus:ring-1 focus:ring-brand-yellow transition-all text-sm shadow-sm"
                  placeholder="https://facebook.com/yourprofile"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Link href="/dashboard" className="px-8 py-3 bg-white border border-gray-200 text-gray-900 font-bold rounded-xl hover:bg-surface-hover transition-colors text-sm shadow-sm">
              Cancel
            </Link>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-8 py-3 bg-brand-yellow text-black font-bold rounded-xl hover:bg-yellow-400 transition-colors text-sm disabled:opacity-50 shadow-[0_4px_14px_0_rgba(255,221,0,0.3)]"
            >
              {isSaving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>

        </div>
      </div>

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center">
                            <KeyRound className="w-5 h-5 text-brand-blue" />
                        </div>
                        <h2 className="text-xl font-black tracking-tight">Security</h2>
                    </div>
                    <button onClick={() => setIsPasswordModalOpen(false)} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors">
                        <X className="w-4 h-4 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleChangePassword} className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Current Password</label>
                            <input 
                                type="password" 
                                value={oldPassword} 
                                onChange={e => setOldPassword(e.target.value)} 
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-yellow text-sm" 
                                required
                            />
                        </div>
                        <div className="h-px bg-gray-50 w-full my-2"></div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">New Password</label>
                            <input 
                                type="password" 
                                value={newPassword} 
                                onChange={e => setNewPassword(e.target.value)} 
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-yellow text-sm" 
                                minLength={8}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Confirm New Password</label>
                            <input 
                                type="password" 
                                value={confirmPassword} 
                                onChange={e => setConfirmPassword(e.target.value)} 
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-yellow text-sm" 
                                minLength={8}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                        <button 
                            type="submit" 
                            disabled={isChangingPassword}
                            className="w-full py-4 bg-brand-blue text-white font-black rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-brand-blue/20 disabled:opacity-50 uppercase tracking-widest text-xs"
                        >
                            {isChangingPassword ? 'Updating...' : 'Update Password'}
                        </button>
                        <p className="text-[10px] text-center text-muted font-bold flex items-center justify-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Secure encryption active
                        </p>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}
