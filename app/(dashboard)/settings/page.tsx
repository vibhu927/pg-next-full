"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { LucideMoon, LucideSun } from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // This is needed to prevent hydration errors with theme
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Appearance</h2>
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Choose between light and dark theme
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              type="button"
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                theme === "light"
                  ? "bg-indigo-100 text-indigo-600 ring-2 ring-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 dark:ring-indigo-400"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
              }`}
              onClick={() => setTheme("light")}
            >
              <LucideSun className="h-5 w-5" />
            </button>
            
            <button
              type="button"
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                theme === "dark"
                  ? "bg-indigo-100 text-indigo-600 ring-2 ring-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 dark:ring-indigo-400"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
              }`}
              onClick={() => setTheme("dark")}
            >
              <LucideMoon className="h-5 w-5" />
            </button>
            
            <button
              type="button"
              className={`flex h-10 items-center justify-center rounded-md px-3 ${
                theme === "system"
                  ? "bg-indigo-100 text-indigo-600 ring-2 ring-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 dark:ring-indigo-400"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
              }`}
              onClick={() => setTheme("system")}
            >
              <span className="text-sm font-medium">System</span>
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Account Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Name
            </label>
            <input
              type="text"
              id="name"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
              defaultValue="Admin User"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
              defaultValue="admin@example.com"
            />
          </div>
          
          <div className="pt-4">
            <button
              type="button"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Change Password</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Current Password
            </label>
            <input
              type="password"
              id="current-password"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              New Password
            </label>
            <input
              type="password"
              id="new-password"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirm-password"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
            />
          </div>
          
          <div className="pt-4">
            <button
              type="button"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
