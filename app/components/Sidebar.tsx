"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const NAV = [
  {
    href: '/',
    label: 'Dashboard',
    icon: (
      <path d="M3 13h4v7H3v-7Zm7-6h4v13h-4V7Zm7 3h4v10h-4V10Z" />
    ),
  },
  {
    href: '/logs',
    label: 'Logs',
    icon: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="1.5" />
        <path d="M7 9h6M7 12.5h10M7 16h8" />
      </>
    ),
  },
  {
    href: '/developer',
    label: 'Developer',
    icon: (
      <path d="m8 8-4 4 4 4M16 8l4 4-4 4M13 5l-2 14" />
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('sb:collapsed');
      setCollapsed(stored === '1');
    } catch {
      /* ignore */
    } finally {
      setMounted(true);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem('sb:collapsed', collapsed ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [collapsed, mounted]);

  return (
    <aside
      aria-label="Sidebar"
      className={`flex items-center gap-3 border-b border-[#2a3441] bg-[#0f1419] px-3 transition-[width,height] duration-200 ease-in-out md:flex-col md:items-stretch md:gap-0 md:border-b-0 md:border-r md:px-0 md:py-3 ${
        collapsed ? 'h-12 md:w-16' : 'h-14 md:w-56'
      }`}
    >
      {/* Header / wordmark */}
      <div className="flex w-full items-center justify-between md:mb-5 md:px-3">
        <div className="flex items-center gap-2 overflow-hidden">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#3fb950"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0"
          >
            <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
          </svg>
          {!collapsed && (
            <div className="flex flex-col leading-none">
              <span className="font-mono text-[13px] font-semibold tracking-[0.15em] text-[#e6edf3]">
                SOLAR
              </span>
              <span className="font-mono text-[9px] tracking-[0.2em] text-[#8b96a3]">
                BMS MONITOR
              </span>
            </div>
          )}
        </div>

        <button
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={() => setCollapsed((s) => !s)}
          className="hidden shrink-0 rounded-md p-1.5 text-[#8b96a3] hover:bg-[#1a2129] hover:text-[#e6edf3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#3fb950] md:block"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex w-full flex-1 flex-row items-center gap-1 md:flex-col md:items-stretch md:gap-0.5 md:px-2">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`group relative flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#3fb950] ${
                active
                  ? 'bg-[#1a2129] text-[#e6edf3]'
                  : 'text-[#8b96a3] hover:bg-[#1a2129]/60 hover:text-[#c9d1d9]'
              }`}
            >
              {/* current-trace indicator */}
              <span
                aria-hidden
                className={`absolute left-0 top-1/2 hidden h-4 w-[2px] -translate-y-1/2 rounded-full bg-[#3fb950] transition-opacity duration-200 md:block ${
                  active ? 'opacity-100 shadow-[0_0_6px_#3fb950] motion-safe:animate-pulse' : 'opacity-0'
                }`}
              />
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`shrink-0 ${active ? 'text-[#3fb950]' : ''}`}
              >
                {item.icon}
              </svg>
              {!collapsed && (
                <span className="whitespace-nowrap font-mono text-[11px] font-medium tracking-[0.06em]">
                  {item.label.toUpperCase()}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="hidden shrink-0 border-t border-[#2a3441] px-3 py-2.5 md:block">
        {collapsed ? (
          <div className="flex justify-center">
            <span className="h-1.5 w-1.5 rounded-full bg-[#3fb950]" />
          </div>
        ) : (
          <div className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.1em] text-[#8b96a3]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#3fb950]" />
            REV 0.1 &middot; ONLINE
          </div>
        )}
      </div>
    </aside>
  );
}