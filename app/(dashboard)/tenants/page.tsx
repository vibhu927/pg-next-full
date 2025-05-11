"use client";

import { useState, useEffect } from "react";
import { LucideEdit, LucideTrash, LucidePlus, LucideSearch, LucideX } from "lucide-react";
import { tenantsApi, propertiesApi, roomsApi } from "@/src/services/api";
import { toast } from "react-hot-toast";
import { MultiStepForm } from "@/src/components/ui/MultiStepForm";

export default function TenantsPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentTenant, setCurrentTenant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    roomId: "",
    propertyId: "",
    leaseEnd: "",
    rentAmount: "",
  });

  // Fetch tenants, properties, and rooms on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch tenants
        const tenantsData = await tenantsApi.getAll();
        setTenants(tenantsData);

        // Fetch properties for the dropdown
        const propertiesData = await propertiesApi.getAll();
        setProperties(propertiesData);

        // Fetch available rooms
        const roomsData = await roomsApi.getAll();
        const availableRoomsData = roomsData.filter((room: any) => room.isAvailable);
        setAvailableRooms(availableRoomsData);

        setError("");
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again.");
        // Only show toast if there's no error message already set
        if (!error) {
          toast.error("Failed to load data");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter tenants based on search query
  const filteredTenants = tenants.filter(
    (tenant) =>
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.phone.includes(searchQuery) ||
      (tenant.room?.roomNumber && tenant.room.roomNumber.includes(searchQuery)) ||
      (tenant.property?.name && tenant.property.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddTenant = async () => {
    try {
      const tenantData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        roomId: formData.roomId,
        propertyId: formData.propertyId,
        leaseEnd: formData.leaseEnd,
        rentAmount: parseFloat(formData.rentAmount),
      };

      await tenantsApi.create(tenantData);

      // Refresh the tenants list and available rooms
      const tenantsData = await tenantsApi.getAll();
      setTenants(tenantsData);

      const roomsData = await roomsApi.getAll();
      const availableRoomsData = roomsData.filter((room: any) => room.isAvailable);
      setAvailableRooms(availableRoomsData);

      setIsAddModalOpen(false);
      resetForm();
      toast.success("Tenant added successfully");
    } catch (err) {
      console.error("Error adding tenant:", err);
      toast.error("Failed to add tenant");
    }
  };

  const handleEditTenant = async () => {
    try {
      const tenantData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        roomId: formData.roomId,
        propertyId: formData.propertyId,
        leaseEnd: formData.leaseEnd,
        rentAmount: parseFloat(formData.rentAmount),
      };

      await tenantsApi.update(currentTenant.id, tenantData);

      // Refresh the tenants list and available rooms
      const tenantsData = await tenantsApi.getAll();
      setTenants(tenantsData);

      const roomsData = await roomsApi.getAll();
      const availableRoomsData = roomsData.filter((room: any) => room.isAvailable);
      setAvailableRooms(availableRoomsData);

      setIsEditModalOpen(false);
      resetForm();
      toast.success("Tenant updated successfully");
    } catch (err) {
      console.error("Error updating tenant:", err);
      toast.error("Failed to update tenant");
    }
  };

  const handleDeleteTenant = async () => {
    try {
      await tenantsApi.delete(currentTenant.id);

      // Refresh the tenants list and available rooms
      const tenantsData = await tenantsApi.getAll();
      setTenants(tenantsData);

      const roomsData = await roomsApi.getAll();
      const availableRoomsData = roomsData.filter((room: any) => room.isAvailable);
      setAvailableRooms(availableRoomsData);

      setIsDeleteModalOpen(false);
      toast.success("Tenant deleted successfully");
    } catch (err) {
      console.error("Error deleting tenant:", err);
      toast.error("Failed to delete tenant");
    }
  };

  const openEditModal = (tenant: any) => {
    setCurrentTenant(tenant);
    setFormData({
      name: tenant.name,
      email: tenant.email,
      phone: tenant.phone,
      roomId: tenant.roomId || "",
      propertyId: tenant.propertyId || "",
      leaseEnd: tenant.leaseEnd ? new Date(tenant.leaseEnd).toISOString().split('T')[0] : "",
      rentAmount: tenant.rentAmount.toString(),
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (tenant: any) => {
    setCurrentTenant(tenant);
    setIsDeleteModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      roomId: "",
      propertyId: "",
      leaseEnd: "",
      rentAmount: "",
    });
    setCurrentTenant(null);
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tenant Management</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage your tenants, view their details, and track their lease information
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            onClick={() => setIsAddModalOpen(true)}
          >
            <LucidePlus className="mr-2 h-4 w-4" />
            Add New Tenant
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Tenants</h2>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{tenants.length}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Leases</h2>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {tenants.filter(t => new Date(t.leaseEnd) > new Date()).length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Properties</h2>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {new Set(tenants.map(t => t.room?.property?.name).filter(Boolean)).size}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Revenue</h2>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  ₹{tenants.reduce((sum, t) => sum + (parseFloat(t.rentAmount) || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <LucideSearch className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full rounded-lg border border-gray-300 bg-white py-3 pl-12 pr-10 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
          placeholder="Search tenants by name, email, phone, room, or property..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            onClick={() => setSearchQuery("")}
          >
            <LucideX className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Tenants Table */}
      {isLoading ? (
        <div className="flex h-60 items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-indigo-600"></div>
            <span className="mt-4 text-sm font-medium text-gray-700 dark:text-gray-300">Loading tenants...</span>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center shadow-sm dark:border-red-900 dark:bg-red-900/20">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-medium text-red-800 dark:text-red-300">{error}</h3>
          <p className="mb-4 text-sm text-red-700 dark:text-red-400">We couldn't load the tenant data. Please try again.</p>
          <button
            className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-700 dark:hover:bg-red-600"
            onClick={() => window.location.reload()}
          >
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try again
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  <div className="flex items-center">
                    <span>Name</span>
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  <div className="flex items-center">
                    <span>Contact</span>
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  <div className="flex items-center">
                    <span>Room</span>
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  <div className="flex items-center">
                    <span>Property</span>
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  <div className="flex items-center">
                    <span>Lease End</span>
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  <div className="flex items-center">
                    <span>Rent</span>
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  <span>Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTenants.length > 0 ? (
                filteredTenants.map((tenant) => (
                  <tr
                    key={tenant.id}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/40"
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                          {tenant.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{tenant.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{tenant.email}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{tenant.phone}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {tenant.room?.roomNumber || "N/A"}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {tenant.property?.name || "N/A"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <svg className="mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(tenant.leaseEnd).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        ₹{tenant.rentAmount}
                        <span className="text-xs font-normal text-gray-500 dark:text-gray-400">/month</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          className="inline-flex items-center rounded-md bg-indigo-50 p-2 text-indigo-600 transition-colors hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
                          onClick={() => openEditModal(tenant)}
                        >
                          <LucideEdit className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center rounded-md bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                          onClick={() => openDeleteModal(tenant)}
                        >
                          <LucideTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <svg className="mb-4 h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <h3 className="mb-1 text-lg font-medium text-gray-900 dark:text-white">No tenants found</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {searchQuery ? "Try adjusting your search criteria" : "Add your first tenant to get started"}
                      </p>
                      {!searchQuery && (
                        <button
                          type="button"
                          className="mt-4 inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                          onClick={() => setIsAddModalOpen(true)}
                        >
                          <LucidePlus className="mr-2 h-4 w-4" />
                          Add Tenant
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Add Tenant Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Tenant</h2>
              <button
                type="button"
                className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                onClick={() => setIsAddModalOpen(false)}
              >
                <LucideX className="h-5 w-5" />
              </button>
            </div>

            {/* Progress Steps */}
            <div className="mb-8">
              <div className="relative">
                <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 transform bg-gray-200 dark:bg-gray-700"></div>
                <div className="relative flex justify-between">
                  <div className="flex flex-col items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white">1</div>
                    <div className="mt-2 text-xs font-medium text-gray-700 dark:text-gray-300">Personal Info</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-300">2</div>
                    <div className="mt-2 text-xs font-medium text-gray-700 dark:text-gray-300">Room Selection</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-300">3</div>
                    <div className="mt-2 text-xs font-medium text-gray-700 dark:text-gray-300">Lease Details</div>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleAddTenant(); }}>
              {/* Personal Information Section */}
              <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                  <div className="relative mt-1">
                    <input
                      type="text"
                      className="block w-full rounded-md border border-gray-300 bg-white px-4 py-3 pl-10 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      required
                    />
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                  <div className="relative mt-1">
                    <input
                      type="email"
                      className="block w-full rounded-md border border-gray-300 bg-white px-4 py-3 pl-10 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john.doe@example.com"
                      required
                    />
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                  <div className="relative mt-1">
                    <input
                      type="text"
                      className="block w-full rounded-md border border-gray-300 bg-white px-4 py-3 pl-10 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Property</label>
                  <div className="relative mt-1">
                    <select
                      className="block w-full rounded-md border border-gray-300 bg-white px-4 py-3 pl-10 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      value={formData.propertyId}
                      onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                      required
                    >
                      <option value="">Select a property</option>
                      {properties.map((property) => (
                        <option key={property.id} value={property.id}>
                          {property.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Room</label>
                  <div className="relative mt-1">
                    <select
                      className="block w-full rounded-md border border-gray-300 bg-white px-4 py-3 pl-10 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      value={formData.roomId}
                      onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                      required
                    >
                      <option value="">Select a room</option>
                      {availableRooms
                        .filter((room) => !formData.propertyId || room.propertyId === formData.propertyId)
                        .map((room) => (
                          <option key={room.id} value={room.id}>
                            {room.roomNumber} - {room.type} (₹{room.price}/month)
                          </option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Lease End Date</label>
                  <div className="relative mt-1">
                    <input
                      type="date"
                      className="block w-full rounded-md border border-gray-300 bg-white px-4 py-3 pl-10 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      value={formData.leaseEnd}
                      onChange={(e) => setFormData({ ...formData, leaseEnd: e.target.value })}
                      required
                    />
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rent Amount</label>
                  <div className="relative mt-1">
                    <input
                      type="number"
                      className="block w-full rounded-md border border-gray-300 bg-white px-4 py-3 pl-10 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      value={formData.rentAmount}
                      onChange={(e) => setFormData({ ...formData, rentAmount: e.target.value })}
                      placeholder="1000"
                      required
                    />
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-4">
                <button
                  type="button"
                  className="flex items-center rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <span>Add Tenant</span>
                  <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Tenant Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Edit Tenant</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleEditTenant(); }}>
              {/* Same form fields as Add Tenant Modal */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input
                  type="email"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Property</label>
                <select
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                  value={formData.propertyId}
                  onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                  required
                >
                  <option value="">Select a property</option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Room</label>
                <select
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                  value={formData.roomId}
                  onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                  required
                >
                  <option value="">Select a room</option>
                  {[
                    // Include the current room even if it's not available
                    ...(currentTenant?.roomId && currentTenant.room
                      ? [
                          {
                            id: currentTenant.roomId,
                            roomNumber: currentTenant.room.roomNumber,
                            type: currentTenant.room.type,
                            price: currentTenant.room.price,
                            propertyId: currentTenant.propertyId,
                          },
                        ]
                      : []),
                    // Include other available rooms
                    ...availableRooms,
                  ]
                    .filter((room) => !formData.propertyId || room.propertyId === formData.propertyId)
                    .map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.roomNumber} - {room.type} (₹{room.price}/month)
                      </option>
                    ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Lease End Date</label>
                <input
                  type="date"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                  value={formData.leaseEnd}
                  onChange={(e) => setFormData({ ...formData, leaseEnd: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rent Amount</label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                  value={formData.rentAmount}
                  onChange={(e) => setFormData({ ...formData, rentAmount: e.target.value })}
                  required
                />
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Confirm Delete</h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              Are you sure you want to delete tenant <span className="font-medium">{currentTenant?.name}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                onClick={handleDeleteTenant}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
