"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Status = "idle" | "loading" | "success" | "error";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName }),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 py-6 animate-reveal-fade">
        <div className="w-12 h-12 rounded-full bg-[#2a9d98]/20 border border-[#2a9d98]/40 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 10l4.5 4.5 7.5-8" stroke="#2a9d98" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="font-display text-lg font-semibold text-[#e8f8f8]">You&apos;re on the list.</p>
        <p className="text-sm text-[#5a8a87] text-center max-w-xs">
          We&apos;ll email you when early access opens. No spam — ever.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex flex-col gap-1.5">
          <Label htmlFor="email" className="text-xs text-[#5a8a87] uppercase tracking-widest font-medium">
            Email <span className="text-[#2a9d98]">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-white/5 border-white/10 text-[#e8f8f8] placeholder:text-[#5a8a87] focus:border-[#2a9d98]/60 focus:ring-[#2a9d98]/30 h-11 rounded-xl"
          />
        </div>
        <div className="flex-1 flex flex-col gap-1.5">
          <Label htmlFor="firstName" className="text-xs text-[#5a8a87] uppercase tracking-widest font-medium">
            First name <span className="text-[#5a8a87]">(optional)</span>
          </Label>
          <Input
            id="firstName"
            type="text"
            placeholder="Alex"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="bg-white/5 border-white/10 text-[#e8f8f8] placeholder:text-[#5a8a87] focus:border-[#2a9d98]/60 focus:ring-[#2a9d98]/30 h-11 rounded-xl"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={status === "loading" || !email}
        className="w-full h-12 bg-[#2a9d98] hover:bg-[#1b7874] text-white font-display font-semibold text-base rounded-xl transition-all duration-200 hover:shadow-[0_0_30px_rgba(42,157,152,0.35)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {status === "loading" ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Reserving your spot…
          </span>
        ) : (
          "Get early access →"
        )}
      </Button>

      {status === "error" && (
        <p className="text-sm text-red-400 text-center animate-reveal-fade">{errorMsg}</p>
      )}

      <p className="text-xs text-[#5a8a87] text-center leading-relaxed">
        No spam. Unsubscribe any time.{" "}
        <span className="text-[#2a9d98]/70">We never sell your data.</span>
      </p>
    </form>
  );
}
