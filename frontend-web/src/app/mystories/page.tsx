"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MyStoriesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="flex-1 flex justify-center items-center h-screen bg-background">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-yellow"></div>
    </div>
  );
}
