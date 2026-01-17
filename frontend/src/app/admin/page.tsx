'use client';

import { useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';
import { AdminAnalytics } from '@/types/admin';
import {
  FiUsers,
  FiUserCheck,
  FiFileText,
  FiMessageSquare,
  FiHelpCircle,
  FiTrendingUp,
  FiClock,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  if (!analytics) return null;

  const statCards = [
    {
      title: 'Total Users',
      value: analytics.users.total,
      subtitle: `${analytics.users.active} active`,
      icon: FiUsers,
      color: 'bg-blue-500',
    },
    {
      title: 'Teachers',
      value: analytics.teachers.total,
      subtitle: `${analytics.teachers.verified} verified, ${analytics.teachers.pending} pending`,
      icon: FiUserCheck,
      color: 'bg-green-500',
    },
    {
      title: 'Questions',
      value: analytics.content.questions,
      subtitle: `${analytics.recentActivity.questions7d} in last 7 days`,
      icon: FiFileText,
      color: 'bg-purple-500',
    },
    {
      title: 'Answers',
      value: analytics.content.answers,
      subtitle: `${analytics.recentActivity.answers7d} in last 7 days`,
      icon: FiMessageSquare,
      color: 'bg-orange-500',
    },
    {
      title: 'Open Tickets',
      value: analytics.support.openTickets,
      subtitle: 'Requires attention',
      icon: FiHelpCircle,
      color: 'bg-red-500',
    },
    {
      title: 'New Users (7d)',
      value: analytics.recentActivity.users7d,
      subtitle: 'Recent signups',
      icon: FiTrendingUp,
      color: 'bg-indigo-500',
    },
  ];

  return (
    <div className="w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Overview of platform activity and statistics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className={`${card.color} p-2 sm:p-3 rounded-lg`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{card.value}</h3>
              <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">{card.title}</p>
              <p className="text-xs text-gray-500 line-clamp-1">{card.subtitle}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <a
            href="/admin/teachers"
            className="p-3 sm:p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-green-50 transition-colors text-center"
          >
            <FiUserCheck className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm sm:text-base font-semibold text-gray-700">Review Pending Teachers</p>
            <p className="text-xs sm:text-sm text-gray-500">{analytics.teachers.pending} pending</p>
          </a>
          <a
            href="/admin/support"
            className="p-3 sm:p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-green-50 transition-colors text-center"
          >
            <FiHelpCircle className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm sm:text-base font-semibold text-gray-700">Manage Support Tickets</p>
            <p className="text-xs sm:text-sm text-gray-500">{analytics.support.openTickets} open</p>
          </a>
          <a
            href="/admin/users"
            className="p-3 sm:p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-green-50 transition-colors text-center sm:col-span-2 lg:col-span-1"
          >
            <FiUsers className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm sm:text-base font-semibold text-gray-700">User Management</p>
            <p className="text-xs sm:text-sm text-gray-500">{analytics.users.total} total users</p>
          </a>
        </div>
      </div>
    </div>
  );
}

