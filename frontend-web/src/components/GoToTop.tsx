"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function GoToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div
      className={`fixed bottom-8 right-8 z-[100] transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
      }`}
    >
      <button
        onClick={scrollToTop}
        className="w-12 h-12 bg-brand-yellow text-black rounded-full flex items-center justify-center hover:bg-yellow-400 hover:scale-110 active:scale-95 transition-all shadow-xl border-2 border-transparent hover:border-black/10"
        aria-label="Go to top"
      >
        <ArrowUp className="w-6 h-6 stroke-[3]" />
      </button>
    </div>
  );
}
