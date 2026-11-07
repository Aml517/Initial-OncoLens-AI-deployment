'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Activity, 
  Menu, 
  X
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Overview', href: '/' },
  { label: 'Dataset', href: '/dataset' },
  { label: 'Statistical Tests', href: '/statistics' },
  { label: 'Relationships', href: '/relationships' },
  { label: 'Interpretability', href: '/interpretability' },
  { label: 'Evaluation & Thresholds', href: '/performance' },
  { label: 'Error Autopsy', href: '/errors' },
  { label: 'Robustness', href: '/robustness' },
  { label: 'Workbench', href: '/workbench' },
  { label: 'Sandbox', href: '/predict' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-navy border-b border-navy-light/60 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-lg bg-teal flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <Activity className="w-6 h-6 text-mint" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                OncoLens <span className="text-teal-light text-sm font-semibold px-1.5 py-0.5 rounded bg-teal/20 border border-teal/40">AI</span>
              </span>
              <p className="text-[10px] text-slate-light tracking-wide uppercase font-mono">Cytology Research Platform</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center space-x-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-colors ${
                    isActive
                      ? 'bg-teal text-white shadow-sm'
                      : 'text-slate-light hover:text-white hover:bg-navy-light/50'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Research Badge & Mobile Trigger */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 text-xs font-mono px-2.5 py-1 rounded bg-navy-light text-slate-light border border-slate/30">
              <span className="w-2 h-2 rounded-full bg-teal animate-pulse"></span>
              <span>Research Environment</span>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-md text-slate-light hover:text-white hover:bg-navy-light focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-navy-dark border-b border-navy-light px-4 pt-2 pb-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-md text-sm font-medium ${
                  isActive
                    ? 'bg-teal text-white font-semibold'
                    : 'text-slate-light hover:text-white hover:bg-navy-light'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
