import React from 'react';

/**
 * Lucide-style Outline Stroke Laddu Icon with Cashew Garnish & Boondi Texture
 * Matches 100% of the site's stroke icon aesthetic (strokeWidth=2, currentColor)
 */
export function LadduIcon({ className = "w-5 h-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Outer Laddu Spherical Outline */}
      <circle cx="12" cy="12" r="9" />

      {/* Cashew / Garnish on top-right (inspired by reference image) */}
      <path d="M11.5 5.8c.8-.7 3.5-.3 4 1.8.4 1.5-1.1 2.2-2.5 1.5-.9-.6-1.3-1.8-1.5-3.3z" />

      {/* Textured Boondi Speckles */}
      <circle cx="8" cy="10.5" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="7.5" cy="14.5" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="11" cy="13" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="15" cy="13.5" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="11.5" cy="17" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="15" cy="10" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="14" cy="16.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}
