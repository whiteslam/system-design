import React from 'react';
import { Icon } from './Icon';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <Icon className="h-8 w-8 shrink-0" />
      <span className="font-sans tracking-tight font-bold text-lg">
        <span className="text-white">ArchFlow</span>
        <span className="text-primary ml-1">AI</span>
      </span>
    </div>
  );
}
