"use client";

import AdminLayout from "@/components/AdminLayout";
import { fetchApi, uploadFile } from "@/lib/api";
import { useEffect, useState, useRef } from "react";
import Swal from "sweetalert2";
import { 
  Save, 
  Upload, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Play as Youtube, 
  Camera as Instagram, 
  MessageSquare as Twitter,
  MapPin,
  Quote,
  Globe as Facebook,
  Camera,
  Layout,
  Shield
} from "lucide-react";
import { getImageUrl, UPLOAD_FOLDERS } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { refreshUser } = useAuth();
  const [profile, setProfile] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    avatarUrl: "",
    coverUrl: "",
    tagline: "",
    bio: "",
    city: "",
    facebookUrl: "",
    instagramUrl: "",
    twitterUrl: "",
    youtubeUrl: "",
    role: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await fetchApi("/admin/profile");
      if (res.data) {
        setProfile({
          fullName: res.data.profile?.fullName || "",
          username: res.data.username || "",
          email: res.data.email || "",
          avatarUrl: res.data.profile?.avatarUrl || "",
          coverUrl: res.data.profile?.coverUrl || "",
          tagline: res.data.profile?.tagline || "",
          bio: res.data.profile?.bio || "",
          city: res.data.profile?.city || "",
          facebookUrl: res.data.profile?.facebookUrl || "",
          instagramUrl: res.data.profile?.instagramUrl || "",
          twitterUrl: res.data.profile?.twitterUrl || "",
          youtubeUrl: res.data.profile?.youtubeUrl || "",
          password: "",
          confirmPassword: "",
          role: res.data.role || "",
        });
      }
    } catch (error) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Failed to load profile', showConfirmButton: false, timer: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  const getStrength = (pass: string) => {
    if (!pass) return 0;
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    return strength;
  };

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let pass = "";
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setProfile(prev => ({ ...prev, password: pass, confirmPassword: pass }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Password copied!', showConfirmButton: false, timer: 2000 });
  };

  const strength = getStrength(profile.password);
  const strengthColor = ["bg-gray-200", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"][strength];
  const strengthText = ["", "Very Weak", "Weak", "Medium", "Strong"][strength];

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Must be an image file', showConfirmButton: false, timer: 3000 });
      return;
    }

    setIsUploading(true);
    try {
      const filename = await uploadFile(file, UPLOAD_FOLDERS.AVATARS);
      setProfile(prev => ({ ...prev, avatarUrl: filename }));
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Avatar uploaded successfully', showConfirmButton: false, timer: 3000 });
    } catch (error) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Failed to upload avatar', showConfirmButton: false, timer: 3000 });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Must be an image file', showConfirmButton: false, timer: 3000 });
      return;
    }

    setIsUploadingCover(true);
    try {
      const filename = await uploadFile(file, UPLOAD_FOLDERS.BANNERS);
      setProfile(prev => ({ ...prev, coverUrl: filename }));
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Banner updated successfully', showConfirmButton: false, timer: 3000 });
    } catch (error) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Failed to upload banner', showConfirmButton: false, timer: 3000 });
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profile.password && profile.password !== profile.confirmPassword) {
      return Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Passwords do not match', showConfirmButton: false, timer: 3000 });
    }

    setIsSaving(true);
    try {
      const payload: any = { 
        fullName: profile.fullName, 
        email: profile.email,
        avatarUrl: profile.avatarUrl,
        coverUrl: profile.coverUrl,
        tagline: profile.tagline,
        bio: profile.bio,
        city: profile.city,
        facebookUrl: profile.facebookUrl,
        instagramUrl: profile.instagramUrl,
        twitterUrl: profile.twitterUrl,
        youtubeUrl: profile.youtubeUrl
      };
      if (profile.password) payload.password = profile.password;

      await fetchApi("/admin/profile", {
        method: "PUT",
        body: JSON.stringify(payload)
      });
      
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Profile updated successfully', showConfirmButton: false, timer: 3000 });
      setProfile(prev => ({ ...prev, password: "", confirmPassword: "" }));
      if (typeof refreshUser === 'function') {
        refreshUser();
      }
    } catch (error: any) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: error.message || 'Failed to update profile', showConfirmButton: false, timer: 3000 });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <span className="w-8 h-8 border-4 border-admin-teal/30 border-t-admin-teal rounded-full animate-spin"></span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header with Save Button */}
      <div className="mb-8 flex justify-between items-center bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-white shadow-sm sticky top-0 z-40">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Your Profile</h1>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Manage your identity & security</p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-admin-teal transition-all font-black text-xs uppercase tracking-widest disabled:opacity-70 flex items-center gap-2 shadow-lg shadow-black/10 active:scale-95"
        >
          {isSaving ? "Saving..." : <><Save className="w-4 h-4" /> Save Changes</>}
        </button>
      </div>

      <div className="space-y-8 pb-20">
        {/* Profile Hero Section */}
        <div className="relative flex flex-col">
          {/* Banner Container */}
          <div className="h-48 md:h-80 w-full bg-gray-900 rounded-[2rem] overflow-hidden relative group shadow-2xl border-4 border-white">
            {profile.coverUrl ? (
              <img 
                src={getImageUrl(profile.coverUrl, UPLOAD_FOLDERS.STORIES) || ""} 
                alt="Cover" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out opacity-80" 
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                <Layout className="w-12 h-12 text-white/10 mb-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 text-center px-4">Official NLA Banner</span>
              </div>
            )}
            
            {/* Banner Upload Button */}
            <div className="absolute top-4 right-4 md:top-6 md:right-6">
              <label className="cursor-pointer bg-black/40 backdrop-blur-xl border border-white/20 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-admin-teal hover:scale-105 transition-all shadow-2xl flex items-center gap-2 group/btn">
                {isUploadingCover ? "..." : <><Upload className="w-3 h-3 md:w-3.5 md:h-3.5 group-hover/btn:-translate-y-0.5 transition-transform" /> <span className="hidden md:inline">Update Banner</span></>}
                <input type="file" className="hidden" accept="image/*" onChange={handleCoverUpload} />
              </label>
            </div>

            {/* Bottom Overlay for Text Contrast */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent"></div>
          </div>

          {/* Avatar and Name - Negative Margin approach */}
          <div className="px-6 md:px-12 flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-8 -mt-16 md:-mt-20 relative z-10">
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] md:rounded-[2.5rem] border-[4px] md:border-[6px] border-white overflow-hidden shadow-2xl bg-white bg-clip-padding relative z-10 mx-auto md:mx-0">
                {profile.avatarUrl ? (
                  <img 
                    src={getImageUrl(profile.avatarUrl, UPLOAD_FOLDERS.AVATARS) || ""} 
                    alt="Avatar" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50">
                    <UserIcon className="w-10 h-10 md:w-12 md:h-12 text-gray-200" />
                  </div>
                )}
              </div>

              {/* Avatar Upload Button */}
              <div className="absolute -bottom-2 -right-2 md:-right-2 z-20">
                <label className="cursor-pointer bg-admin-teal text-white w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all border-[3px] md:border-4 border-white group/cam">
                  <Camera className="w-4 h-4 md:w-5 md:h-5 group-hover/cam:rotate-12 transition-transform" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                </label>
              </div>
            </div>

            <div className="pb-2 md:pb-4 text-center md:text-left mt-4 md:mt-0">
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">{profile.fullName || "Your Name"}</h2>
              <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-admin-teal mt-1">NLA {profile.role || "Administrator"}</p>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8 md:mt-12">
          
          {/* Main Info Columns */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Account Details */}
            <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-black/[0.02] transition-all">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 bg-admin-teal/10 rounded-lg flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-admin-teal" />
                </div>
                <h3 className="text-lg font-black text-gray-900 tracking-tight">Account Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Username</label>
                  <input
                    type="text"
                    value={profile.username}
                    readOnly
                    className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-xl text-gray-500 font-bold text-sm cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Full Name</label>
                  <input
                    type="text"
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    className="w-full px-5 py-3.5 bg-gray-50 border border-transparent focus:border-admin-teal focus:bg-white rounded-xl text-gray-900 font-bold text-sm transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email Address</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full px-5 py-3.5 bg-gray-50 border border-transparent focus:border-admin-teal focus:bg-white rounded-xl text-gray-900 font-bold text-sm transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">City / Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="e.g. Los Angeles, CA"
                      value={profile.city}
                      onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                      className="w-full pl-12 pr-5 py-3.5 bg-gray-50 border border-transparent focus:border-admin-teal focus:bg-white rounded-xl text-gray-900 font-bold text-sm transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Bio */}
            <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-black/[0.02] transition-all">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Quote className="w-4 h-4 text-purple-500" />
                </div>
                <h3 className="text-lg font-black text-gray-900 tracking-tight">Professional Identity</h3>
              </div>
              
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Tagline / Mission</label>
                  <input
                    type="text"
                    placeholder="Briefly describe your focus..."
                    value={profile.tagline}
                    onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                    className="w-full px-5 py-3.5 bg-gray-50 border border-transparent focus:border-purple-500 focus:bg-white rounded-xl text-gray-900 font-bold text-sm transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Biography</label>
                  <textarea
                    rows={5}
                    placeholder="Tell us about your background and goals..."
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-transparent focus:border-purple-500 focus:bg-white rounded-2xl text-gray-900 font-bold text-sm transition-all resize-none"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-black/[0.02] transition-all">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                    <Check className="w-4 h-4 text-red-500" />
                  </div>
                  <h3 className="text-lg font-black text-gray-900 tracking-tight">Security</h3>
                </div>
                <button 
                  type="button" 
                  className="text-[10px] font-black uppercase tracking-widest text-admin-teal hover:underline"
                  onClick={() => {
                    const pass = Math.random().toString(36).slice(-10) + "A1!";
                    setProfile({ ...profile, password: pass, confirmPassword: pass });
                    Swal.fire({ toast: true, position: 'top-end', icon: 'info', title: 'Strong password generated', text: pass, showConfirmButton: true });
                  }}
                >
                  Generate Strong Password
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 relative">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">New Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Leave blank to keep current"
                    value={profile.password}
                    onChange={(e) => setProfile({ ...profile, password: e.target.value })}
                    className="w-full px-5 py-3.5 bg-gray-50 border border-transparent focus:border-red-500 focus:bg-white rounded-xl text-gray-900 font-bold text-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-[3.2rem] text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Confirm New Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Repeat new password"
                    value={profile.confirmPassword}
                    onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })}
                    className="w-full px-5 py-3.5 bg-gray-50 border border-transparent focus:border-red-500 focus:bg-white rounded-xl text-gray-900 font-bold text-sm transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Columns */}
          <div className="space-y-8">
            {/* Social Profiles */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Social Network</h3>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Facebook className="w-3 h-3 text-blue-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Facebook</span>
                  </div>
                  <input
                    type="text"
                    value={profile.facebookUrl}
                    onChange={(e) => setProfile({ ...profile, facebookUrl: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white rounded-xl text-xs font-bold transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Instagram className="w-3 h-3 text-pink-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Instagram</span>
                  </div>
                  <input
                    type="text"
                    value={profile.instagramUrl}
                    onChange={(e) => setProfile({ ...profile, instagramUrl: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:border-pink-600 focus:bg-white rounded-xl text-xs font-bold transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Twitter className="w-3 h-3 text-sky-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Twitter / X</span>
                  </div>
                  <input
                    type="text"
                    value={profile.twitterUrl}
                    onChange={(e) => setProfile({ ...profile, twitterUrl: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:border-sky-500 focus:bg-white rounded-xl text-xs font-bold transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Youtube className="w-3 h-3 text-red-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Youtube</span>
                  </div>
                  <input
                    type="text"
                    value={profile.youtubeUrl}
                    onChange={(e) => setProfile({ ...profile, youtubeUrl: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:border-red-600 focus:bg-white rounded-xl text-xs font-bold transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Account Summary Card */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
              
              <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-8">Account Summary</h3>
              
              <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <span className="text-xs font-bold text-white/60">System Role</span>
                  <span className="text-xs font-black uppercase tracking-widest text-admin-teal">Administrator</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <span className="text-xs font-bold text-white/60">Account Status</span>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                    <span className="text-xs font-black uppercase tracking-widest text-green-400">Active</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs font-bold text-white/60">Last Login</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Today, 10:45 AM</span>
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-white/10 flex items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-admin-teal" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Secured by NLA</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
