"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Users, 
  FileVideo, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  LayoutGrid,
  Image as ImageIcon,
  MessageSquare,
  User as UserIcon,
  Wrench,
  Monitor,
  Home,
  Bell
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getImageUrl, UPLOAD_FOLDERS } from "@/lib/constants";

const navItems = [
  { 
    section: "GENERAL",
    items: [
      { name: "Dashboard", href: "/", icon: Home },
      { 
        name: "Stories", 
        icon: FileVideo, 
        hasSubmenu: true,
        subItems: [
          { name: "All Stories", href: "/stories" },
          { name: "Add New Story", href: "/stories/create" }
        ]
      },
      { name: "Notifications", href: "/notifications", icon: Bell },
      { 
        name: "Categories", 
        icon: LayoutGrid,
        hasSubmenu: true,
        subItems: [
          { name: "All Categories", href: "/categories" },
          { name: "Add New", href: "/categories/create" }
        ]
      },
      { 
        name: "Users", 
        icon: Users, 
        hasSubmenu: true,
        subItems: [
          { name: "All Users", href: "/users" },
          { name: "Add New User", href: "/users/new" }
        ]
      },
    ]
  },
  {
    section: "LIVE ON",
    items: [
      { name: "Profile", href: "/profile", icon: UserIcon },
      { name: "Settings", href: "/settings", icon: Settings },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  // Automatically expand the group containing the current path
  useEffect(() => {
    navItems.forEach(group => {
      group.items.forEach(item => {
        if (item.subItems?.some(sub => pathname === sub.href)) {
          setExpandedItem(item.name);
        }
      });
    });
  }, [pathname]);

  const toggleExpand = (name: string) => {
    setExpandedItem(prev => prev === name ? null : name);
  };


  return (
    <aside className={`${isCollapsed ? "w-16" : "w-64"} bg-[#2A3F54] flex flex-col hidden md:flex shrink-0 transition-all duration-300 z-50 h-full overflow-hidden shadow-xl`}>
      {/* 🚀 Logo Area */}
      <div className="h-16 flex items-center px-4 gap-3 bg-[#2A3F54] border-b border-[#3E4F5F]/50">
        <div className="w-10 h-10 rounded-full border-2 border-gray-300/30 flex items-center justify-center bg-[#2A3F54] shadow-inner shrink-0 group hover:border-[#1ABB9C] transition-colors cursor-pointer">
           <Monitor className="w-5 h-5 text-gray-200" />
        </div>
        {!isCollapsed && (
          <span className="text-gray-100 text-[18px] font-bold tracking-tight truncate">
            NLA Admin
          </span>
        )}
      </div>

      {/* 👤 Profile Section */}
      {!isCollapsed && (
        <div className="px-4 py-6 flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-full border-4 border-[#3E4F5F] overflow-hidden shadow-lg">
              {user?.profile?.avatarUrl ? (
                <img 
                  src={getImageUrl(user.profile.avatarUrl, UPLOAD_FOLDERS.AVATARS) || ""} 
                  alt="Admin" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full bg-[#3E4F5F] flex items-center justify-center text-gray-400">
                  <UserIcon className="w-6 h-6" />
                </div>
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[#2A3F54] rounded-full shadow-sm"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-400 text-[12px] font-medium">Welcome,</span>
            <span className="text-gray-100 text-[14px] font-bold truncate max-w-[120px]">
              {user?.profile?.fullName || "Admin User"}
            </span>
          </div>
        </div>
      )}

      {/* 🧭 Navigation */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar pt-2 pb-10">
        {navItems.map((group) => (
          <div key={group.section} className="mb-6">
            {!isCollapsed && (
              <h3 className="px-4 py-2 text-[11px] font-black text-[#E7E7E7]/40 uppercase tracking-[2px] mb-1">
                {group.section}
              </h3>
            )}
            <div className="space-y-[2px]">
              {group.items.map((item) => {
                const isExpanded = expandedItem === item.name;
                const hasActiveSubItem = item.subItems?.some(sub => pathname === sub.href);
                const isActive = pathname === item.href || hasActiveSubItem;
                
                return (
                  <div key={item.name}>
                    {item.subItems ? (
                      <button
                        onClick={() => toggleExpand(item.name)}
                        className={`w-full relative flex items-center justify-between px-4 py-3.5 transition-all group ${
                          isActive
                            ? "bg-[#3E4F5F] text-white"
                            : "text-[#E7E7E7] hover:bg-[#3E4F5F] hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "text-gray-400 group-hover:text-white transition-colors"}`} />
                          {!isCollapsed && <span className="text-[13px] font-medium">{item.name}</span>}
                        </div>
                        {!isCollapsed && (
                          <ChevronRight className={`w-3.5 h-3.5 text-gray-500 group-hover:text-white transition-all ${isExpanded ? "rotate-90" : ""}`} />
                        )}
                        {isActive && <div className="absolute right-0 top-0 h-full w-[3px] bg-[#1ABB9C]"></div>}
                      </button>
                    ) : (
                      <Link
                        href={item.href || "#"}
                        className={`relative flex items-center justify-between px-4 py-3.5 transition-all group ${
                          isActive
                            ? "bg-[#3E4F5F] text-white"
                            : "text-[#E7E7E7] hover:bg-[#3E4F5F] hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "text-gray-400 group-hover:text-white transition-colors"}`} />
                          {!isCollapsed && <span className="text-[13px] font-medium">{item.name}</span>}
                        </div>
                        {isActive && <div className="absolute right-0 top-0 h-full w-[3px] bg-[#1ABB9C]"></div>}
                      </Link>
                    )}

                    {/* Submenu */}
                    {!isCollapsed && item.subItems && isExpanded && (
                      <div className="bg-[#2A3F54] animate-in slide-in-from-top-2 duration-200">
                        {item.subItems.map((sub) => {
                          const isSubActive = pathname === sub.href;
                          return (
                            <Link
                              key={sub.name}
                              href={sub.href}
                              className={`flex items-center gap-3 pl-12 pr-4 py-2 text-[12.5px] transition-all relative ${
                                isSubActive ? "text-white font-bold" : "text-[#E7E7E7]/70 hover:text-white hover:pl-13"
                              }`}
                            >
                              {/* Connector Line */}
                              <div className="absolute left-7 top-0 bottom-0 w-[1px] bg-[#3E4F5F]"></div>
                              <div className="absolute left-7 top-1/2 w-3 h-[1px] bg-[#3E4F5F]"></div>
                              
                              <span>{sub.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* 🔌 Footer / Collapse */}
      <div className="p-4 border-t border-[#3E4F5F]/30 bg-[#2A3F54]/50">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center justify-center w-full h-10 bg-[#3E4F5F] hover:bg-[#4A5F6F] text-gray-300 rounded transition-all shadow-sm"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
    </aside>
  );
}
