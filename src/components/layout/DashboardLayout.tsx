"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LucideHome, LucideUsers, LucideDoorOpen, LucideBuilding, LucideSettings, LucideLogOut, LucideMenu, LucideX, LucideMoon, LucideSun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSession, signOut } from "next-auth/react";

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

const SidebarItem = ({ href, icon, label, active }: SidebarItemProps) => {
  return (
    <Link
      href={href}
      className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
        active
          ? "bg-white/10 text-white"
          : "text-white/70 hover:text-white hover:bg-white/5"
      }`}
    >
      <span className={`mr-3 h-5 w-5 transition-transform duration-200 ${active ? "text-white" : "text-white/70"}`}>
        {icon}
      </span>
      {label}
      {active && (
        <div className="ml-auto h-2 w-2 rounded-full bg-white"></div>
      )}
    </Link>
  );
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const sidebarItems = [
    {
      href: "/dashboard",
      icon: <LucideHome className="h-5 w-5" />,
      label: "Dashboard",
    },
    {
      href: "/tenants",
      icon: <LucideUsers className="h-5 w-5" />,
      label: "Tenants",
    },
    {
      href: "/rooms",
      icon: <LucideDoorOpen className="h-5 w-5" />,
      label: "Rooms",
    },
    {
      href: "/properties",
      icon: <LucideBuilding className="h-5 w-5" />,
      label: "Properties",
    },
    {
      href: "/settings",
      icon: <LucideSettings className="h-5 w-5" />,
      label: "Settings",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-gray-900/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 transform transition duration-300 ease-in-out bg-gray-900 dark:bg-black lg:static lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo and brand */}
        <div className="flex h-16 items-center px-6 lg:h-20">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <LucideBuilding className="h-5 w-5 text-white" />
            </div>
            <h1 className="ml-3 text-lg font-semibold text-white">PG Manager</h1>
          </div>
          <button
            type="button"
            className="ml-auto rounded-full p-1.5 text-white/70 hover:bg-white/10 hover:text-white focus:outline-none lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <LucideX className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="mt-6 px-3">
          <div className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-white/50">
            Main
          </div>
          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <SidebarItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                active={pathname === item.href}
              />
            ))}
          </nav>
        </div>

        {/* User and logout */}
        <div className="absolute bottom-0 w-full p-4">
          <div className="mb-4 rounded-md bg-white/5 p-3">
            <div className="flex items-center">
              <div className="h-9 w-9 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                {session?.user?.name?.charAt(0) || "U"}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">
                  {session?.user?.name || "User"}
                </p>
                <p className="text-xs text-white/70">
                  {session?.user?.email || "user@example.com"}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="flex w-full items-center justify-center rounded-md bg-white/10 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/20 transition-colors"
            onClick={handleLogout}
          >
            <LucideLogOut className="mr-2 h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between bg-white px-6 dark:bg-gray-800 lg:h-16">
          <div className="flex items-center">
            <button
              type="button"
              className="mr-4 rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-600 focus:outline-none dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300 lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <LucideMenu className="h-5 w-5" />
            </button>

            <div className="hidden md:block">
              <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                {sidebarItems.find(item => pathname === item.href)?.label || "Dashboard"}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-600 focus:outline-none dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300 transition-colors"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <LucideSun className="h-5 w-5" />
              ) : (
                <LucideMoon className="h-5 w-5" />
              )}
            </button>

            <div className="relative">
              <button
                type="button"
                className="flex items-center rounded-full bg-gray-100 p-1 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                aria-label="User menu"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                  {session?.user?.name?.charAt(0) || "U"}
                </div>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-gray-50 p-4 dark:bg-gray-900 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
