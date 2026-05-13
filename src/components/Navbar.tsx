"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gamepad2, Upload, LayoutDashboard, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: "/games", label: "Oyunlar", icon: Gamepad2 },
    { href: "/submit", label: "Oyun Yükle", icon: Upload },
    { href: "/admin", label: "Admin", icon: LayoutDashboard },
  ];

  return (
    <header className="fixed top-0 w-full z-50 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center overflow-hidden neon-border">
  <img src="/mfl-logo.png"
    alt="MFL Logo"
    className="w-10 h-10 object-contain"
  />
</div>
          <span className="text-2xl font-bold tracking-wider text-glow uppercase hidden sm:block">
            MFL Game Jam
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "flex items-center gap-2 text-sm font-medium uppercase tracking-wider transition-colors hover:text-primary",
                  isActive ? "text-primary text-glow" : "text-gray-400"
                )}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-gray-300 hover:text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden glass border-b border-white/10 overflow-hidden"
          >
            <div className="flex flex-col px-4 py-4 space-y-4">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={clsx(
                      "flex items-center gap-3 p-3 rounded-lg text-sm font-medium uppercase tracking-wider transition-colors hover:bg-white/5",
                      isActive ? "text-primary bg-primary/10 neon-border" : "text-gray-400"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
