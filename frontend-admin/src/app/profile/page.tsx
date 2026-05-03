"use client";

import AdminLayout from "@/components/AdminLayout";
import { fetchApi, uploadFileToS3 } from "@/lib/api";
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
  Globe as Facebook
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
      const filename = await uploadFileToS3(file, UPLOAD_FOLDERS.AVATARS);
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
      const filename = await uploadFileToS3(file, UPLOAD_FOLDERS.BANNERS);
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
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-medium text-gray-800">Your Profile</h1>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="px-4 py-2 bg-admin-teal text-white rounded hover:bg-[#4a8f82] transition-all font-medium disabled:opacity-70 text-sm flex items-center gap-2"
        >
          {isSaving ? "Saving..." : <><Save className="w-4 h-4" /> Save Profile</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
        <div className="lg:col-span-2 space-y-6">
          {/* General Info */}
          <div className="bg-white border border-gray-200 rounded shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-2">Profile Information</h2>
            
            <div className="space-y-6">
              {/* Banner Upload Section */}
              <div className="relative group w-full h-40 bg-gray-100 rounded-xl overflow-hidden border-2 border-dashed border-gray-200">
                {profile.coverUrl ? (
                  <img 
                    src={getImageUrl(profile.coverUrl, UPLOAD_FOLDERS.BANNERS) || ""} 
                    alt="Cover" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <Save className="w-8 h-8 mb-2 opacity-20" />
                    <span className="text-xs font-medium uppercase tracking-widest">No Cover Photo</span>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4">
                  <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-lg text-xs font-bold hover:bg-admin-teal hover:text-white transition-colors flex items-center gap-2">
                    {isUploadingCover ? "Uploading..." : <><Upload className="w-4 h-4" /> Change Cover</>}
                    <input type="file" className="hidden" accept="image/*" onChange={handleCoverUpload} />
                  </label>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-8 items-start relative z-10 px-6">
                <div className="flex flex-col items-center gap-3 -mt-12">
                  <div className="w-32 h-32 rounded-lg bg-white border-4 border-white shadow-lg overflow-hidden group relative">
                    {profile.avatarUrl ? (
                      <>
                        <img 
                          src={getImageUrl(profile.avatarUrl, UPLOAD_FOLDERS.AVATARS) || ""} 
                          alt="Avatar" 
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center transition-all">
                           <button onClick={() => fileInputRef.current?.click()} className="text-white text-xs font-bold underline">Change</button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-4 h-full flex flex-col items-center justify-center bg-gray-50">
                        <UserIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <span className="text-[10px] text-gray-400 font-medium">Avatar</span>
                      </div>
                    )}
                    {isUploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><span className="w-5 h-5 border-2 border-admin-teal border-t-transparent rounded-full animate-spin"></span></div>}
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                </div>

                <div className="flex-1 space-y-4 w-full pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Username</label>
                      <input type="text" value={profile.username} readOnly className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded text-sm text-gray-500 cursor-not-allowed outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                      <input type="text" value={profile.fullName} onChange={e => setProfile({ ...profile, fullName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-admin-teal outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                      <input type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-admin-teal outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">City / Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                        <input type="text" value={profile.city} onChange={e => setProfile({ ...profile, city: e.target.value })} placeholder="New York, USA" className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-admin-teal outline-none" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bio & Tagline */}
          <div className="bg-white border border-gray-200 rounded shadow-sm p-6">
             <h2 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-2">Professional Bio</h2>
             <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Tagline</label>
                  <div className="relative">
                    <Quote className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                    <input type="text" value={profile.tagline} onChange={e => setProfile({ ...profile, tagline: e.target.value })} placeholder="Senior Editor at NLA Sports" className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-admin-teal outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Biography</label>
                  <textarea rows={4} value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} placeholder="Tell us about yourself..." className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-admin-teal outline-none resize-none" />
                </div>
             </div>
          </div>

          {/* Security */}
          <div className="bg-white border border-gray-200 rounded shadow-sm p-6">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-2">
              <h2 className="text-lg font-bold text-gray-800">Security</h2>
              <button type="button" onClick={generatePassword} className="text-xs text-admin-teal font-bold hover:underline">Generate Strong Password</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">New Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} placeholder="Leave blank to keep current" value={profile.password} onChange={e => setProfile({ ...profile, password: e.target.value })} className="w-full px-3 py-2 pr-16 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-admin-teal outline-none" />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {profile.password && (
                      <button type="button" onClick={() => copyToClipboard(profile.password)} className="p-1 text-gray-400 hover:text-admin-teal transition-colors">{copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}</button>
                    )}
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="p-1 text-gray-400 hover:text-admin-teal transition-colors">{showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}</button>
                  </div>
                </div>
                {profile.password && (
                  <div className="mt-2">
                    <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden"><div className={`h-full transition-all duration-300 ${strengthColor}`} style={{ width: `${(strength / 4) * 100}%` }} /></div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase mt-1 block">Strength: {strengthText}</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Confirm New Password</label>
                <div className="relative">
                  <input type={showConfirmPassword ? "text" : "password"} placeholder="Repeat new password" value={profile.confirmPassword} onChange={e => setProfile({ ...profile, confirmPassword: e.target.value })} className="w-full px-3 py-2 pr-10 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-admin-teal outline-none" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-admin-teal transition-colors">{showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Social Links */}
          <div className="bg-white border border-gray-200 rounded shadow-sm p-6">
             <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Social Profiles</h2>
             <div className="space-y-4">
                <div className="space-y-1">
                   <label className="text-xs font-bold text-gray-500 uppercase">Facebook</label>
                   <div className="relative flex items-center">
                      <Facebook className="absolute left-2.5 w-4 h-4 text-[#1877F2]" />
                      <input type="url" value={profile.facebookUrl} onChange={e => setProfile({ ...profile, facebookUrl: e.target.value })} placeholder="https://facebook.com/..." className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-admin-teal outline-none" />
                   </div>
                </div>
                <div className="space-y-1">
                   <label className="text-xs font-bold text-gray-500 uppercase">Instagram</label>
                   <div className="relative flex items-center">
                      <Instagram className="absolute left-2.5 w-4 h-4 text-[#E4405F]" />
                      <input type="url" value={profile.instagramUrl} onChange={e => setProfile({ ...profile, instagramUrl: e.target.value })} placeholder="https://instagram.com/..." className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-admin-teal outline-none" />
                   </div>
                </div>
                <div className="space-y-1">
                   <label className="text-xs font-bold text-gray-500 uppercase">Twitter / X</label>
                   <div className="relative flex items-center">
                      <Twitter className="absolute left-2.5 w-4 h-4 text-[#1DA1F2]" />
                      <input type="url" value={profile.twitterUrl} onChange={e => setProfile({ ...profile, twitterUrl: e.target.value })} placeholder="https://twitter.com/..." className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-admin-teal outline-none" />
                   </div>
                </div>
                <div className="space-y-1">
                   <label className="text-xs font-bold text-gray-500 uppercase">YouTube</label>
                   <div className="relative flex items-center">
                      <Youtube className="absolute left-2.5 w-4 h-4 text-[#FF0000]" />
                      <input type="url" value={profile.youtubeUrl} onChange={e => setProfile({ ...profile, youtubeUrl: e.target.value })} placeholder="https://youtube.com/..." className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-admin-teal outline-none" />
                   </div>
                </div>
             </div>
          </div>

          <div className="bg-white border border-gray-200 rounded shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Account Summary</h2>
            <div className="space-y-4">
               <div className="flex justify-between text-sm py-2 border-b border-gray-50">
                  <span className="text-gray-500">Role</span>
                  <span className="font-bold text-admin-teal">Administrator</span>
               </div>
               <div className="flex justify-between text-sm py-2 border-b border-gray-50">
                  <span className="text-gray-500">Status</span>
                  <span className="text-green-600 font-bold">Active</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
