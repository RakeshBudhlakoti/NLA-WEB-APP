"use client";

import AdminLayout from "@/components/AdminLayout";
import { fetchApi, uploadFileToS3 } from "@/lib/api";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  Upload, 
  Link as LinkIcon, 
  X, 
  CheckCircle,
  Info,
  Layers,
  LayoutGrid
} from "lucide-react";
import { getImageUrl, UPLOAD_FOLDERS } from "@/lib/constants";
import Swal from "sweetalert2";
import Link from "next/link";

export default function CreateCategoryPage() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    image: ""
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const filename = await uploadFileToS3(file, UPLOAD_FOLDERS.CATEGORIES);
      setFormData(prev => ({ ...prev, image: filename }));
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Image uploaded', showConfirmButton: false, timer: 3000 });
    } catch (err: any) {
      Swal.fire({ title: 'Upload Failed', text: err.message, icon: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await fetchApi("/categories", {
        method: "POST",
        body: JSON.stringify(formData)
      });
      
      Swal.fire({
        title: 'Success!',
        text: 'Category has been created successfully.',
        icon: 'success',
        confirmButtonColor: '#2271b1'
      });
      
      router.push("/categories");
    } catch (error: any) {
      Swal.fire({ title: 'Error', text: error.message, icon: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <Link 
          href="/categories" 
          className="flex items-center gap-2 text-admin-teal hover:underline text-sm font-medium mb-4 w-fit"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Categories
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Add New Category</h1>
        <p className="text-gray-500 mt-1">Create a new category to organize your wrestling stories.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
        <div className="lg:col-span-2 space-y-6">
          {/* General Information */}
          <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-admin-teal" />
              <h2 className="text-lg font-bold text-gray-800">General Information</h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Wrestling Tips, Technique, Interviews"
                  className="w-full px-4 py-3 rounded border border-gray-300 focus:ring-1 focus:ring-admin-teal outline-none transition-all text-sm"
                  value={formData.name}
                  onChange={e => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                    setFormData({ ...formData, name, slug });
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  URL Slug <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="category-slug"
                    className="w-full pl-10 pr-4 py-3 rounded border border-gray-300 bg-gray-50 text-gray-600 focus:ring-1 focus:ring-admin-teal outline-none transition-all font-mono text-sm"
                    value={formData.slug}
                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                  />
                </div>
                <p className="mt-2 text-[11px] text-gray-500 italic flex items-center gap-1.5">
                  <Info className="w-3 h-3" /> This is the URL-friendly version of the name.
                </p>
              </div>
            </div>
          </div>

          {/* Media Section */}
          <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-admin-teal" />
              <h2 className="text-lg font-bold text-gray-800">Category Icon / Image</h2>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg p-10 hover:border-admin-teal/50 hover:bg-gray-50 transition-all group relative">
                {formData.image ? (
                  <div className="relative group">
                    <img 
                      src={getImageUrl(formData.image, UPLOAD_FOLDERS.CATEGORIES) || ""} 
                      alt="Category" 
                      className="w-32 h-32 rounded-lg object-cover shadow-md border border-gray-100" 
                    />
                    <button 
                      type="button" 
                      onClick={() => setFormData({ ...formData, image: "" })}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="mt-4 text-center">
                       <p className="text-xs text-gray-400">Image Uploaded Successfully</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    {isUploading ? (
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 border-4 border-admin-teal/30 border-t-admin-teal rounded-full animate-spin mb-3"></div>
                        <span className="text-sm text-gray-500 font-medium">Uploading to S3...</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-gray-300 mx-auto mb-4 group-hover:text-admin-teal transition-colors" />
                        <h3 className="text-sm font-bold text-gray-700">Drop your image here, or browse</h3>
                        <p className="text-xs text-gray-400 mt-1">Support JPG, PNG, WEBP (Max 2MB)</p>
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleImageUpload} />
                        <button type="button" className="mt-4 px-4 py-2 bg-admin-teal/10 text-admin-teal text-xs font-bold rounded-lg hover:bg-admin-teal hover:text-white transition-all">
                          Select File
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar / Publishing */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded shadow-sm p-6 sticky top-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-50 pb-3">
              <CheckCircle className="w-5 h-5 text-green-500" /> Actions
            </h3>
            
            <div className="space-y-4">
              <button
                type="submit"
                disabled={isSaving || !formData.name || !formData.slug}
                className="w-full py-3 bg-admin-teal text-white rounded font-bold hover:bg-[#4a8f82] transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Saving...</>
                ) : (
                  "Publish Category"
                )}
              </button>
              
              <Link
                href="/categories"
                className="w-full block text-center py-3 bg-gray-50 text-gray-600 rounded font-bold hover:bg-gray-100 transition-all border border-gray-200"
              >
                Discard
              </Link>
            </div>

            <div className="mt-8 space-y-4">
               <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                  <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div className="text-[11px] text-blue-700 leading-relaxed">
                    <p className="font-bold uppercase tracking-wider mb-1">Editor's Note</p>
                    Categories help users find relevant content. Ensure the slug is unique and descriptive.
                  </div>
               </div>
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
