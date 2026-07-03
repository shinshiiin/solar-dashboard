"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';

const NAV = [
  { href: '/', label: 'Dashboard', emoji: '📊' },
  { href: '/logs', label: 'Statistics', emoji: '📜' },
  { href: '/developer', label: 'Developer', emoji: '📜' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('sb:collapsed');
      setCollapsed(stored === '1');
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('sb:collapsed', collapsed ? '0' : '1');
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  return (
    <aside
      aria-label="Sidebar"
      className={`flex flex-col gap-4 border-r border-slate-800 bg-slate-950/80 p-3 transition-all duration-200 ease-in-out ${
        collapsed ? 'w-16' : 'w-44'
      }`}
    >
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="text-lg font-semibold text-slate-100">{collapsed ? '' : 'Menu'}</div>
        </div>

        <button
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={() => setCollapsed((s) => !s)}
          className="rounded-md bg-slate-800/60 px-2 py-1 text-sm text-slate-200 hover:bg-slate-700"
        >
          {collapsed ? '➡' : '⬅'}
        </button>
      </div>

      <nav className="mt-3 flex flex-col gap-1">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-md px-2 py-2 text-slate-200 hover:bg-slate-800"
          >
            <span className="text-lg">{item.emoji}</span>
            {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="mt-auto px-1 text-xs text-slate-500">
        {!collapsed && <>v0.1 · solar-dashboard</>}
      </div>
    </aside>
  );
}
