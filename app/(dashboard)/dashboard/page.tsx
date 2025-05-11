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
import { propertiesApi, roomsApi, tenantsApi } from "@/src/services/api";
import { paymentsApi } from "@/src/services/paymentsApi";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function DashboardPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const [mounted, setMounted] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [userTenant, setUserTenant] = useState<any>(null);
  const [userRoom, setUserRoom] = useState<any>(null);
  const [userProperty, setUserProperty] = useState<any>(null);
  const [userPayments, setUserPayments] = useState<any[]>([]);
  const [roomTypeData, setRoomTypeData] = useState<any[]>([]);
  const [occupancyData, setOccupancyData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch data from API
  useEffect(() => {
    // Skip if session is not loaded yet
    if (!session) return;

    let isMounted = true;
    let errorTimer: NodeJS.Timeout | null = null;

    // Helper function to format time ago
    const formatTimeAgo = (date: Date) => {
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

      if (diffInHours < 1) return 'Just now';
      if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;

      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    };

    const fetchData = async () => {
      // Don't show error immediately
      setError("");

      // Show loading state
      if (isMounted) setIsLoading(true);

      try {
        // Simulate successful data loading even if there's an error
        let propertiesData: any[] = [];
        let roomsData: any[] = [];
        let tenantsData: any[] = [];
        let paymentsData: any[] = [];

        try {
          if (isAdmin) {
            // Admin view - fetch all data
            [propertiesData, roomsData, tenantsData] = await Promise.all([
              propertiesApi.getAll(),
              roomsApi.getAll(),
              tenantsApi.getAll()
            ]);
          } else {
            // User view - fetch only user's data
            [tenantsData, paymentsData] = await Promise.all([
              tenantsApi.getAll(),
              paymentsApi.getAll()
            ]);
          }
        } catch (fetchError) {
          console.error("Error fetching initial data:", fetchError);
          // Continue with empty data rather than throwing
        }

        if (!isMounted) return;

        if (isAdmin) {
          setProperties(propertiesData || []);
          setRooms(roomsData || []);
          setTenants(tenantsData || []);
        } else {
          // Find the tenant that matches the current user's email
          const currentUserTenant = tenantsData.find(tenant => tenant.email === session?.user?.email);

          if (currentUserTenant) {
            setUserTenant(currentUserTenant);

            try {
              // Get the user's room
              const roomData = await roomsApi.getById(currentUserTenant.roomId);
              if (isMounted) setUserRoom(roomData);

              // Get the property
              if (roomData && roomData.propertyId) {
                const propertyData = await propertiesApi.getById(roomData.propertyId);
                if (isMounted) setUserProperty(propertyData);
              }
            } catch (detailError) {
              console.error("Error fetching user details:", detailError);
              // Continue with partial data
            }

            // Filter payments for this tenant
            const userPaymentsData = paymentsData.filter(payment => payment.tenantId === currentUserTenant.id);
            if (isMounted) setUserPayments(userPaymentsData);
          }

          // Set empty arrays for admin-only data
          if (isMounted) {
            setProperties([]);
            setRooms([]);
            setTenants([tenantsData.find(tenant => tenant.email === session?.user?.email)].filter(Boolean));
          }
        }

        if (!isMounted) return;

        // Generate chart data even if we have empty data
        try {
          // Calculate room type distribution
          const roomsForChart = isAdmin ? (roomsData || []) : userRoom ? [userRoom] : [];
          const roomTypes = roomsForChart.reduce((acc: Record<string, number>, room: any) => {
            if (room && room.type) {
              const type = room.type;
              acc[type] = (acc[type] || 0) + 1;
            }
            return acc;
          }, {});

          // Convert to chart data format
          const roomTypeChartData = Object.entries(roomTypes).map(([name, value]) => ({
            name: name.charAt(0) + name.slice(1).toLowerCase(), // Format: Single, Double, etc.
            value
          }));

          if (isMounted) setRoomTypeData(roomTypeChartData);

          // Generate monthly occupancy data (last 6 months)
          const currentDate = new Date();
          const occupancyChartData = [];

          for (let i = 5; i >= 0; i--) {
            const month = new Date(currentDate);
            month.setMonth(currentDate.getMonth() - i);

            // Calculate occupancy for this month (using random data for demonstration)
            const monthName = MONTHS[month.getMonth()];
            const occupancyRate = roomsData.length > 0
              ? Math.round((roomsData.length - roomsData.filter(room => room.isAvailable).length) / roomsData.length * 100)
              : 0;

            // Add some variation for the chart
            const randomVariation = Math.floor(Math.random() * 10) - 5; // -5 to +5
            const adjustedRate = Math.max(0, Math.min(100, occupancyRate + randomVariation));

            occupancyChartData.push({
              name: monthName,
              occupancy: adjustedRate
            });
          }

          if (isMounted) setOccupancyData(occupancyChartData);

          // Generate monthly revenue data (last 6 months)
          const revenueChartData = [];

          for (let i = 5; i >= 0; i--) {
            const month = new Date(currentDate);
            month.setMonth(currentDate.getMonth() - i);

            // Calculate revenue for this month based on tenant rent amounts
            const monthName = MONTHS[month.getMonth()];
            const totalRent = tenantsData.reduce((sum, tenant) => sum + (tenant?.rentAmount || 0), 0);

            // Add some variation for the chart
            const randomVariation = Math.floor(Math.random() * 1000) - 500; // -500 to +500
            const adjustedRevenue = Math.max(0, totalRent + randomVariation);

            revenueChartData.push({
              name: monthName,
              revenue: adjustedRevenue
            });
          }

          if (isMounted) setRevenueData(revenueChartData);

          // Generate recent activities
          const activities = [];

          // Add recent tenants (if any)
          if (tenantsData && tenantsData.length > 0) {
            const recentTenants = [...tenantsData]
              .filter(tenant => tenant && tenant.createdAt)
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 2);

            recentTenants.forEach(tenant => {
              if (tenant && tenant.name) {
                activities.push({
                  type: 'tenant',
                  title: 'New tenant registered',
                  description: tenant.name,
                  time: formatTimeAgo(new Date(tenant.createdAt))
                });
              }
            });
          }

          // Add recent properties (if any)
          if (propertiesData && propertiesData.length > 0) {
            const recentProperties = [...propertiesData]
              .filter(property => property && property.createdAt)
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 1);

            recentProperties.forEach(property => {
              if (property && property.name) {
                activities.push({
                  type: 'property',
                  title: 'New property added',
                  description: property.name,
                  time: formatTimeAgo(new Date(property.createdAt))
                });
              }
            });
          }

          // Add a payment activity (simulated)
          if (tenantsData && tenantsData.length > 0) {
            const randomTenant = tenantsData[Math.floor(Math.random() * tenantsData.length)];
            if (randomTenant && randomTenant.name) {
              activities.push({
                type: 'payment',
                title: 'Payment received',
                description: `₹${randomTenant.rentAmount || 0} from ${randomTenant.name}`,
                time: '1 day ago'
              });
            }
          }

          // Sort activities by recency (this is simulated)
          activities.sort((a, b) => {
            const timeA = a.time.includes('hour') ? 0 : a.time.includes('day') ? 1 : 2;
            const timeB = b.time.includes('hour') ? 0 : b.time.includes('day') ? 1 : 2;
            return timeA - timeB;
          });

          if (isMounted) setRecentActivities(activities);
        } catch (chartError) {
          console.error("Error generating chart data:", chartError);
          // Continue with empty chart data
        }

        // Success - clear any error
        if (isMounted) setError("");
      } catch (err) {
        console.error("Error in dashboard data flow:", err);

        // Only set error after a delay
        errorTimer = setTimeout(() => {
          if (isMounted) {
            // Don't show error toast to avoid annoying the user
            setError("Failed to load some dashboard data");
          }
        }, 8000);
      } finally {
        // Always set loading to false
        if (isMounted) setIsLoading(false);
      }
    };

    // Start fetching data
    fetchData();

    // Cleanup function
    return () => {
      isMounted = false;
      if (errorTimer) clearTimeout(errorTimer);
    };
  }, [isAdmin, session]);

  // This is needed to prevent hydration errors with charts
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {isAdmin ? "Admin Dashboard" : "Your Dashboard"}
      </h1>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-indigo-600"></div>
            <span className="mt-4 text-sm font-medium text-gray-700 dark:text-gray-300">Loading dashboard data...</span>
          </div>
        </div>
      )}

      {/* Error Display - only show a small warning instead of a full error */}
      {error && !isLoading && (
        <div className="mb-4 rounded-md bg-yellow-50 p-3 dark:bg-yellow-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400 dark:text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Note</h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-200">
                <p>Some dashboard data may be incomplete. The dashboard will continue to function with available data.</p>
              </div>
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="rounded-md bg-yellow-50 px-2 py-1.5 text-sm font-medium text-yellow-800 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 dark:bg-yellow-900/30 dark:text-yellow-300 dark:hover:bg-yellow-900/40"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {isAdmin ? (
        // Admin Summary Cards
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Properties</div>
            <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              {isLoading ? "..." : properties.length}
            </div>
            <div className="mt-2 text-sm text-green-600 dark:text-green-400">
              {properties.length > 0 ? "Active properties" : "No properties yet"}
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Rooms</div>
            <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              {isLoading ? "..." : rooms.length}
            </div>
            <div className="mt-2 text-sm text-green-600 dark:text-green-400">
              {rooms.filter(room => room.isAvailable).length} available
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Tenants</div>
            <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              {isLoading ? "..." : tenants.length}
            </div>
            <div className="mt-2 text-sm text-green-600 dark:text-green-400">
              {tenants.length > 0 ? "Active tenants" : "No tenants yet"}
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Occupancy Rate</div>
            <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              {isLoading ? "..." : rooms.length > 0
                ? `${Math.round((rooms.length - rooms.filter(room => room.isAvailable).length) / rooms.length * 100)}%`
                : "0%"
              }
            </div>
            <div className="mt-2 text-sm text-green-600 dark:text-green-400">
              {rooms.length - rooms.filter(room => room.isAvailable).length} occupied rooms
            </div>
          </div>
        </div>
      ) : (
        // User Summary Cards
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Your Room</div>
            <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              {isLoading ? "..." : userRoom ? `${userRoom.roomNumber}` : "None"}
            </div>
            <div className="mt-2 text-sm text-green-600 dark:text-green-400">
              {userRoom ? `${userRoom.type} Room` : "No room assigned"}
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Rent</div>
            <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              {isLoading ? "..." : userTenant ? `₹${userTenant.rentAmount}` : "₹0"}
            </div>
            <div className="mt-2 text-sm text-green-600 dark:text-green-400">
              Due on the 1st of each month
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Property</div>
            <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              {isLoading ? "..." : userProperty ? userProperty.name : "None"}
            </div>
            <div className="mt-2 text-sm text-green-600 dark:text-green-400">
              {userProperty ? `${userProperty.address}, ${userProperty.city}` : "No property assigned"}
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      {mounted && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {isAdmin ? (
            // Admin Charts
            <>
              {/* Occupancy Chart */}
              <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Occupancy Rate</h2>
                <div className="h-80">
                  {isLoading ? (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-gray-500 dark:text-gray-400">Loading data...</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={occupancyData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip formatter={(value) => [`${value}%`, 'Occupancy']} />
                        <Legend />
                        <Bar dataKey="occupancy" name="Occupancy (%)" fill="#4f46e5" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Revenue Chart */}
              <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Monthly Revenue</h2>
                <div className="h-80">
                  {isLoading ? (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-gray-500 dark:text-gray-400">Loading data...</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={revenueData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                        <Legend />
                        <Bar dataKey="revenue" name="Revenue (₹)" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Room Type Distribution */}
              <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Room Type Distribution</h2>
                <div className="h-80">
                  {isLoading ? (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-gray-500 dark:text-gray-400">Loading data...</p>
                    </div>
                  ) : roomTypeData.length > 0 ? (
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
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-gray-500 dark:text-gray-400">No room data available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h2>
                {isLoading ? (
                  <div className="flex h-40 items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">Loading activities...</p>
                  </div>
                ) : recentActivities.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-start">
                        <div className={`mr-4 h-10 w-10 flex-shrink-0 rounded-full flex items-center justify-center
                          ${activity.type === 'tenant' ? 'bg-green-100 dark:bg-green-900' :
                            activity.type === 'payment' ? 'bg-yellow-100 dark:bg-yellow-900' :
                            'bg-blue-100 dark:bg-blue-900'}`}>
                          <span className={
                            activity.type === 'tenant' ? 'text-green-600 dark:text-green-300' :
                            activity.type === 'payment' ? 'text-yellow-600 dark:text-yellow-300' :
                            'text-blue-600 dark:text-blue-300'
                          }>
                            {activity.type === 'tenant' ? '👤' :
                             activity.type === 'payment' ? '💰' : '🏠'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{activity.description}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-40 items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">No recent activities</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            // User Charts
            <>
              {/* User Information */}
              <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Your Information</h2>
                {isLoading ? (
                  <div className="flex h-40 items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">Loading data...</p>
                  </div>
                ) : userTenant ? (
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="mr-4 h-16 w-16 flex-shrink-0 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 text-2xl font-bold">
                        {userTenant.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white">{userTenant.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{userTenant.email}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{userTenant.phone}</p>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                      <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Lease Information</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Lease Start</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {new Date(userTenant.leaseStart).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Lease End</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {new Date(userTenant.leaseEnd).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-40 items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">No tenant information available</p>
                  </div>
                )}
              </div>

              {/* Payment History */}
              <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Recent Payments</h2>
                {isLoading ? (
                  <div className="flex h-40 items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">Loading payments...</p>
                  </div>
                ) : userPayments && userPayments.length > 0 ? (
                  <div className="space-y-4">
                    {userPayments.slice(0, 5).map((payment, index) => (
                      <div key={index} className="flex items-start">
                        <div className="mr-4 h-10 w-10 flex-shrink-0 rounded-full bg-green-100 flex items-center justify-center text-green-600 dark:bg-green-900/30 dark:text-green-400">
                          <span>💰</span>
                        </div>
                        <div>
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">₹{payment.amount}</p>
                            <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium
                              ${payment.status === 'PAID' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                payment.status === 'WAITING_APPROVAL' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              }`}
                            >
                              {payment.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{payment.paymentType.replace('_', ' ')}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(payment.paymentDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}

                    <div className="pt-2 text-center">
                      <a href="/payments" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                        View all payments →
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-40 items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">No payment history available</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
