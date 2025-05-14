"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  LucideMoon,
  LucideSun,
  LucidePalette,
  LucideUser,
  LucideLock,
  LucideMonitor,
  LucideSave,
  LucideShield
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: "Admin User",
    email: "admin@example.com",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // This is needed to prevent hydration errors with theme
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSaveAccount = () => {
    // Simulate saving account info
    toast.success("Account information updated successfully");
  };

  const handleChangePassword = () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!formData.currentPassword) {
      toast.error("Current password is required");
      return;
    }
    // Simulate password change
    toast.success("Password changed successfully");
    setFormData((prev) => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Settings</h1>
      </div>

      {/* Appearance Card */}
      <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <div className="absolute top-0 h-1 w-full bg-gradient-to-r from-indigo-600 to-purple-600"></div>
        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600/10 to-purple-600/10 text-indigo-600 dark:text-indigo-400">
              <LucidePalette className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Appearance</h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Choose your preferred theme mode
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                className={`group relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200 ${
                  theme === "light"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
                }`}
                onClick={() => setTheme("light")}
              >
                <LucideSun className="h-5 w-5" />
                <span className={`absolute -bottom-8 left-1/2 -translate-x-1/2 transform whitespace-nowrap rounded-md ${
                  theme === "light"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                    : "bg-gray-800 text-gray-200 dark:bg-gray-700"
                  } px-2 py-1 text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100`}>
                  Light
                </span>
              </button>

              <button
                type="button"
                className={`group relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200 ${
                  theme === "dark"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
                }`}
                onClick={() => setTheme("dark")}
              >
                <LucideMoon className="h-5 w-5" />
                <span className={`absolute -bottom-8 left-1/2 -translate-x-1/2 transform whitespace-nowrap rounded-md ${
                  theme === "dark"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                    : "bg-gray-800 text-gray-200 dark:bg-gray-700"
                  } px-2 py-1 text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100`}>
                  Dark
                </span>
              </button>

              <button
                type="button"
                className={`group relative flex h-12 items-center justify-center rounded-lg px-4 transition-all duration-200 ${
                  theme === "system"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
                }`}
                onClick={() => setTheme("system")}
              >
                <LucideMonitor className="mr-2 h-5 w-5" />
                <span className="text-sm font-medium">System</span>
                <span className={`absolute -bottom-8 left-1/2 -translate-x-1/2 transform whitespace-nowrap rounded-md ${
                  theme === "system"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                    : "bg-gray-800 text-gray-200 dark:bg-gray-700"
                  } px-2 py-1 text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100`}>
                  System
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Account Settings Card */}
      <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <div className="absolute top-0 h-1 w-full bg-gradient-to-r from-indigo-600 to-purple-600"></div>
        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600/10 to-purple-600/10 text-indigo-600 dark:text-indigo-400">
              <LucideUser className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Account Settings</h2>
          </div>

          <div className="space-y-5">
            <div className="group relative">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <LucideUser className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="block w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-gray-900 transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                />
              </div>
            </div>

            <div className="group relative">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-gray-900 transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSaveAccount}
                className="inline-flex items-center rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-center text-sm font-medium text-white shadow-md transition-all hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <LucideSave className="mr-2 h-4 w-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <div className="absolute top-0 h-1 w-full bg-gradient-to-r from-indigo-600 to-purple-600"></div>
        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600/10 to-purple-600/10 text-indigo-600 dark:text-indigo-400">
              <LucideLock className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Change Password</h2>
          </div>

          <div className="space-y-5">
            <div className="group relative">
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <LucideShield className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className="block w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-gray-900 transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                />
              </div>
            </div>

            <div className="group relative">
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <LucideLock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="block w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-gray-900 transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                />
              </div>
            </div>

            <div className="group relative">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <LucideLock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="block w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-gray-900 transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleChangePassword}
                className="inline-flex items-center rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-center text-sm font-medium text-white shadow-md transition-all hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <LucideSave className="mr-2 h-4 w-4" />
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
