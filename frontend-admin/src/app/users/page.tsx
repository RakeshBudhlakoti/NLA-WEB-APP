"use client";

import AdminLayout from "@/components/AdminLayout";
import { fetchApi } from "@/lib/api";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Trash2, UserX, UserCheck, Search, Edit, CheckCircle } from "lucide-react";
import Link from "next/link";
import { getImageUrl, UPLOAD_FOLDERS } from "@/lib/constants";

type User = {
  id: string;
  email: string;
  role: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  isDeleted: boolean;
  profile?: {
    fullName: string;
    avatarUrl?: string;
  };
  _count?: {
    posts: number;
  };
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusCounts, setStatusCounts] = useState<any>({ ALL: 0, ACTIVE: 0, INACTIVE: 0, TRASH: 0 });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [pendingBulkAction, setPendingBulkAction] = useState("");

  // Handle search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      let endpoint = `/admin/users?status=${filter}&page=${page}&limit=10`;
      if (debouncedSearch) {
        endpoint += `&search=${encodeURIComponent(debouncedSearch)}`;
      }
      const res = await fetchApi(endpoint);
      setUsers(res.data.users || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
      setStatusCounts(res.data.statusCounts || { ALL: 0, ACTIVE: 0, INACTIVE: 0, TRASH: 0 });
    } catch (error) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Failed to load users', showConfirmButton: false, timer: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, filter, debouncedSearch]);

  const changeRole = async (id: string, newRole: string) => {
    try {
      await fetchApi(`/admin/users/${id}/role`, {
        method: "PUT",
        body: JSON.stringify({ role: newRole })
      });
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Role updated successfully', showConfirmButton: false, timer: 3000 });
      setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
    } catch (error) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Failed to update role', showConfirmButton: false, timer: 3000 });
    }
  };

  const toggleStatus = async (user: User) => {
    const result = await Swal.fire({
      title: 'Change Status?',
      text: `Are you sure you want to make this user ${user.isActive ? 'Inactive' : 'Active'}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: user.isActive ? '#ef4444' : '#22c55e',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Yes, change it!'
    });

    if (!result.isConfirmed) return;

    try {
      await fetchApi(`/admin/users/${user.id}/toggle-status`, { method: "PUT" });
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'User status updated', showConfirmButton: false, timer: 3000 });
      loadUsers();
    } catch (error) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Failed to update user status', showConfirmButton: false, timer: 3000 });
    }
  };

  const deleteUser = async (id: string, reassignToId?: string) => {
    try {
      const res = await fetchApi(`/admin/users/${id}`, { 
        method: "DELETE",
        body: reassignToId ? JSON.stringify({ reassignToId }) : undefined
      });

      if (res.data?.hasStories && !reassignToId) {
        // Fetch users for reassignment
        const usersRes = await fetchApi('/admin/users?status=ACTIVE&limit=100');
        const activeUsers = (usersRes.data.users || []).filter((u: any) => u.id !== id);

        if (activeUsers.length === 0) {
          Swal.fire('Error', 'User has stories, but there are no other active users to reassign them to. Please create or activate another user first.', 'error');
          return;
        }

        const userOptions = activeUsers.reduce((acc: any, u: any) => {
          acc[u.id] = `${u.profile?.fullName || 'No Name'} (${u.email})`;
          return acc;
        }, {});

        const { value: selectedId } = await Swal.fire({
          title: 'Reassign Stories',
          text: `This user has ${res.data.count} active stories. Who should own them now?`,
          input: 'select',
          inputOptions: userOptions,
          inputPlaceholder: 'Select a new owner',
          showCancelButton: true,
          confirmButtonText: 'Reassign & Delete',
          inputValidator: (value) => {
            return new Promise((resolve) => {
              if (value) resolve(null);
              else resolve('You must select a user');
            });
          }
        });

        if (selectedId) {
          deleteUser(id, selectedId);
        }
        return;
      }

      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: res.message || 'User deleted', showConfirmButton: false, timer: 3000 });
      loadUsers();
    } catch (error: any) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: error.message || 'Failed to delete user', showConfirmButton: false, timer: 3000 });
    }
  };

  const restoreUser = async (id: string) => {
    try {
      await fetchApi(`/admin/users/${id}/restore`, { method: "PUT" });
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'User restored successfully', showConfirmButton: false, timer: 3000 });
      loadUsers();
    } catch (error) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Failed to restore user', showConfirmButton: false, timer: 3000 });
    }
  };


  const toggleSelect = (id: string) => {
    setSelectedUsers(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    setSelectedUsers(selectedUsers.length === users.length ? [] : users.map(u => u.id));
  };

  const handleBulkAction = async () => {
    if (!pendingBulkAction || selectedUsers.length === 0) return;
    
    const result = await Swal.fire({
      title: 'Bulk Action',
      text: `Are you sure you want to ${pendingBulkAction.toLowerCase()} ${selectedUsers.length} users?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, proceed'
    });

    if (!result.isConfirmed) return;

    try {
      for (const id of selectedUsers) {
        if (pendingBulkAction === "DELETE") await fetchApi(`/admin/users/${id}`, { method: "DELETE" });
        if (pendingBulkAction === "RESTORE") await fetchApi(`/admin/users/${id}/restore`, { method: "PUT" });
      }
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Bulk action completed', showConfirmButton: false, timer: 3000 });
      setSelectedUsers([]);
      setPendingBulkAction("");
      loadUsers();
    } catch (error) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Failed to process bulk action', showConfirmButton: false, timer: 3000 });
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-medium text-gray-800">Users</h1>
        <Link 
          href="/users/new"
          className="px-3 py-1 text-sm border border-admin-teal text-admin-teal rounded hover:bg-admin-teal hover:text-white transition-colors font-medium"
        >
          Add New
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
        {/* Status Filter Links */}
        <div className="flex items-center text-[13px] text-gray-500 gap-0">
          {["ALL", "ACTIVE", "INACTIVE", "TRASH"].map((s, idx) => (
            <div key={s} className="flex items-center">
              <button
                onClick={() => { setFilter(s); setPage(1); setSelectedUsers([]); }}
                className={`relative py-1 group transition-all ${filter === s ? "text-admin-teal font-bold" : "hover:text-admin-teal"}`}
              >
                <span>{s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}</span>
                <span className={`ml-1 font-normal ${filter === s ? "text-admin-teal/70" : "text-gray-400 group-hover:text-admin-teal/70"}`}>
                  ({statusCounts[s] || 0})
                </span>
                <div className={`absolute bottom-0 left-0 h-0.5 bg-admin-teal transition-all duration-300 ${filter === s ? "w-full opacity-100" : "w-0 opacity-0 group-hover:w-full group-hover:opacity-100"}`}></div>
              </button>
              {idx < 3 && <span className="mx-3 text-gray-300 select-none">|</span>}
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2">
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-admin-teal outline-none w-64 bg-gray-50"
          />
        </div>
      </div>

      {/* Bulk Actions Row */}
      <div className="flex items-center gap-2 mb-4 bg-white p-3 border border-gray-200 rounded shadow-sm">
        <select 
          className="px-3 py-1.5 border border-gray-300 rounded text-sm outline-none bg-white text-gray-700"
          value={pendingBulkAction}
          onChange={(e) => setPendingBulkAction(e.target.value)}
        >
          <option value="">Bulk actions</option>
          {filter === "TRASH" ? <option value="RESTORE">Restore</option> : <option value="DELETE">Move to Trash</option>}
        </select>
        <button 
          onClick={handleBulkAction}
          disabled={!pendingBulkAction || selectedUsers.length === 0}
          className="px-4 py-1.5 border border-gray-300 rounded text-sm bg-white hover:bg-gray-50 text-gray-700 font-medium disabled:opacity-50"
        >
          Apply
        </button>
        <div className="ml-auto text-sm text-gray-500 font-medium">
          {users.length} items
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-bold border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 w-10 border-r border-gray-100 text-center">
                  <input type="checkbox" checked={selectedUsers.length > 0 && selectedUsers.length === users.length} onChange={toggleSelectAll} className="rounded border-gray-300" />
                </th>
                <th className="px-4 py-3 border-r border-gray-100 text-center">Avatar</th>
                <th className="px-6 py-3 border-r border-gray-100">Name / Email</th>
                <th className="px-6 py-3 border-r border-gray-100">Role</th>
                <th className="px-6 py-3 border-r border-gray-100 text-center">Stories</th>
                <th className="px-6 py-3 border-r border-gray-100 text-center">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400 italic font-medium">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400 font-medium">No users found.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="group hover:bg-blue-50/30 transition-colors border-b border-gray-50 last:border-0">
                    <td className="px-6 py-4 border-r border-gray-100 text-center">
                      <input type="checkbox" checked={selectedUsers.includes(user.id)} onChange={() => toggleSelect(user.id)} className="rounded border-gray-300" />
                    </td>
                    <td className="px-4 py-4 border-r border-gray-100">
                      <div className="w-10 h-10 rounded-full bg-admin-teal text-white flex items-center justify-center font-bold mx-auto border border-white shadow-sm overflow-hidden">
                        {user.profile?.avatarUrl ? (
                          <img 
                            src={getImageUrl(user.profile.avatarUrl, UPLOAD_FOLDERS.AVATARS)} 
                            alt={user.profile.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          user.profile?.fullName?.charAt(0) || user.email.charAt(0)
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 border-r border-gray-100">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{user.profile?.fullName || 'No Name'}</span>
                        <span className="text-xs text-gray-500 font-medium">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 border-r border-gray-100">
                      <select
                        value={user.role}
                        disabled={user.role === 'ADMIN'}
                        onChange={(e) => changeRole(user.id, e.target.value)}
                        className={`text-[11px] font-bold px-3 py-1 rounded-full border border-gray-200 outline-none uppercase tracking-tight ${user.role === 'ADMIN' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-600 hover:border-admin-teal transition-colors'}`}
                      >
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 border-r border-gray-100 text-center">
                      <Link href={`/stories?userId={user.id}`} className="inline-block px-3 py-1 rounded-full bg-admin-teal/10 text-admin-teal font-bold text-xs hover:bg-admin-teal hover:text-white transition-all">
                        {user._count?.posts || 0}
                      </Link>
                    </td>
                    <td className="px-6 py-4 border-r border-gray-100 text-center font-medium">
                      {user.isDeleted ? <span className="text-gray-400">Trashed</span> : 
                       user.isActive ? <span className="text-green-600">Active</span> : 
                       <span className="text-red-500">Inactive</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/users/${user.id}`} 
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" 
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        {!user.isDeleted && user.role !== 'ADMIN' && (
                          <button onClick={() => toggleStatus(user)} className={`p-1.5 rounded transition-colors ${user.isActive ? 'text-orange-500 hover:bg-orange-50' : 'text-green-500 hover:bg-green-50'}`} title={user.isActive ? "Deactivate User" : "Activate User"}>
                            {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                        )}
                        {filter === "TRASH" || user.isDeleted ? (
                          <button onClick={() => restoreUser(user.id)} className="p-1.5 text-teal-600 hover:bg-teal-50 rounded transition-colors" title="Restore User">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        ) : (
                          <button onClick={() => user.role !== 'ADMIN' && deleteUser(user.id)} disabled={user.role === 'ADMIN'} className={`p-1.5 rounded transition-colors ${user.role === 'ADMIN' ? 'text-gray-300 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'}`} title="Move to Trash">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center p-4 border-t border-gray-100 gap-2 bg-white">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 bg-admin-bg text-admin-muted rounded disabled:opacity-50 font-bold text-sm hover:bg-gray-200"
            >
              Prev
            </button>
            <span className="px-4 py-1 text-sm font-bold text-admin-text">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 bg-admin-bg text-admin-muted rounded disabled:opacity-50 font-bold text-sm hover:bg-gray-200"
            >
              Next
            </button>
          </div>
        )}
      </div>

    </AdminLayout>
  );
}
