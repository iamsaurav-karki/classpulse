'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';
import { User } from '@/types/user';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiBook, FiShield, FiEdit2, FiSave, FiX } from 'react-icons/fi';

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, user, loadAuth, setAuth } = useAuthStore();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
  });

  useEffect(() => {
    loadAuth();
  }, []); // Only run once on mount

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    loadProfile();
  }, [isAuthenticated, router]);

  const loadProfile = async () => {
    try {
      const data = await authService.getProfile();
      setProfile(data);
      setFormData({
        name: data.name || '',
        email: data.email || '',
        bio: data.bio || '',
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Note: Update profile endpoint would need to be implemented in backend
      // For now, just show a message
      toast.success('Profile update feature coming soon!');
      setEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'teacher':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'student':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  if (!isAuthenticated || loading) return null;
  if (!profile) return null;

  return (
    <div className="min-h-screen bg-green-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Profile</h1>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
              >
                <FiEdit2 className="w-5 h-5" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold flex items-center gap-2"
                >
                  <FiSave className="w-5 h-5" />
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      name: profile.name || '',
                      email: profile.email || '',
                      bio: profile.bio || '',
                    });
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold flex items-center gap-2"
                >
                  <FiX className="w-5 h-5" />
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Profile Picture */}
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {profile.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{profile.name}</h2>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${getRoleBadgeColor(profile.role)}`}>
                  {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                </span>
              </div>
            </div>

            {/* Email */}
            <div className="border-t border-gray-200 pt-6">
              <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <FiMail className="w-5 h-5" />
                Email
              </label>
              {editing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-gray-900"
                  disabled
                />
              ) : (
                <p className="text-gray-700 text-lg">{profile.email}</p>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <FiUser className="w-5 h-5" />
                Name
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-gray-900"
                />
              ) : (
                <p className="text-gray-700 text-lg">{profile.name}</p>
              )}
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <FiBook className="w-5 h-5" />
                Bio
              </label>
              {editing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-gray-900 resize-none"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-gray-700 text-lg">{profile.bio || 'No bio yet.'}</p>
              )}
            </div>

            {/* Account Status */}
            {profile.role === 'teacher' && (
              <div className="border-t border-gray-200 pt-6">
                <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <FiShield className="w-5 h-5" />
                  Account Status
                </label>
                <div className="flex items-center gap-3">
                  {profile.isVerified ? (
                    <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold flex items-center gap-2">
                      <FiShield className="w-4 h-4" />
                      Verified Teacher
                    </span>
                  ) : (
                    <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                      Pending Verification
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Account Created */}
            {profile.createdAt && (
              <div className="border-t border-gray-200 pt-6">
                <p className="text-sm text-gray-500">
                  Account created on {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

