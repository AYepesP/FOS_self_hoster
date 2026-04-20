"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0c1a35]/80 backdrop-blur-md border-b border-[rgba(42,157,152,0.2)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <svg width="32" height="32" viewBox="15 5 95 95" xmlns="http://www.w3.org/2000/svg">
            <polygon points="41.0,39.5 41.0,18.5 62.0,29.0 62.0,50.0" fill="#2a9d98"/>
            <polygon points="83.0,39.5 83.0,18.5 62.0,29.0 62.0,50.0" fill="#1b7874"/>
            <polygon points="62.0,8.0 83.0,18.5 62.0,29.0 41.0,18.5" fill="#5ececa"/>
            <polyline points="62.0,8.0 83.0,18.5 62.0,29.0 41.0,18.5 62.0,8.0" fill="none" stroke="white" strokeWidth="2.0" strokeLinejoin="round"/>
            <line x1="41.0" y1="39.5" x2="41.0" y2="18.5" stroke="white" strokeWidth="2.0"/>
            <line x1="62.0" y1="50.0" x2="62.0" y2="29.0" stroke="white" strokeWidth="2.0"/>
            <line x1="83.0" y1="39.5" x2="83.0" y2="18.5" stroke="white" strokeWidth="2.0"/>
            <line x1="41.0" y1="39.5" x2="62.0" y2="50.0" stroke="white" strokeWidth="2.0"/>
            <line x1="83.0" y1="39.5" x2="62.0" y2="50.0" stroke="white" strokeWidth="2.0"/>
            <polygon points="62.0,50.0 62.0,29.0 83.0,39.5 83.0,60.5" fill="#2a9d98"/>
            <polygon points="104.0,50.0 104.0,29.0 83.0,39.5 83.0,60.5" fill="#1b7874"/>
            <polygon points="83.0,18.5 104.0,29.0 83.0,39.5 62.0,29.0" fill="#5ececa"/>
            <polyline points="83.0,18.5 104.0,29.0 83.0,39.5 62.0,29.0 83.0,18.5" fill="none" stroke="white" strokeWidth="2.0" strokeLinejoin="round"/>
            <line x1="62.0" y1="50.0" x2="62.0" y2="29.0" stroke="white" strokeWidth="2.0"/>
            <line x1="83.0" y1="60.5" x2="83.0" y2="39.5" stroke="white" strokeWidth="2.0"/>
            <line x1="104.0" y1="50.0" x2="104.0" y2="29.0" stroke="white" strokeWidth="2.0"/>
            <line x1="62.0" y1="50.0" x2="83.0" y2="60.5" stroke="white" strokeWidth="2.0"/>
            <line x1="104.0" y1="50.0" x2="83.0" y2="60.5" stroke="white" strokeWidth="2.0"/>
            <polygon points="20.0,71.0 20.0,50.0 41.0,60.5 41.0,81.5" fill="#2a9d98"/>
            <polygon points="62.0,71.0 62.0,50.0 41.0,60.5 41.0,81.5" fill="#1b7874"/>
            <polygon points="41.0,39.5 62.0,50.0 41.0,60.5 20.0,50.0" fill="#5ececa"/>
            <polyline points="41.0,39.5 62.0,50.0 41.0,60.5 20.0,50.0 41.0,39.5" fill="none" stroke="white" strokeWidth="2.0" strokeLinejoin="round"/>
            <line x1="20.0" y1="71.0" x2="20.0" y2="50.0" stroke="white" strokeWidth="2.0"/>
            <line x1="41.0" y1="81.5" x2="41.0" y2="60.5" stroke="white" strokeWidth="2.0"/>
            <line x1="62.0" y1="71.0" x2="62.0" y2="50.0" stroke="white" strokeWidth="2.0"/>
            <line x1="20.0" y1="71.0" x2="41.0" y2="81.5" stroke="white" strokeWidth="2.0"/>
            <line x1="62.0" y1="71.0" x2="41.0" y2="81.5" stroke="white" strokeWidth="2.0"/>
            <polygon points="41.0,81.5 41.0,60.5 62.0,71.0 62.0,92.0" fill="#2a9d98"/>
            <polygon points="83.0,81.5 83.0,60.5 62.0,71.0 62.0,92.0" fill="#1b7874"/>
            <polygon points="62.0,50.0 83.0,60.5 62.0,71.0 41.0,60.5" fill="#5ececa"/>
            <polyline points="62.0,50.0 83.0,60.5 62.0,71.0 41.0,60.5 62.0,50.0" fill="none" stroke="white" strokeWidth="2.0" strokeLinejoin="round"/>
            <line x1="41.0" y1="81.5" x2="41.0" y2="60.5" stroke="white" strokeWidth="2.0"/>
            <line x1="62.0" y1="92.0" x2="62.0" y2="71.0" stroke="white" strokeWidth="2.0"/>
            <line x1="83.0" y1="81.5" x2="83.0" y2="60.5" stroke="white" strokeWidth="2.0"/>
            <line x1="41.0" y1="81.5" x2="62.0" y2="92.0" stroke="white" strokeWidth="2.0"/>
            <line x1="83.0" y1="81.5" x2="62.0" y2="92.0" stroke="white" strokeWidth="2.0"/>
          </svg>
          <span className="font-display font-bold text-[#e8f8f8] tracking-tight text-lg">almerno</span>
        </div>

        <Button
          onClick={() => document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" })}
          className="bg-[#2a9d98] hover:bg-[#1b7874] text-white text-sm font-medium px-5 py-2 rounded-full transition-all duration-200 hover:shadow-[0_0_20px_rgba(42,157,152,0.4)] cursor-pointer"
        >
          Join waitlist
        </Button>
      </div>
    </header>
  );
}
