'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiUser, FiArrowRight, FiBookOpen } from 'react-icons/fi';

export default function RegisterPage() {
  const router = useRouter();
  const { clearAuth } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'student' as 'student' | 'teacher',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.register(formData);
      
      // Don't automatically log in - just show success message
      // Clear any existing auth state
      clearAuth();
      
      // Show success message
      if (response.user.role === 'teacher' && !response.user.isVerified) {
        toast.success('Account created! Your teacher account is pending verification. Please sign in.', { duration: 5000 });
      } else {
        toast.success('Account created successfully! Please sign in to continue.', { duration: 4000 });
      }
      
      // Redirect to login page after showing the message
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-green-600 mb-2">
              ClassPulse
            </h1>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mt-4">Create your account</h2>
          <p className="mt-2 text-gray-600">
            Or{' '}
            <Link href="/auth/login" className="font-medium text-green-600 hover:text-green-700 transition-colors">
              sign in to your account
            </Link>
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 backdrop-blur-sm">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Full Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-blue-500" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="block w-full pl-10 pr-3 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-gray-900 placeholder-gray-400 shadow-sm hover:border-gray-300"
                  placeholder="saurav karki"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-blue-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full pl-10 pr-3 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-gray-900 placeholder-gray-400 shadow-sm hover:border-gray-300"
                  placeholder="saurav.karki@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-blue-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  className="block w-full pl-10 pr-3 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-gray-900 placeholder-gray-400 shadow-sm hover:border-gray-300"
                  placeholder="Enter a strong password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-gray-800 mb-2">
                I am a
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiBookOpen className="h-5 w-5 text-blue-500" />
                </div>
                <select
                  id="role"
                  name="role"
                  className="block w-full pl-10 pr-10 py-3.5 border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all appearance-none cursor-pointer shadow-sm hover:border-gray-300"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'student' | 'teacher' })}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center px-6 py-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-1 hover:shadow-xl"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  <>
                    Create account
                    <FiArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
