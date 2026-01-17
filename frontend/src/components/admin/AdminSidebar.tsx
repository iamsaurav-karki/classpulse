'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FiLayout,
  FiUsers,
  FiUserCheck,
  FiFileText,
  FiMessageSquare,
  FiHelpCircle,
  FiBarChart2,
  FiSettings,
} from 'react-icons/fi';

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: FiLayout },
  { href: '/admin/users', label: 'Users', icon: FiUsers },
  { href: '/admin/teachers', label: 'Teachers', icon: FiUserCheck },
  { href: '/admin/questions', label: 'Questions', icon: FiFileText },
  { href: '/admin/answers', label: 'Answers', icon: FiMessageSquare },
  { href: '/admin/support', label: 'Support', icon: FiHelpCircle },
  { href: '/admin/analytics', label: 'Analytics', icon: FiBarChart2 },
  { href: '/admin/settings', label: 'Settings', icon: FiSettings },
];

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 pt-16 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:static lg:inset-auto`}
      >
        <nav className="p-4 space-y-1 h-full overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  // Close mobile menu when link is clicked
                  if (onClose) {
                    onClose();
                  }
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm sm:text-base">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

