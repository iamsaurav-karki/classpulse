'use client';

import { useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';
import { AdminAnalytics } from '@/types/admin';
import { FiTrendingUp, FiUsers, FiFileText, FiMessageSquare } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminAnalyticsPage() {
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
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics & Monitoring</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Platform statistics and insights</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-600">Total Users</h3>
            <FiUsers className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{analytics.users.total}</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">{analytics.users.active} active</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-600">Teachers</h3>
            <FiUsers className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{analytics.teachers.total}</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {analytics.teachers.verified} verified, {analytics.teachers.pending} pending
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-600">Questions</h3>
            <FiFileText className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{analytics.content.questions}</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {analytics.recentActivity.questions7d} in last 7 days
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-600">Answers</h3>
            <FiMessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{analytics.content.answers}</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {analytics.recentActivity.answers7d} in last 7 days
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Recent Activity (Last 7 Days)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
            <FiTrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mx-auto mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{analytics.recentActivity.users7d}</p>
            <p className="text-xs sm:text-sm text-gray-600">New Users</p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-purple-50 rounded-lg">
            <FiFileText className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-gray-900">
              {analytics.recentActivity.questions7d}
            </p>
            <p className="text-xs sm:text-sm text-gray-600">New Questions</p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-orange-50 rounded-lg">
            <FiMessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{analytics.recentActivity.answers7d}</p>
            <p className="text-xs sm:text-sm text-gray-600">New Answers</p>
          </div>
        </div>
      </div>
    </div>
  );
}

