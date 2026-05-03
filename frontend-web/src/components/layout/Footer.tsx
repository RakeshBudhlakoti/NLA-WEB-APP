"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { getImageUrl, UPLOAD_FOLDERS } from "@/lib/constants";

export default function Footer() {
  const { settings } = useSettings();

  return (
    <footer className="bg-gray-50 border-t border-gray-100/50 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center mb-6">
              {settings.logoUrl ? (
                <img src={getImageUrl(settings.logoUrl, UPLOAD_FOLDERS.LOGOS) || ""} alt={settings.siteName} className="h-10 w-auto object-contain" />
              ) : (
                <>
                  <span className="text-3xl font-black text-gradient-insta tracking-tighter">NLA</span>
                  <span className="text-3xl font-black text-[#8134AF] tracking-tighter ml-1">WRESTLING</span>
                </>
              )}
            </Link>
            <p className="text-muted text-sm max-w-sm mb-6 leading-relaxed">
              A centralized hub for the wrestling and athletics community to share journeys, celebrate success, and inspire the next generation of champions.
            </p>
            <div className="flex gap-4">
              {settings.instagramUrl && (
                <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-surface-hover flex items-center justify-center text-muted hover:text-brand-yellow transition-colors shadow-sm">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
              )}
              {settings.twitterUrl && (
                <a href={settings.twitterUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-surface-hover flex items-center justify-center text-muted hover:text-brand-yellow transition-colors shadow-sm">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                </a>
              )}
              {settings.facebookUrl && (
                <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-surface-hover flex items-center justify-center text-muted hover:text-brand-yellow transition-colors shadow-sm">
                   <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-gray-900 font-bold mb-6 tracking-wide uppercase text-sm">Quick Links</h4>
            <ul className="space-y-4 text-sm text-muted">
              <li><Link href="/" className="hover:text-brand-yellow transition-colors">Home</Link></li>
              <li><Link href="/stories" className="hover:text-brand-yellow transition-colors">Community Stories</Link></li>
              <li><Link href="/submit" className="hover:text-brand-yellow transition-colors">Share Your Journey</Link></li>
              <li><Link href="/login" className="hover:text-brand-yellow transition-colors">Login / Register</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-gray-900 font-bold mb-6 tracking-wide uppercase text-sm">Contact Us</h4>
            <ul className="space-y-4 text-sm text-muted">
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-brand-blue shrink-0" />
                <span>{settings.contactEmail}</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-gray-100/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted text-xs">
            © {new Date().getFullYear()} {settings.siteName}. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-muted">
            <Link href="/privacy-policy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
            <Link href="/terms-of-service" className="hover:text-gray-900 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
