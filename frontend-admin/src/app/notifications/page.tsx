"use client";

import AdminLayout from "@/components/AdminLayout";
import { fetchApi } from "@/lib/api";
import { useEffect, useState, useCallback } from "react";
import { 
  Bell, 
  CheckCircle, 
  Trash2, 
  Clock, 
  Info, 
  User, 
  Layers, 
  ArrowRight,
  Filter,
  Check,
  Zap,
  MoreVertical,
  Inbox,
  X,
  MessageSquare,
  Share2
} from "lucide-react";
import Swal from "sweetalert2";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL"); 

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchApi("/admin/notifications");
      setNotifications(res.data || []);
    } catch (error: any) {
      console.error("Failed to load notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markAllAsRead = async () => {
    try {
      await fetchApi("/admin/notifications/read-all", { method: "POST" });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'All marked as read', showConfirmButton: false, timer: 3000 });
    } catch (error: any) {
      Swal.fire({ icon: 'error', title: 'Action failed', text: error.message });
    }
  };

  const deleteNotification = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      // Assuming there's a delete endpoint
      await fetchApi(`/admin/notifications/${id}`, { method: "DELETE" });
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleNotificationClick = async (notif: any) => {
    try {
      if (!notif.isRead) {
        await fetchApi(`/admin/notifications/${notif.id}/read`, { method: "PUT" });
      }
      
      if (notif.link) {
        router.push(notif.link);
      } else {
        const type = inferType(notif);
        if (type.includes("STORY")) {
          router.push("/stories");
        } else if (type.includes("USER")) {
          router.push("/users");
        } else {
          loadNotifications();
        }
      }
    } catch (error) {
      console.error("Notification action failed:", error);
    }
  };

  const getAuthorName = (notif: any) => {
    const message = notif.message || "";
    const type = inferType(notif);
    
    if (type === "USER_REGISTERED") {
      // Format: "Full Name (email) has joined..."
      const match = message.match(/^(.*?)\s\(/);
      return match ? match[1] : "New Athlete";
    }
    
    if (type === "STORY_SUBMITTED") {
      // Format: "New content "Title" has been submitted..."
      // We don't have the author in the message usually, 
      // but let's try to find if it's there.
      return "Platform Submission";
    }
    
    return "System Admin";
  };

  const inferType = (notif: any) => {
    if (notif.type) return notif.type;
    const title = (notif.title || "").toUpperCase();
    const link = (notif.link || "").toUpperCase();
    
    if (title.includes("USER") || title.includes("REGISTRATION") || link.includes("USER")) return "USER_REGISTERED";
    if (title.includes("STORY") || title.includes("CONTENT") || link.includes("STORIES")) return "STORY_SUBMITTED";
    if (title.includes("COMMENT")) return "COMMENT";
    return "MESSAGE";
  };

  const getIcon = (notif: any) => {
    const type = inferType(notif);
    if (type.includes("USER")) return <User className="w-5 h-5" />;
    if (type.includes("STORY")) return <Layers className="w-5 h-5" />;
    if (type.includes("COMMENT")) return <MessageSquare className="w-5 h-5" />;
    return <Bell className="w-5 h-5" />;
  };

  const getBadge = (notif: any) => {
    const type = inferType(notif);
    if (type.includes("USER")) return <span className="bg-[#1ABB9C] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">New User Added</span>;
    if (type.includes("STORY")) return <span className="bg-[#3498DB] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">New Story</span>;
    if (type.includes("COMMENT")) return <span className="bg-[#9B59B6] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">Comment</span>;
    return <span className="bg-[#F39C12] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">Message</span>;
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === "UNREAD") return !n.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <AdminLayout>
      <div className="relative min-h-[80vh]">
        {/* Background Watermark */}
        <div className="absolute -top-10 -right-10 text-[120px] font-black text-gray-100/50 pointer-events-none select-none z-0">
          Notifications
        </div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <div>
              <h1 className="text-[22px] font-bold text-gray-700 uppercase tracking-wide">NOTIFICATIONS</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-admin-teal text-white rounded-lg text-[13px] font-black uppercase tracking-widest shadow-lg shadow-admin-teal/20 transition-all disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                Mark All Read
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Filters */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5" /> Filtering
                </h3>
                <div className="space-y-1">
                  {[
                    { id: "ALL", label: "All Activity", count: notifications.length, icon: Inbox },
                    { id: "UNREAD", label: "Unread Only", count: unreadCount, icon: Bell },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setActiveFilter(f.id)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded transition-all ${activeFilter === f.id ? "bg-[#2A3F54] text-white shadow-md" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                      <div className="flex items-center gap-3">
                        <f.icon className={`w-3.5 h-3.5 ${activeFilter === f.id ? "text-white" : "text-gray-400"}`} />
                        <span className="text-[13px] font-bold">{f.label}</span>
                      </div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded ${activeFilter === f.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                        {f.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Notification List (Matching Image Design) */}
            <div className="lg:col-span-3">
              <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden min-h-[400px]">
                {isLoading ? (
                  <div className="p-10 text-center text-gray-400 italic">Loading...</div>
                ) : filteredNotifications.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {filteredNotifications.map((notif) => (
                      <div 
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-6 sm:p-8 flex gap-6 items-start transition-all cursor-pointer hover:bg-gray-50 group relative ${!notif.isRead ? 'bg-blue-50/20' : ''}`}
                      >
                        {/* Left Icon / Action */}
                        <div className="shrink-0">
                          <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-500 transition-all">
                            {getIcon(notif)}
                          </div>
                        </div>

                        {/* Content Hub */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                             {getBadge(notif)}
                          </div>
                          <h4 className="text-[15px] font-bold text-gray-800 mb-1 group-hover:text-admin-teal transition-colors">
                            {notif.type?.includes("USER") ? "New Registration: Platform Onboarding" : notif.message.split(":")[0]}
                          </h4>
                          <p className="text-[13px] text-gray-400 leading-relaxed max-w-2xl">
                             {notif.message}
                          </p>
                          <div className="mt-2">
                            <span className="text-[12px] font-bold text-red-500">
                              {getAuthorName(notif)}
                            </span>
                          </div>
                        </div>

                        {/* Right Timestamp */}
                        <div className="hidden sm:flex items-center gap-2 text-gray-400 whitespace-nowrap pt-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-medium">
                            {format(new Date(notif.createdAt), "dd MMM yyyy 'at' p")}
                          </span>
                        </div>

                        {!notif.isRead && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-admin-teal"></div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-32 text-center">
                    <Inbox className="w-16 h-16 text-gray-100 mx-auto mb-4" />
                    <p className="text-gray-400 font-medium">No records found matching your filters.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
