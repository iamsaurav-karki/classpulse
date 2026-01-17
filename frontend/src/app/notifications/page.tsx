'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { useAuthStore } from '@/store/auth.store';
import { notificationService } from '@/services/notification.service';
import { Notification } from '@/types/notification';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { FiBell, FiCheck, FiCheckCircle, FiMessageCircle, FiFileText, FiHelpCircle, FiRadio, FiTrash2 } from 'react-icons/fi';

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated, user, loadAuth } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadAuth();
  }, []); // Only run once on mount

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    loadNotifications();
    loadUnreadCount();
  }, [isAuthenticated, router]);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
      if (unreadCount > 0) {
        setUnreadCount(unreadCount - 1);
      }
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'answer':
        return <FiMessageCircle className="w-5 h-5" />;
      case 'comment':
        return <FiMessageCircle className="w-5 h-5" />;
      case 'support':
        return <FiHelpCircle className="w-5 h-5" />;
      case 'announcement':
        return <FiRadio className="w-5 h-5" />;
      default:
        return <FiBell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'answer':
        return 'bg-green-100 text-green-600';
      case 'comment':
        return 'bg-purple-100 text-purple-600';
      case 'support':
        return 'bg-orange-100 text-orange-600';
      case 'announcement':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-green-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-gray-600">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          {notifications.length > 0 && unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
            >
              <FiCheckCircle className="w-5 h-5" />
              Mark All Read
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12 bg-white rounded-xl shadow">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <p className="text-gray-500 mt-4">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow border border-gray-100">
            <FiBell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">No notifications yet.</p>
            <p className="text-gray-400">You'll see notifications here when someone interacts with your content.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-xl shadow-lg p-6 border-2 transition-all ${
                  notification.isRead
                    ? 'border-gray-100 opacity-75'
                    : 'border-blue-200 bg-blue-50/30'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{notification.title}</h3>
                        <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{notification.createdAt ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }) : 'Recently'}</span>
                          <span className="px-2 py-1 bg-gray-100 rounded-full capitalize">
                            {notification.type}
                          </span>
                        </div>
                      </div>
                      {!notification.isRead && (
                        <span className="w-3 h-3 bg-green-600 rounded-full"></span>
                      )}
                    </div>
                    {notification.link && (
                      <Link
                        href={notification.link}
                        className="inline-block mt-3 text-green-600 hover:text-green-700 font-medium text-sm"
                        onClick={() => !notification.isRead && markAsRead(notification.id)}
                      >
                        View →
                      </Link>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Mark as read"
                      >
                        <FiCheck className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

