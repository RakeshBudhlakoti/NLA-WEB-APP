"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Bookmark, Trophy } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { getImageUrl, UPLOAD_FOLDERS } from "@/lib/constants";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { settings } = useSettings();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Stories", href: "/stories" },
    { name: "Leaderboard", href: "/leaderboard" },
    ...(user ? [{ name: "Dashboard", href: "/dashboard" }] : []),
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="w-full sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b border-gray-100/50 transition-all">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-8">

        {/* Logo */}
        <Link href="/" className="flex items-center z-50" onClick={() => setIsMobileMenuOpen(false)}>
          {settings.logoUrl ? (
            <img src={getImageUrl(settings.logoUrl, UPLOAD_FOLDERS.LOGOS) || ""} alt={settings.siteName} className="h-10 md:h-12 w-auto object-contain" />
          ) : (
            <div className="flex items-center">
              <span className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter">NLA</span>
              <div className="w-1.5 h-1.5 rounded-full bg-brand-red mx-1.5 mt-2" />
              <span className="text-2xl md:text-3xl font-black text-gray-400 tracking-tighter">SPORTS</span>
            </div>
          )}
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`px-5 py-2 rounded-full text-base font-bold tracking-tight transition-all duration-300 ${isActive ? 'text-[#C11E6A]' : 'text-gray-500 hover:text-[#C11E6A]'}`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Right Actions (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-6">
              <Link
                href="/bookmarks"
                className="w-10 h-10 rounded-full flex items-center justify-center text-gray-300 hover:text-brand-red transition-all"
                title="Saved stories"
              >
                <Bookmark className="w-5 h-5" />
              </Link>

              <div className="relative group">
                <button 
                  className="flex items-center gap-3 pl-1 pr-4 py-1.5 bg-gray-50/50 hover:bg-gray-100/50 rounded-full transition-all group border border-gray-100/50"
                >
                  <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden border border-gray-100 shadow-sm">
                    {user.profile?.avatarUrl ? (
                      <img src={getImageUrl(user.profile.avatarUrl, UPLOAD_FOLDERS.AVATARS) || ""} alt={user.profile.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] font-black text-white">{user.profile?.fullName?.charAt(0) || user.email.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <span className="text-[13px] font-bold text-gray-900 truncate max-w-[100px]">
                    {user.profile?.fullName?.split(' ')[0] || "Athlete"}
                  </span>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[110] translate-y-2 group-hover:translate-y-0">
                  <div className="w-56 bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden py-3">
                    <Link href="/dashboard" className="flex items-center gap-3 px-6 py-3 text-[13px] font-semibold text-gray-500 hover:text-[#C11E6A] hover:bg-red-50/20 transition-all">
                      Dashboard
                    </Link>
                    <Link href="/edit-profile" className="flex items-center gap-3 px-6 py-3 text-[13px] font-semibold text-gray-500 hover:text-[#C11E6A] hover:bg-red-50/20 transition-all">
                      Profile Settings
                    </Link>
                    <div className="h-px bg-gray-50 mx-6 my-2" />
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-6 py-3 text-[13px] font-semibold text-gray-500 hover:text-brand-red hover:bg-red-50/20 transition-all"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>

              <Link
                href="/submit"
                className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-7 py-3 text-[10px] font-black text-white hover:bg-black transition-all shadow-xl shadow-zinc-200 active:scale-95 duration-200 uppercase tracking-[0.2em]"
              >
                Share Story
              </Link>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-brand-red px-8 py-3 text-[10px] font-black text-white hover:bg-red-600 transition-all shadow-xl shadow-red-100 active:scale-95 duration-200 uppercase tracking-[0.2em]"
            >
              Athlete Login
            </Link>
          )}
        </div>

        {/* Mobile Actions */}
        <div className="md:hidden flex items-center gap-4 z-50">
          {user && (
            <Link href="/dashboard" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 overflow-hidden">
               {user.profile?.avatarUrl ? (
                  <img src={getImageUrl(user.profile.avatarUrl, UPLOAD_FOLDERS.AVATARS) || ""} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] font-black text-gray-400 uppercase">{user.profile?.fullName?.charAt(0)}</span>
                )}
            </Link>
          )}
          <button
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-900 text-white shadow-lg"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full px-6 py-10 flex flex-col gap-3 shadow-2xl bg-white border-t border-gray-50 animate-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col gap-1 mb-6">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-4 mb-2">Navigation</p>
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-5 py-4 rounded-2xl text-lg font-semibold transition-all ${isActive ? 'text-[#C11E6A] bg-red-50/30' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {user ? (
            <div className="space-y-3">
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-4 mb-2">Account</p>
              <Link 
                href="/bookmarks" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-5 py-4 rounded-2xl text-sm font-black uppercase tracking-widest flex items-center gap-3 text-gray-400 bg-gray-50/50"
              >
                <Bookmark className="w-4 h-4" /> Saved Stories
              </Link>
              <Link 
                href="/submit" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex w-full items-center justify-center rounded-2xl bg-zinc-900 px-6 py-5 text-sm font-black text-white shadow-xl shadow-zinc-100"
              >
                SHARE YOUR JOURNEY
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full px-5 py-5 rounded-2xl text-sm font-black uppercase tracking-widest text-brand-red border-2 border-red-50 mt-4"
              >
                SIGN OUT
              </button>
            </div>
          ) : (
            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}
              className="flex w-full items-center justify-center rounded-2xl bg-brand-red px-6 py-5 text-sm font-black text-white shadow-xl shadow-red-100"
            >
              LOG IN TO NLA
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
