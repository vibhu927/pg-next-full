"use client";

import { useState, useEffect } from "react";
import { LucideEdit, LucideTrash, LucidePlus, LucideSearch, LucideX, LucideHome } from "lucide-react";
import { propertiesApi } from "@/src/services/api";
import { toast } from "react-hot-toast";
import { MultiStepForm } from "@/src/components/ui/MultiStepForm";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentProperty, setCurrentProperty] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    totalRooms: "",
    occupiedRooms: "",
  });

  // Fetch properties on component mount
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoading(true);
        const data = await propertiesApi.getAll();
        setProperties(data);
        setError("");
      } catch (err) {
        console.error("Error fetching properties:", err);
        setError("Failed to load properties. Please try again.");
        toast.error("Failed to load properties");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Filter properties based on search query
  const filteredProperties = properties.filter(
    (property) =>
      property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.zipCode.includes(searchQuery)
  );

  const handleAddProperty = async () => {
    try {
      const propertyData = {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        totalRooms: parseInt(formData.totalRooms),
        occupiedRooms: parseInt(formData.occupiedRooms),
      };

      const newProperty = await propertiesApi.create(propertyData);
      setProperties([...properties, newProperty]);
      setIsAddModalOpen(false);
      resetForm();
      toast.success("Property added successfully");
    } catch (err) {
      console.error("Error adding property:", err);
      toast.error("Failed to add property");
    }
  };

  const handleEditProperty = async () => {
    try {
      const propertyData = {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        totalRooms: parseInt(formData.totalRooms),
        occupiedRooms: parseInt(formData.occupiedRooms),
      };

      const updatedProperty = await propertiesApi.update(currentProperty.id, propertyData);

      setProperties(
        properties.map((property) =>
          property.id === currentProperty.id ? updatedProperty : property
        )
      );

      setIsEditModalOpen(false);
      resetForm();
      toast.success("Property updated successfully");
    } catch (err) {
      console.error("Error updating property:", err);
      toast.error("Failed to update property");
    }
  };

  const handleDeleteProperty = async () => {
    try {
      await propertiesApi.delete(currentProperty.id);

      setProperties(
        properties.filter((property) => property.id !== currentProperty.id)
      );

      setIsDeleteModalOpen(false);
      toast.success("Property deleted successfully");
    } catch (err) {
      console.error("Error deleting property:", err);
      toast.error("Failed to delete property");
    }
  };

  const openEditModal = (property: any) => {
    setCurrentProperty(property);
    setFormData({
      name: property.name,
      address: property.address,
      city: property.city,
      state: property.state,
      zipCode: property.zipCode,
      totalRooms: property.totalRooms.toString(),
      occupiedRooms: property.occupiedRooms.toString(),
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (property: any) => {
    setCurrentProperty(property);
    setIsDeleteModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      totalRooms: "",
      occupiedRooms: "",
    });
    setCurrentProperty(null);
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Property Management</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage your properties, view their details, and track occupancy rates
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            onClick={() => setIsAddModalOpen(true)}
          >
            <LucidePlus className="mr-2 h-4 w-4" />
            Add New Property
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Properties</h2>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{properties.length}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Rooms</h2>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {properties.reduce((sum, p) => sum + (p.totalRooms || 0), 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Occupied Rooms</h2>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {properties.reduce((sum, p) => sum + (p.occupiedRooms || 0), 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Occupancy</h2>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {properties.length > 0
                    ? Math.round(
                        (properties.reduce((sum, p) => sum + (p.occupiedRooms || 0), 0) /
                        properties.reduce((sum, p) => sum + (p.totalRooms || 0), 0)) * 100
                      )
                    : 0}%
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
          placeholder="Search properties by name, address, city, or state..."
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

      {/* Properties Grid */}
      {isLoading ? (
        <div className="flex h-60 items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-indigo-600"></div>
            <span className="mt-4 text-sm font-medium text-gray-700 dark:text-gray-300">Loading properties...</span>
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
          <p className="mb-4 text-sm text-red-700 dark:text-red-400">We couldn't load the property data. Please try again.</p>
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProperties.length > 0 ? (
            filteredProperties.map((property) => (
            <div
              key={property.id}
              className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="relative">
                <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                <div className="absolute -bottom-6 left-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white shadow-md dark:bg-gray-700">
                    <LucideHome className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>
              </div>

              <div className="p-6 pt-8">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{property.name}</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {property.address}, {property.city}, {property.state} {property.zipCode}
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md bg-indigo-50 p-2 text-indigo-600 transition-colors hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
                      onClick={() => openEditModal(property)}
                    >
                      <LucideEdit className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                      onClick={() => openDeleteModal(property)}
                    >
                      <LucideTrash className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3 border-t border-gray-100 pt-4 dark:border-gray-700">
                  <div className="text-center">
                    <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Total</p>
                    <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{property.totalRooms}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Occupied</p>
                    <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{property.occupiedRooms}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Occupancy</p>
                    <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
                      {Math.round((property.occupiedRooms / property.totalRooms) * 100)}%
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-medium text-indigo-600 dark:text-indigo-400">Occupancy Rate</span>
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      {property.occupiedRooms}/{property.totalRooms}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600"
                      style={{ width: `${(property.occupiedRooms / property.totalRooms) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))
          ) : (
            <div className="col-span-full flex h-60 flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800">
              <svg className="mb-4 h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="mb-1 text-lg font-medium text-gray-900 dark:text-white">No properties found</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {searchQuery ? "Try adjusting your search criteria" : "Add your first property to get started"}
              </p>
              {!searchQuery && (
                <button
                  type="button"
                  className="mt-4 inline-flex items-center rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-medium text-white hover:from-indigo-700 hover:to-purple-700"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  <LucidePlus className="mr-2 h-4 w-4" />
                  Add Property
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add Property Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Property</h2>
              <button
                type="button"
                className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                onClick={() => setIsAddModalOpen(false)}
              >
                <LucideX className="h-5 w-5" />
              </button>
            </div>

            <MultiStepForm
              steps={[
                {
                  title: "Property Info",
                  content: (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Property Name</label>
                        <div className="relative mt-1">
                          <input
                            type="text"
                            className="block w-full rounded-md border border-gray-300 bg-white px-4 py-3 pl-10 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Sunrise Residency"
                            required
                          />
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  title: "Location",
                  content: (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                        <div className="relative mt-1">
                          <input
                            type="text"
                            className="block w-full rounded-md border border-gray-300 bg-white px-4 py-3 pl-10 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="123 Main Street"
                            required
                          />
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                        <div className="relative mt-1">
                          <input
                            type="text"
                            className="block w-full rounded-md border border-gray-300 bg-white px-4 py-3 pl-10 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            placeholder="New York"
                            required
                          />
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">State</label>
                        <div className="relative mt-1">
                          <input
                            type="text"
                            className="block w-full rounded-md border border-gray-300 bg-white px-4 py-3 pl-10 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            value={formData.state}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            placeholder="NY"
                            required
                          />
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">ZIP Code</label>
                        <div className="relative mt-1">
                          <input
                            type="text"
                            className="block w-full rounded-md border border-gray-300 bg-white px-4 py-3 pl-10 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            value={formData.zipCode}
                            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                            placeholder="10001"
                            required
                          />
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  title: "Room Details",
                  content: (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Total Rooms</label>
                        <div className="relative mt-1">
                          <input
                            type="number"
                            className="block w-full rounded-md border border-gray-300 bg-white px-4 py-3 pl-10 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            value={formData.totalRooms}
                            onChange={(e) => setFormData({ ...formData, totalRooms: e.target.value })}
                            min="1"
                            placeholder="10"
                            required
                          />
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Occupied Rooms</label>
                        <div className="relative mt-1">
                          <input
                            type="number"
                            className="block w-full rounded-md border border-gray-300 bg-white px-4 py-3 pl-10 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            value={formData.occupiedRooms}
                            onChange={(e) => setFormData({ ...formData, occupiedRooms: e.target.value })}
                            min="0"
                            max={formData.totalRooms || 0}
                            placeholder="5"
                            required
                          />
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  ),
                },
              ]}
              onComplete={handleAddProperty}
              onCancel={() => setIsAddModalOpen(false)}
              submitButtonText="Add Property"
            />
          </div>
        </div>
      )}

      {/* Edit Property Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Property</h2>
              <button
                type="button"
                className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                onClick={() => setIsEditModalOpen(false)}
              >
                <LucideX className="h-5 w-5" />
              </button>
            </div>

            <MultiStepForm
              steps={[
                {
                  title: "Property Info",
                  content: (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Property Name</label>
                        <div className="relative mt-1">
                          <input
                            type="text"
                            className="block w-full rounded-md border border-gray-300 bg-white px-4 py-3 pl-10 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Sunrise Residency"
                            required
                          />
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  title: "Location",
                  content: (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                        <div className="relative mt-1">
                          <input
                            type="text"
                            className="block w-full rounded-md border border-gray-300 bg-white px-4 py-3 pl-10 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="123 Main Street"
                            required
                          />
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                        <div className="relative mt-1">
                          <input
                            type="text"
                            className="block w-full rounded-md border border-gray-300 bg-white px-4 py-3 pl-10 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            placeholder="New York"
                            required
                          />
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">State</label>
                        <div className="relative mt-1">
                          <input
                            type="text"
                            className="block w-full rounded-md border border-gray-300 bg-white px-4 py-3 pl-10 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            value={formData.state}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            placeholder="NY"
                            required
                          />
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">ZIP Code</label>
                        <div className="relative mt-1">
                          <input
                            type="text"
                            className="block w-full rounded-md border border-gray-300 bg-white px-4 py-3 pl-10 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            value={formData.zipCode}
                            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                            placeholder="10001"
                            required
                          />
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  title: "Room Details",
                  content: (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Total Rooms</label>
                        <div className="relative mt-1">
                          <input
                            type="number"
                            className="block w-full rounded-md border border-gray-300 bg-white px-4 py-3 pl-10 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            value={formData.totalRooms}
                            onChange={(e) => setFormData({ ...formData, totalRooms: e.target.value })}
                            min="1"
                            placeholder="10"
                            required
                          />
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Occupied Rooms</label>
                        <div className="relative mt-1">
                          <input
                            type="number"
                            className="block w-full rounded-md border border-gray-300 bg-white px-4 py-3 pl-10 text-sm shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            value={formData.occupiedRooms}
                            onChange={(e) => setFormData({ ...formData, occupiedRooms: e.target.value })}
                            min="0"
                            max={formData.totalRooms || 0}
                            placeholder="5"
                            required
                          />
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  ),
                },
              ]}
              onComplete={handleEditProperty}
              onCancel={() => setIsEditModalOpen(false)}
              submitButtonText="Save Changes"
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Confirm Deletion</h2>
              <p className="text-gray-700 dark:text-gray-300">
                Are you sure you want to delete the property <span className="font-semibold">"{currentProperty?.name}"</span>?
              </p>
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                This action cannot be undone. All associated rooms and tenant data will be permanently removed.
              </p>
            </div>
            <div className="flex justify-center space-x-4">
              <button
                type="button"
                className="flex items-center rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
              <button
                type="button"
                className="flex items-center rounded-md bg-gradient-to-r from-red-600 to-pink-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:from-red-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                onClick={handleDeleteProperty}
              >
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Property
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
