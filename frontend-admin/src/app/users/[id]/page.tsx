"use client";

import AdminLayout from "@/components/AdminLayout";
import { fetchApi } from "@/lib/api";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { 
  ChevronLeft, 
  Save, 
  User, 
  Mail, 
  Shield, 
  Globe as Facebook, 
  Camera, 
  MessageSquare as Twitter, 
  Play as Youtube, 
  MapPin, 
  FileText,
  Lock,
  Eye,
  EyeOff,
  Layout,
  AtSign,
  Globe,
  Upload
} from "lucide-react";
import { getImageUrl, UPLOAD_FOLDERS } from "@/lib/constants";

const Instagram = Camera; // Re-use Camera for Instagram as per project pattern
import Link from "next/link";

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      const res = await fetchApi("/upload/file?folder=avatars", {
        method: "POST",
        body: uploadData,
      });
      setFormData(prev => ({ ...prev, avatarUrl: res.data.fileUrl }));
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Avatar updated', showConfirmButton: false, timer: 2000 });
    } catch (error: any) {
      Swal.fire({ icon: 'error', title: 'Upload Failed', text: error.message });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      const res = await fetchApi("/upload/file?folder=stories", {
        method: "POST",
        body: uploadData,
      });
      setFormData(prev => ({ ...prev, coverUrl: res.data.fileUrl }));
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Cover image updated', showConfirmButton: false, timer: 2000 });
    } catch (error: any) {
      Swal.fire({ icon: 'error', title: 'Upload Failed', text: error.message });
    } finally {
      setIsUploadingCover(false);
    }
  };

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    role: "",
    isActive: true,
    fullName: "",
    bio: "",
    tagline: "",
    city: "",
    avatarUrl: "",
    coverUrl: "",
    facebookUrl: "",
    instagramUrl: "",
    twitterUrl: "",
    youtubeUrl: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetchApi(`/admin/users/${id}`);
        const user = res.data;
        setFormData({
          email: user.email || "",
          username: user.username || "",
          role: user.role || "USER",
          isActive: user.isActive,
          fullName: user.profile?.fullName || "",
          bio: user.profile?.bio || "",
          tagline: user.profile?.tagline || "",
          city: user.profile?.city || "",
          avatarUrl: user.profile?.avatarUrl || "",
          coverUrl: user.profile?.coverUrl || "",
          facebookUrl: user.profile?.facebookUrl || "",
          instagramUrl: user.profile?.instagramUrl || "",
          twitterUrl: user.profile?.twitterUrl || "",
          youtubeUrl: user.profile?.youtubeUrl || "",
          newPassword: "",
          confirmPassword: ""
        });
      } catch (error: any) {
        Swal.fire("Error", "Failed to load user data", "error");
        router.push("/users");
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      Swal.fire("Error", "Passwords do not match", "error");
      return;
    }

    setIsSaving(true);
    try {
      const payload: any = {
        email: formData.email,
        username: formData.username,
        role: formData.role,
        isActive: formData.isActive,
        fullName: formData.fullName,
        bio: formData.bio,
        tagline: formData.tagline,
        city: formData.city,
        avatarUrl: formData.avatarUrl,
        coverUrl: formData.coverUrl,
        facebookUrl: formData.facebookUrl,
        instagramUrl: formData.instagramUrl,
        twitterUrl: formData.twitterUrl,
        youtubeUrl: formData.youtubeUrl
      };

      if (formData.newPassword) {
        payload.password = formData.newPassword;
      }

      await fetchApi(`/admin/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'User updated successfully',
        showConfirmButton: false,
        timer: 3000
      });
      
      router.push("/users");
    } catch (error: any) {
      Swal.fire("Error", error.message || "Failed to update user", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-admin-teal"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <Link href="/users" className="flex items-center gap-2 text-admin-teal hover:underline text-sm font-medium mb-4 w-fit">
          <ChevronLeft className="w-4 h-4" /> Back to Users
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Edit Profile</h1>
        <p className="text-gray-500 mt-1">Manage account settings and platform profile for <strong>{formData.fullName}</strong>.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
        <div className="lg:col-span-2 space-y-8">
          {/* Account Basics */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <Shield className="w-5 h-5 text-admin-teal" />
              <h2 className="text-lg font-bold text-gray-800">Account Credentials</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 group-focus-within:text-admin-teal transition-colors" />
                  <input
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-2 text-sm rounded border border-gray-300 focus:ring-1 focus:ring-admin-teal outline-none transition-all"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
                <div className="relative group">
                  <AtSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 group-focus-within:text-admin-teal transition-colors" />
                  <input
                    type="text"
                    readOnly
                    className="w-full pl-10 pr-4 py-2 text-sm rounded border border-gray-300 bg-gray-50 cursor-not-allowed outline-none transition-all text-gray-500"
                    value={formData.username}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Role</label>
                <select
                  className="w-full px-4 py-2 text-sm rounded border border-gray-300 focus:ring-1 focus:ring-admin-teal outline-none transition-all bg-white"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="USER">User / Athlete</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                <select
                  className="w-full px-4 py-2 text-sm rounded border border-gray-300 focus:ring-1 focus:ring-admin-teal outline-none transition-all bg-white"
                  value={formData.isActive ? "true" : "false"}
                  onChange={e => setFormData({ ...formData, isActive: e.target.value === "true" })}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <User className="w-5 h-5 text-admin-teal" />
              <h2 className="text-lg font-bold text-gray-800">Public Profile</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 text-sm rounded border border-gray-300 focus:ring-1 focus:ring-admin-teal outline-none transition-all"
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tagline</label>
                  <input
                    type="text"
                    placeholder="e.g. Professional Sprinter"
                    className="w-full px-4 py-2 text-sm rounded border border-gray-300 focus:ring-1 focus:ring-admin-teal outline-none transition-all"
                    value={formData.tagline}
                    onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">City / Location</label>
                  <div className="relative group">
                    <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 group-focus-within:text-admin-teal transition-colors" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-2 text-sm rounded border border-gray-300 focus:ring-1 focus:ring-admin-teal outline-none transition-all"
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">Bio</label>
                   <textarea
                     rows={3}
                     className="w-full px-4 py-2 text-sm rounded border border-gray-300 focus:ring-1 focus:ring-admin-teal outline-none transition-all resize-none"
                     value={formData.bio}
                     onChange={e => setFormData({ ...formData, bio: e.target.value })}
                   />
                </div>
              </div>
            </div>
          </div>

          {/* Media Assets */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <Camera className="w-5 h-5 text-admin-teal" />
              <h2 className="text-lg font-bold text-gray-800">Media Assets</h2>
            </div>
            <div className="p-6 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Avatar Section */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Profile Avatar</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden shrink-0 relative group">
                      {formData.avatarUrl ? (
                        <>
                          <img 
                            src={getImageUrl(formData.avatarUrl, UPLOAD_FOLDERS.AVATARS)} 
                            alt="Avatar" 
                            className="w-full h-full object-cover" 
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-[10px] text-white font-bold uppercase tracking-widest">Preview</span>
                          </div>
                        </>
                      ) : (
                        <User className="w-8 h-8 text-gray-300" />
                      )}
                    </div>
                    <div className="space-y-3 flex-1 flex flex-col justify-center">
                      <label className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-admin-teal/5 border border-admin-teal/20 rounded-lg text-[11px] font-black uppercase tracking-widest text-admin-teal cursor-pointer hover:bg-admin-teal hover:text-white transition-all shadow-sm shadow-admin-teal/5 w-fit">
                        <Upload className="w-3.5 h-3.5" />
                        {isUploadingAvatar ? "Uploading..." : "Change Avatar"}
                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={isUploadingAvatar} />
                      </label>
                      <p className="text-[10px] text-gray-400 font-medium italic">Square images (1:1) work best.</p>
                    </div>
                  </div>
                </div>

                {/* Cover Image Section */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Cover Banner</label>
                  <div className="space-y-3">
                    <div className="aspect-[3/1] w-full rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative group">
                      {formData.coverUrl ? (
                        <img 
                          src={getImageUrl(formData.coverUrl, UPLOAD_FOLDERS.STORIES)} 
                          alt="Cover" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <Layout className="w-8 h-8 text-gray-300" />
                      )}
                    </div>
                    <div className="flex justify-end">
                      <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-full text-[11px] font-black uppercase tracking-widest cursor-pointer hover:bg-black transition-all shadow-lg shadow-black/10">
                        <Upload className="w-3.5 h-3.5" />
                        {isUploadingCover ? "Uploading..." : "Update Cover Banner"}
                        <input type="file" className="hidden" accept="image/*" onChange={handleCoverUpload} disabled={isUploadingCover} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100 flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                   <Layout className="w-3 h-3 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-800 uppercase tracking-widest">About Cover Images</p>
                  <p className="text-[11px] text-blue-600 mt-1 leading-relaxed">
                    The Cover Banner is displayed at the top of the athlete's public profile page. 
                    It serves as a professional background that showcases their brand. Recommended ratio: 3:1.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <Globe className="w-5 h-5 text-admin-teal" />
              <h2 className="text-lg font-bold text-gray-800">Social Connections</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative group">
                <Facebook className="absolute left-3 top-2.5 w-4 h-4 text-blue-600" />
                <input
                  type="text"
                  placeholder="Facebook Profile URL"
                  className="w-full pl-10 pr-4 py-2 text-sm rounded border border-gray-300 focus:ring-1 focus:ring-admin-teal outline-none transition-all"
                  value={formData.facebookUrl}
                  onChange={e => setFormData({ ...formData, facebookUrl: e.target.value })}
                />
              </div>
              <div className="relative group">
                <Instagram className="absolute left-3 top-2.5 w-4 h-4 text-pink-600" />
                <input
                  type="text"
                  placeholder="Instagram Profile URL"
                  className="w-full pl-10 pr-4 py-2 text-sm rounded border border-gray-300 focus:ring-1 focus:ring-admin-teal outline-none transition-all"
                  value={formData.instagramUrl}
                  onChange={e => setFormData({ ...formData, instagramUrl: e.target.value })}
                />
              </div>
              <div className="relative group">
                <Twitter className="absolute left-3 top-2.5 w-4 h-4 text-sky-500" />
                <input
                  type="text"
                  placeholder="Twitter Profile URL"
                  className="w-full pl-10 pr-4 py-2 text-sm rounded border border-gray-300 focus:ring-1 focus:ring-admin-teal outline-none transition-all"
                  value={formData.twitterUrl}
                  onChange={e => setFormData({ ...formData, twitterUrl: e.target.value })}
                />
              </div>
              <div className="relative group">
                <Youtube className="absolute left-3 top-2.5 w-4 h-4 text-red-600" />
                <input
                  type="text"
                  placeholder="Youtube Channel URL"
                  className="w-full pl-10 pr-4 py-2 text-sm rounded border border-gray-300 focus:ring-1 focus:ring-admin-teal outline-none transition-all"
                  value={formData.youtubeUrl}
                  onChange={e => setFormData({ ...formData, youtubeUrl: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-8">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden sticky top-8">
             <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                <Save className="w-4 h-4 text-admin-teal" />
                <h2 className="text-sm font-bold text-gray-800">Save Changes</h2>
             </div>
             <div className="p-6 space-y-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-3 bg-admin-teal text-white rounded-lg font-black text-xs uppercase tracking-widest shadow-lg shadow-admin-teal/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isSaving ? "Updating..." : "Update Profile"}
                </button>
                <Link
                  href="/users"
                  className="w-full block text-center py-3 bg-gray-50 text-gray-500 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all border border-gray-200"
                >
                  Cancel
                </Link>
             </div>
             
             {/* Password Change Section */}
             <div className="p-6 border-t border-gray-100 bg-gray-50/30">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <Lock className="w-3.5 h-3.5" /> Security Update
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">New Password</label>
                    <div className="relative">
                       <input
                         type={showPassword ? "text" : "password"}
                         placeholder="••••••••"
                         className="w-full px-3 py-2 text-sm rounded border border-gray-300 focus:ring-1 focus:ring-admin-teal outline-none"
                         value={formData.newPassword}
                         onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                       />
                       <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1.5 p-1 text-gray-400">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                       </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Confirm Password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 text-sm rounded border border-gray-300 focus:ring-1 focus:ring-admin-teal outline-none"
                      value={formData.confirmPassword}
                      onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 italic font-medium leading-relaxed">
                    Leave blank if you don't want to change the password.
                  </p>
                </div>
             </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
