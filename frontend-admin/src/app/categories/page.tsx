"use client";

import AdminLayout from "@/components/AdminLayout";
import { fetchApi, uploadFile } from "@/lib/api";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, X, Upload, Search, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import { getImageUrl, UPLOAD_FOLDERS } from "@/lib/constants";
import Swal from "sweetalert2";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    image: ""
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetchApi("/categories");
      setCategories(res.data);
    } catch (error) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Failed to load categories', showConfirmButton: false, timer: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (cat: any = null) => {
    if (cat) {
      setEditingCategory(cat);
      setFormData({
        name: cat.name,
        slug: cat.slug || "",
        image: cat.image || ""
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: "", slug: "", image: "" });
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const filename = await uploadFile(file, UPLOAD_FOLDERS.CATEGORIES);
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
    
    try {
      if (editingCategory) {
        await fetchApi(`/categories/${editingCategory.id}`, {
          method: "PUT",
          body: JSON.stringify(formData)
        });
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Category updated', showConfirmButton: false, timer: 3000 });
      } else {
        await fetchApi("/categories", {
          method: "POST",
          body: JSON.stringify(formData)
        });
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Category created', showConfirmButton: false, timer: 3000 });
      }
      setIsModalOpen(false);
      loadCategories();
    } catch (error: any) {
      Swal.fire({ title: 'Error', text: error.message, icon: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1877F2',
      cancelButtonColor: '#EF4444',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await fetchApi(`/categories/${id}`, { method: "DELETE" });
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Category deleted', showConfirmButton: false, timer: 3000 });
        loadCategories();
      } catch (error: any) {
        Swal.fire({ title: 'Error', text: error.message, icon: 'error' });
      }
    }
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.slug?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-medium text-gray-800">Categories</h1>
        <Link 
          href="/categories/create"
          className="px-3 py-1 text-sm border border-admin-teal text-admin-teal rounded hover:bg-admin-teal hover:text-white transition-colors font-medium flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add New
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
        {/* Horizontal Links Style (WordPress) */}
        <div className="flex items-center text-[13px] text-gray-500 gap-0">
          <div className="flex items-center">
            <button className="relative py-1 group transition-all text-admin-teal font-bold">
              <span>All</span>
              <span className="ml-1 font-normal text-admin-teal/70">({categories.length})</span>
              <div className="absolute bottom-0 left-0 h-0.5 bg-admin-teal w-full opacity-100"></div>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2">
          <input 
            type="text" 
            placeholder="Search categories..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-admin-teal outline-none w-64 bg-gray-50"
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-bold border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 border-r border-gray-100 text-center">Image</th>
                <th className="px-6 py-3 border-r border-gray-100">Name</th>
                <th className="px-6 py-3 border-r border-gray-100">Slug</th>
                <th className="px-6 py-3 border-r border-gray-100 text-center">Count</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic font-medium">Loading categories...</td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium">No categories found.</td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat.id} className="group hover:bg-blue-50/30 transition-colors border-b border-gray-50 last:border-0">
                    <td className="px-4 py-4 border-r border-gray-100">
                      <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden border border-gray-200 mx-auto group-hover:border-admin-teal transition-colors">
                        {cat.image ? (
                          <img src={getImageUrl(cat.image, UPLOAD_FOLDERS.CATEGORIES) || ""} alt={cat.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 border-r border-gray-100">
                      <span className="font-bold text-gray-900 group-hover:text-admin-teal transition-colors cursor-pointer" onClick={() => handleOpenModal(cat)}>{cat.name}</span>
                    </td>
                    <td className="px-6 py-4 border-r border-gray-100">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-200 w-fit">
                        <LinkIcon className="w-3 h-3" />
                        {cat.slug}
                      </div>
                    </td>
                    <td className="px-6 py-4 border-r border-gray-100 text-center">
                      <Link href={`/stories?categoryId=${cat.id}`} className="inline-block px-3 py-1 rounded-full bg-admin-teal/10 text-admin-teal font-bold text-xs hover:bg-admin-teal hover:text-white transition-all">
                        {cat._count?.posts || 0}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenModal(cat)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit Category">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(cat.id)} 
                          disabled={cat._count?.posts > 0} 
                          className={`p-1.5 rounded transition-colors ${cat._count?.posts > 0 ? 'text-gray-300 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'}`} 
                          title={cat._count?.posts > 0 ? "Cannot delete category with stories" : "Delete Category"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-admin-text/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <form onSubmit={handleSubmit}>
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-admin-text">{editingCategory ? "Edit Category" : "Add New Category"}</h2>
                <button type="button" onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-6 h-6 text-admin-muted" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-admin-text mb-2 uppercase tracking-wider">Category Name</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Wrestling Tips"
                    className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-admin-bg/50 focus:ring-2 focus:ring-admin-teal outline-none transition-all"
                    value={formData.name}
                    onChange={e => {
                      const name = e.target.value;
                      const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                      setFormData({ ...formData, name, slug });
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-admin-text mb-2 uppercase tracking-wider">Slug (Auto-generated)</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      placeholder="wrestling-tips"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-admin-muted outline-none transition-all font-mono text-sm"
                      value={formData.slug}
                      onChange={e => setFormData({ ...formData, slug: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-admin-text mb-2 uppercase tracking-wider">Category Icon/Image</label>
                  <div className="space-y-4">
                    {formData.image && (
                      <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-gray-100">
                        <img src={getImageUrl(formData.image, UPLOAD_FOLDERS.CATEGORIES) || ""} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => setFormData({...formData, image: ""})}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-lg"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 cursor-pointer transition-all ${isUploading ? 'bg-gray-50 border-gray-200' : 'border-admin-teal/20 hover:border-admin-teal/50 hover:bg-admin-teal/5'}`}>
                      {isUploading ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-teal"></div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-admin-teal mb-2" />
                          <span className="text-xs font-bold text-admin-text uppercase">Upload Thumbnail</span>
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-admin-bg/50 border-t border-gray-100 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-admin-muted hover:bg-white transition-colors border border-transparent hover:border-gray-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-8 py-2.5 rounded-xl font-bold bg-admin-teal text-white hover:bg-[#4a8f82] transition-colors shadow-lg hover:shadow-admin-teal/20"
                >
                  {editingCategory ? "Save Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
