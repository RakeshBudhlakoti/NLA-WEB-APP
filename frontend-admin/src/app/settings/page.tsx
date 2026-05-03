"use client";

import AdminLayout from "@/components/AdminLayout";
import { fetchApi, uploadFileToS3 } from "@/lib/api";
import { useEffect, useState, useRef } from "react";
import Swal from "sweetalert2";
import { Save, Upload } from "lucide-react";
import { getImageUrl, UPLOAD_FOLDERS } from "@/lib/constants";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteName: "",
    metaTitle: "",
    metaDescription: "",
    contactEmail: "",
    facebookUrl: "",
    instagramUrl: "",
    twitterUrl: "",
    logoUrl: "",
    allowEditAfterApproval: "false",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsRes = await fetchApi("/settings");
      if (settingsRes.data) {
        setSettings(prev => ({ ...prev, ...settingsRes.data }));
      }
    } catch (error) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Failed to load settings', showConfirmButton: false, timer: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Must be an image file', showConfirmButton: false, timer: 3000 });
      return;
    }

    setIsUploading(true);
    try {
      const filename = await uploadFileToS3(file, UPLOAD_FOLDERS.LOGOS);
      setSettings(prev => ({ ...prev, logoUrl: filename }));
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Logo uploaded successfully', showConfirmButton: false, timer: 3000 });
    } catch (error) {
      console.error('Logo upload error:', error);
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Failed to upload logo', showConfirmButton: false, timer: 3000 });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await fetchApi("/settings", {
        method: "PUT",
        body: JSON.stringify(settings)
      });
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Settings saved successfully', showConfirmButton: false, timer: 3000 });
    } catch (error) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Failed to save settings', showConfirmButton: false, timer: 3000 });
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
          <h1 className="text-2xl font-medium text-gray-800">Platform Settings</h1>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="px-4 py-2 bg-admin-teal text-white rounded hover:bg-[#4a8f82] transition-all font-medium disabled:opacity-70 text-sm flex items-center gap-2"
        >
          {isSaving ? "Saving..." : <><Save className="w-4 h-4" /> Save Settings</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* General branding */}
          <div className="bg-white border border-gray-200 rounded shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-2">Branding & General</h2>
            
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-full md:w-1/3">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Platform Logo</label>
                  <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center text-center">
                    {settings.logoUrl ? (
                      <div className="relative group">
                        <img src={getImageUrl(settings.logoUrl, UPLOAD_FOLDERS.LOGOS) || ""} alt="Logo" className="max-h-24 object-contain rounded" />
                        <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center rounded transition-all">
                          <button onClick={() => fileInputRef.current?.click()} className="text-white text-xs font-bold underline">Change</button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-2 text-center">
                        <Upload className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                        <span className="text-[10px] text-gray-400 font-medium">Upload Logo</span>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleLogoUpload}
                    />
                  </div>
                  {!settings.logoUrl && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full mt-2 text-xs text-admin-teal font-bold hover:underline"
                    >
                      {isUploading ? "Uploading..." : "Select File"}
                    </button>
                  )}
                </div>

                <div className="flex-1 space-y-4 w-full">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Site Name</label>
                    <input
                      type="text"
                      name="siteName"
                      value={settings.siteName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-admin-teal outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Contact Email</label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={settings.contactEmail}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-admin-teal outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SEO */}
          <div className="bg-white border border-gray-200 rounded shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-2">SEO Configuration</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Meta Title</label>
                <input
                  type="text"
                  name="metaTitle"
                  value={settings.metaTitle}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-admin-teal outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Meta Description</label>
                <textarea
                  name="metaDescription"
                  value={settings.metaDescription}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-admin-teal outline-none resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Social */}
          <div className="bg-white border border-gray-200 rounded shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Social Channels</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Instagram</label>
                <input
                  type="url"
                  name="instagramUrl"
                  value={settings.instagramUrl}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-admin-teal outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Facebook</label>
                <input
                  type="url"
                  name="facebookUrl"
                  value={settings.facebookUrl}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-admin-teal outline-none"
                />
              </div>
            </div>
          </div>

          {/* Feature toggles */}
          <div className="bg-white border border-gray-200 rounded shadow-sm p-6">
             <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Platform Policies</h2>
             <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-gray-700">Allow Edits After Approval</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={settings.allowEditAfterApproval === "true"}
                    onChange={(e) => setSettings(prev => ({ ...prev, allowEditAfterApproval: e.target.checked ? "true" : "false" }))}
                  />
                  <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-admin-teal"></div>
                </label>
             </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
