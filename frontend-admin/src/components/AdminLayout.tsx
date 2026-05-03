"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user && pathname !== "/login") {
      router.push("/login");
    }
  }, [user, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-admin-bg">
        <span className="w-8 h-8 border-4 border-admin-teal/30 border-t-admin-teal rounded-full animate-spin"></span>
      </div>
    );
  }

  if (!user && pathname === "/login") {
    return <>{children}</>;
  }

  if (!user) return null;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f0f0f1]">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-[#f0f0f1]">
          {children}
        </main>
      </div>
    </div>
  );
}
