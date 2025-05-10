"use client";

import { useState, useEffect } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

// Mock data for the dashboard
const occupancyData = [
  { name: "Jan", occupancy: 65 },
  { name: "Feb", occupancy: 70 },
  { name: "Mar", occupancy: 75 },
  { name: "Apr", occupancy: 80 },
  { name: "May", occupancy: 85 },
  { name: "Jun", occupancy: 90 },
];

const revenueData = [
  { name: "Jan", revenue: 12000 },
  { name: "Feb", revenue: 13500 },
  { name: "Mar", revenue: 14000 },
  { name: "Apr", revenue: 15500 },
  { name: "May", revenue: 16000 },
  { name: "Jun", revenue: 17500 },
];

const roomTypeData = [
  { name: "Single", value: 45 },
  { name: "Double", value: 30 },
  { name: "Triple", value: 15 },
  { name: "Suite", value: 10 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);

  // This is needed to prevent hydration errors with charts
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Properties</div>
          <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">12</div>
          <div className="mt-2 text-sm text-green-600 dark:text-green-400">↑ 10% from last month</div>
        </div>
        
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Rooms</div>
          <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">48</div>
          <div className="mt-2 text-sm text-green-600 dark:text-green-400">↑ 5% from last month</div>
        </div>
        
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Tenants</div>
          <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">42</div>
          <div className="mt-2 text-sm text-green-600 dark:text-green-400">↑ 8% from last month</div>
        </div>
        
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Occupancy Rate</div>
          <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">87.5%</div>
          <div className="mt-2 text-sm text-green-600 dark:text-green-400">↑ 2.5% from last month</div>
        </div>
      </div>
      
      {/* Charts */}
      {mounted && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Occupancy Chart */}
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Occupancy Rate</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={occupancyData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="occupancy" name="Occupancy (%)" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Revenue Chart */}
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Monthly Revenue</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={revenueData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue ($)" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Room Type Distribution */}
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Room Type Distribution</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roomTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {roomTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="mr-4 h-10 w-10 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center dark:bg-blue-900">
                  <span className="text-blue-600 dark:text-blue-300">🏠</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">New property added</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Green Valley Apartments</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="mr-4 h-10 w-10 flex-shrink-0 rounded-full bg-green-100 flex items-center justify-center dark:bg-green-900">
                  <span className="text-green-600 dark:text-green-300">👤</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">New tenant registered</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">John Smith</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">5 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="mr-4 h-10 w-10 flex-shrink-0 rounded-full bg-yellow-100 flex items-center justify-center dark:bg-yellow-900">
                  <span className="text-yellow-600 dark:text-yellow-300">💰</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Payment received</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">$1,200 from Sarah Johnson</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">1 day ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
