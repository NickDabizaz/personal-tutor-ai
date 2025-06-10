"use client";

import { useState } from "react";

interface HeaderProps {
  navLinks: { href: string; label: string }[];
}

export default function Header({ navLinks }: HeaderProps) {
  const [mobileNav, setMobileNav] = useState(false);

  return (
    <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-gray-950/70 border-b border-gray-800 animate-fade-in">
      <div className="container mx-auto flex items-center justify-between px-6 md:px-12 h-16">
        <a href="#" className="font-bold text-lg text-white hover:text-amber-400 transition-colors duration-300">
          Course AI
        </a>        <nav className="hidden md:flex items-center gap-8 text-sm">
          {navLinks.map((l) => (
            <a 
              key={l.href} 
              href={l.href} 
              className="hover:text-amber-400 transition-colors duration-300 relative group"
            >
              {l.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-400 transition-all duration-300 group-hover:w-full"></span>
            </a>
          ))}
          <a
            href="/create-course"
            className="px-4 py-2 rounded-lg bg-amber-400 text-gray-900 font-semibold hover:bg-amber-300 hover:scale-105 transition-all duration-300"
          >
            Get Started
          </a>
        </nav>
        <button
          className="md:hidden hover:scale-110 transition-transform duration-300"
          onClick={() => setMobileNav(!mobileNav)}
          aria-label="Toggle navigation"
        >
          <svg
            className="w-6 h-6 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            {mobileNav ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 8h16M4 16h16"
              />
            )}
          </svg>
        </button>
      </div>      <div 
        className={`md:hidden bg-gray-950 border-t border-gray-800 overflow-hidden transition-all duration-300 ease-in-out ${
          mobileNav ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >          {navLinks.map((l, index) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMobileNav(false)}
              className="block px-6 py-3 border-b border-gray-800 hover:bg-gray-900 transition-all duration-300 hover:pl-8 hover:text-amber-400"
              style={{ 
                animationDelay: `${index * 50}ms`,
                transform: mobileNav ? 'translateX(0)' : 'translateX(-20px)',
                opacity: mobileNav ? 1 : 0,
                transition: `transform 0.3s ease ${index * 0.05}s, opacity 0.3s ease ${index * 0.05}s, padding-left 0.3s ease, color 0.3s ease` 
              }}
            >
              {l.label}
            </a>
          ))}
        </div>
    </header>
  );
}