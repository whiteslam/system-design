import React from 'react';

export function Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="archflow-flow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6"/>
          <stop offset="100%" stopColor="#06b6d4"/>
        </linearGradient>
      </defs>
      {/* Background Layer Architecture */}
      <path d="M20 75 L50 25 L80 75" stroke="#1f2937" strokeWidth="4" strokeDasharray="2 4"/>
      {/* Flow Lines */}
      <path d="M20 75 L38 45 M80 75 L62 45 M35 55 L65 55" stroke="url(#archflow-flow-grad)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
      {/* System Nodes */}
      <circle cx="50" cy="25" r="7" fill="#ffffff" stroke="#3b82f6" strokeWidth="3"/>
      <circle cx="20" cy="75" r="7" fill="#030712" stroke="#3b82f6" strokeWidth="4"/>
      <circle cx="80" cy="75" r="7" fill="#030712" stroke="#06b6d4" strokeWidth="4"/>
    </svg>
  );
}
