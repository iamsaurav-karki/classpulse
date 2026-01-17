'use client';

import { FiSettings, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  return (
    <div className="w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Configure platform settings and preferences</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Configuration</h3>
            <p className="text-gray-600">
              System settings configuration will be available in a future update.
            </p>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Flags</h3>
            <p className="text-gray-600">
              Enable or disable platform features. Coming soon.
            </p>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Mode</h3>
            <p className="text-gray-600">
              Put the platform in maintenance mode. Coming soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

