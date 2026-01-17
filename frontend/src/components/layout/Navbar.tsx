'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { FiHome, FiBook, FiHelpCircle, FiUser, FiLogOut, FiBell, FiMenu, FiX } from 'react-icons/fi';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    router.push('/');
    setMobileMenuOpen(false);
  };

  if (!isAuthenticated) return null;

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/');

  const navLinks = [
    { href: '/dashboard', label: 'Home', icon: FiHome },
    { href: '/questions', label: 'Questions', icon: FiHelpCircle },
    { href: '/notes', label: 'Notes', icon: FiBook },
    { href: '/support', label: 'Support', icon: FiHelpCircle },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-lg border-b border-gray-200/80 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                <img src="/favicon.svg" alt="ClassPulse" className="w-full h-full" />
              </div>
              <h1 className="text-2xl font-bold text-green-600">
                ClassPulse
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {user?.role === 'admin' && (
              <Link
                href="/admin"
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  isActive('/admin')
                    ? 'bg-green-600 text-white shadow-md'
                    : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                Admin
              </Link>
            )}
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    isActive(link.href)
                      ? 'bg-green-600 text-white shadow-md'
                      : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                  }`}
                >
                  <Icon className="mr-2 w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            <Link
              href="/notifications"
              className="p-2.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all relative group"
            >
              <FiBell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-3 pl-3 border-l border-gray-200">
              <Link
                href="/profile"
                className="flex items-center text-sm font-medium text-gray-700 hover:text-green-600 transition-colors group"
              >
                <div className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold mr-2 shadow-md group-hover:shadow-lg transition-shadow">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden lg:inline font-medium">{user?.name}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center text-sm font-medium text-gray-700 hover:text-red-600 transition-colors px-3 py-2 hover:bg-red-50 rounded-lg"
              >
                <FiLogOut className="mr-1.5 w-4 h-4" />
                <span className="hidden lg:inline">Logout</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
            >
              {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 animate-in slide-in-from-top-2">
            <div className="space-y-1">
              {user?.role === 'admin' && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 text-base font-medium rounded-lg transition-all ${
                    isActive('/admin')
                      ? 'bg-green-600 text-white'
                      : 'text-gray-700 hover:bg-green-50'
                  }`}
                >
                  Admin
                </Link>
              )}
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-3 text-base font-medium rounded-lg transition-all ${
                      isActive(link.href)
                        ? 'bg-green-600 text-white'
                        : 'text-gray-700 hover:bg-green-50'
                    }`}
                  >
                    <Icon className="mr-3 w-5 h-5" />
                    {link.label}
                  </Link>
                );
              })}
              <div className="pt-4 border-t border-gray-200 mt-4">
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:bg-green-50 rounded-lg transition-all"
                >
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span>{user?.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"
                >
                  <FiLogOut className="mr-3 w-5 h-5" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
