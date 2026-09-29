const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React from "react";

// Brand logo for DukaanIQ.
// LogoMark: a vector storefront + brain-circuit icon matching the supplied
// brand mark (gradient awning, orange sparks, circuit memory inside).
// Logo: horizontal lockup (mark + "DukaanIQ" wordmark) that adapts to light/dark.
// LogoFull: the supplied PNG (icon + wordmark + tagline) for places with a
// light background (e.g. the dashboard sidebar).

export const LOGO_PNG =
  "https://media.db.com/images/public/6ab955a9f9ec0f8217935c0f/1f452f32c_dukaanIQ_logo.png";

export function LogoMark({ className = "h-8 w-8" }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="DukaanIQ"
    >
      <defs>
        <linearGradient id="diqGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
      </defs>
      {/* orange sparks above the roof */}
      <g stroke="#F59E0B" strokeWidth="3" strokeLinecap="round">
        <line x1="32" y1="3" x2="32" y2="11" />
        <line x1="22" y1="5" x2="24" y2="11" />
        <line x1="42" y1="5" x2="40" y2="11" />
      </g>
      {/* awning stripes */}
      <g>
        <rect x="9" y="13" width="6.5" height="11" rx="1.5" fill="url(#diqGrad)" />
        <rect x="16.5" y="13" width="6.5" height="11" rx="1.5" fill="#3B82F6" opacity="0.82" />
        <rect x="24" y="13" width="6.5" height="11" rx="1.5" fill="url(#diqGrad)" />
        <rect x="31.5" y="13" width="6.5" height="11" rx="1.5" fill="#6366F1" opacity="0.88" />
        <rect x="39" y="13" width="6.5" height="11" rx="1.5" fill="url(#diqGrad)" />
        <rect x="46.5" y="13" width="6.5" height="11" rx="1.5" fill="#6366F1" />
      </g>
      {/* shop body */}
      <rect
        x="11"
        y="26"
        width="42"
        height="32"
        rx="3.5"
        stroke="url(#diqGrad)"
        strokeWidth="3"
        fill="none"
      />
      {/* brain / memory circuit inside */}
      <g stroke="url(#diqGrad)" strokeWidth="2" fill="none" strokeLinecap="round">
        <line x1="24" y1="37" x2="40" y2="37" />
        <line x1="24" y1="37" x2="32" y2="48" />
        <line x1="40" y1="37" x2="32" y2="48" />
      </g>
      <g>
        <circle cx="24" cy="37" r="3" fill="#3B82F6" />
        <circle cx="40" cy="37" r="3" fill="#6366F1" />
        <circle cx="32" cy="48" r="3" fill="#6366F1" />
      </g>
    </svg>
  );
}

export default function Logo({ tone = "dark", className = "", markClass = "h-8 w-8" }) {
  const word = tone === "light" ? "text-white" : "text-[#0B2D5B]";
  const iq = tone === "light" ? "text-[#A5B4FC]" : "text-[#6366F1]";
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark className={markClass} />
      <span className={`font-bold text-lg tracking-tight leading-none ${word}`}>
        Dukaan<span className={iq}>IQ</span>
      </span>
    </span>
  );
}

export function LogoFull({ className = "h-12 w-auto" }) {
  return (
    <img
      src={LOGO_PNG}
      alt="DukaanIQ — Your shop. Your memory. Your intelligence."
      className={className}
    />
  );
}