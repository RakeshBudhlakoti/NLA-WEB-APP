import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import GoToTop from "@/components/GoToTop";
import { AuthProvider } from "@/context/AuthContext";
import { SettingsProvider } from "@/context/SettingsContext";
import ToastProvider from "@/components/providers/ToastProvider";

const outfit = Outfit({ 
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-outfit'
});


export async function generateMetadata(): Promise<Metadata> {
  const API_BASE_URL = 'http://localhost:5000/api/v1';
  try {
    const res = await fetch(`${API_BASE_URL}/settings`, { cache: 'no-store' });
    const json = await res.json();
    const settings = json.data;
    
    return {
      title: settings?.metaTitle || "NLA Sports | Stories & Profiles",
      description: settings?.metaDescription || "Discover inspiring stories from athletes around the world.",
    };
  } catch (error) {
    return {
      title: "NLA Sports | Stories & Profiles",
      description: "Discover inspiring stories from athletes around the world.",
    };
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${outfit.className} min-h-screen flex flex-col antialiased`}>
        <AuthProvider>
          <SettingsProvider>
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <GoToTop />
            <ToastProvider />
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
