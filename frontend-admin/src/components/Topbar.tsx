"use client";

import { 
  Bell, 
  Menu, 
  User as UserIcon,
  LogOut,
  ChevronRight,
  Settings,
  X,
  Check
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { fetchApi } from "@/lib/api";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getImageUrl, UPLOAD_FOLDERS } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

export default function Topbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const prevUnreadCount = useRef(0);

  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 20000); // Refresh every 20 seconds for faster updates
      return () => clearInterval(interval);
    }
  }, [user]);

  const playNotificationSound = () => {
    try {
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
      audio.volume = 0.5;
      audio.play().catch(e => console.log("Audio play blocked by browser policy"));
    } catch (e) {
      console.error("Failed to play sound:", e);
    }
  };

  const loadNotifications = async () => {
    try {
      const res = await fetchApi("/admin/notifications");
      const notifs = res.data || [];
      const newCount = notifs.filter((n: any) => !n.isRead).length;
      
      // Play sound if new notifications arrived
      if (newCount > prevUnreadCount.current) {
        playNotificationSound();
      }
      
      prevUnreadCount.current = newCount;
      setNotifications(notifs);
      setUnreadCount(newCount);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetchApi("/admin/notifications/read-all", { method: "POST" });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleNotificationClick = async (notif: any) => {
    try {
      // Mark as read
      if (!notif.isRead) {
        await fetchApi(`/admin/notifications/${notif.id}/read`, { method: "PUT" });
      }
      
      setShowNotifications(false);
      
      // Redirect based on link or type
      if (notif.link) {
        router.push(notif.link);
      } else {
        const type = notif.type || "";
        if (type.includes("STORY") && notif.data?.postId) {
          router.push(`/stories/${notif.data.postId}`);
        } else if (type.includes("USER") && notif.data?.userId) {
          router.push(`/users/${notif.data.userId}`);
        } else {
          loadNotifications(); // Just refresh if no specific route
        }
      }
    } catch (error) {
      console.error("Notification action failed:", error);
    }
  };

  return (
    <>
      <header className="h-16 bg-[#EDEDED] flex items-center justify-between px-4 lg:px-6 shrink-0 z-[60] border-b border-gray-300/50 shadow-sm relative">
        {/* Left Side: Mobile Menu Toggle */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="text-[#5A738E] hover:text-admin-teal transition-colors lg:hidden"
          >
             <Menu className="w-6 h-6" />
          </button>
          
          <div className="hidden lg:block">
            <button className="text-[#5A738E] hover:text-admin-teal transition-colors">
               <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right Side: Profile & Notifications */}
        <div className="flex items-center gap-2 sm:gap-6 h-full">
          {/* Notifications Dropdown */}
          <div className="relative h-full flex items-center">
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className={`text-[#5A738E] hover:text-admin-teal transition-colors relative p-2 rounded-full hover:bg-gray-200/50 ${showNotifications ? 'bg-gray-200/50 text-admin-teal' : ''}`}
            >
               <Bell className="w-5 h-5" />
               {unreadCount > 0 && (
                 <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-[#EDEDED]">
                   {unreadCount > 9 ? '9+' : unreadCount}
                 </span>
               )}
            </button>

            {showNotifications && (
              <div 
                onMouseLeave={() => setShowNotifications(false)}
                className="absolute right-0 top-[110%] w-72 sm:w-80 bg-white border border-gray-200 shadow-2xl rounded-xl py-0 z-[70] animate-in fade-in slide-in-from-top-2 overflow-hidden"
              >
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                  <h3 className="font-bold text-gray-800 text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-[10px] text-admin-teal font-black uppercase tracking-widest hover:underline"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.filter(n => !n.isRead).length > 0 ? (
                    notifications.filter(n => !n.isRead).map((notif) => (
                      <div 
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`px-5 py-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors group relative ${!notif.isRead ? 'bg-blue-50/30' : ''}`}
                      >
                        {!notif.isRead && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-admin-teal rounded-full"></div>}
                        <p className={`text-[12.5px] leading-snug ${!notif.isRead ? 'text-gray-900 font-bold' : 'text-gray-600'}`}>
                          {notif.message}
                        </p>
                        <span className="text-[10px] text-gray-400 mt-1 block">
                          {formatDistanceToNow(new Date(notif.createdAt))} ago
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 px-5 text-center">
                      <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                      <p className="text-xs text-gray-400 font-medium">No new notifications</p>
                    </div>
                  )}
                </div>
                <div className="p-2 text-center bg-gray-50 border-t border-gray-100">
                  <Link 
                    href="/notifications" 
                    className="text-[11px] text-admin-teal font-black uppercase tracking-wider hover:underline block w-full"
                    onClick={() => setShowNotifications(false)}
                  >
                    View All Notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="relative h-full flex items-center">
            <button 
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className={`flex items-center gap-1.5 sm:gap-3 px-1.5 sm:px-3 h-10 rounded-lg hover:bg-gray-200/50 transition-all group ${showUserMenu ? 'bg-gray-200/50' : ''}`}
            >
              <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden border border-gray-400/50 shadow-sm shrink-0">
                 {user?.profile?.avatarUrl ? (
                   <img 
                     src={getImageUrl(user.profile.avatarUrl, UPLOAD_FOLDERS.AVATARS) || ""} 
                     alt="Profile" 
                     className="w-full h-full object-cover" 
                   />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-[#5A738E]">
                     <UserIcon className="w-4 h-4" />
                   </div>
                 )}
              </div>
              <span className="text-[#5A738E] font-bold text-sm hidden sm:inline">
                {user?.profile?.fullName?.split(' ')[0] || "Admin"}
              </span>
              <ChevronRight className={`w-3.5 h-3.5 text-[#5A738E] transition-transform duration-200 ${showUserMenu ? "rotate-90" : ""}`} />
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div 
                onMouseLeave={() => setShowUserMenu(false)}
                className="absolute right-0 top-[110%] w-56 bg-white border border-gray-200 shadow-2xl rounded-xl py-3 z-[70] animate-in fade-in slide-in-from-top-2"
              >
                <div className="px-5 py-3 border-b border-gray-50 mb-2">
                  <p className="font-black text-gray-900 text-sm">{user?.profile?.fullName}</p>
                  <p className="text-[11px] text-gray-500 truncate mt-0.5">{user?.email}</p>
                </div>
                <Link 
                  href="/profile" 
                  className="flex items-center gap-3 px-5 py-2.5 text-sm text-[#5A738E] hover:bg-gray-50 hover:text-admin-teal transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  <UserIcon className="w-4 h-4" />
                  Your Profile
                </Link>
                <Link 
                  href="/settings" 
                  className="flex items-center gap-3 px-5 py-2.5 text-sm text-[#5A738E] hover:bg-gray-50 hover:text-admin-teal transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <div className="h-px bg-gray-50 my-2 mx-4"></div>
                <button 
                  onClick={logout}
                  className="w-full text-left px-5 py-2.5 text-sm text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {showMobileMenu && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-[100] animate-in fade-in duration-300"
            onClick={() => setShowMobileMenu(false)}
          ></div>
          <div className="fixed left-0 top-0 bottom-0 w-64 bg-[#2A3F54] z-[101] shadow-2xl animate-in slide-in-from-left duration-300 overflow-y-auto">
            <div className="p-4 border-b border-[#3E4F5F] flex justify-between items-center h-16">
              <span className="text-white font-bold">NLA Admin</span>
              <button onClick={() => setShowMobileMenu(false)} className="text-white p-1">
                <ChevronRight className="w-6 h-6 rotate-180" />
              </button>
            </div>
            <div className="p-4">
               {/* Note: In a real app, we'd reuse the Sidebar component here or extract the menu logic */}
               <p className="text-gray-400 text-xs mb-4 uppercase tracking-widest font-black">Quick Navigation</p>
               <nav className="space-y-1">
                  <Link href="/" className="block p-3 text-white hover:bg-[#3E4F5F] rounded transition-colors" onClick={() => setShowMobileMenu(false)}>Dashboard</Link>
                  <Link href="/stories" className="block p-3 text-white hover:bg-[#3E4F5F] rounded transition-colors" onClick={() => setShowMobileMenu(false)}>Stories</Link>
                  <Link href="/stories/create" className="block p-3 pl-8 text-white/70 hover:bg-[#3E4F5F] rounded transition-colors text-sm" onClick={() => setShowMobileMenu(false)}>+ Add New Story</Link>
                  <Link href="/categories" className="block p-3 text-white hover:bg-[#3E4F5F] rounded transition-colors" onClick={() => setShowMobileMenu(false)}>Categories</Link>
                  <Link href="/categories/create" className="block p-3 pl-8 text-white/70 hover:bg-[#3E4F5F] rounded transition-colors text-sm" onClick={() => setShowMobileMenu(false)}>+ Add New Category</Link>
                  <Link href="/users" className="block p-3 text-white hover:bg-[#3E4F5F] rounded transition-colors" onClick={() => setShowMobileMenu(false)}>Users</Link>
                  <Link href="/profile" className="block p-3 text-white hover:bg-[#3E4F5F] rounded transition-colors" onClick={() => setShowMobileMenu(false)}>My Profile</Link>
               </nav>
            </div>
          </div>
        </>
      )}
    </>
  );
}
