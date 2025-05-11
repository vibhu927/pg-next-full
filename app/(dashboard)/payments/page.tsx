"use client";

import { useState, useEffect } from "react";
import { LucideSearch, LucideX, LucidePlus, LucideCheck, LucideAlertCircle } from "lucide-react";
import { paymentsApi } from "@/src/services/paymentsApi";
import { tenantsApi } from "@/src/services/api";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import QRCode from "react-qr-code";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    paymentType: "RENT",
    tenantId: "",
  });
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  // Fetch payments and tenants on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch payments - admin sees all payments, users see only their own
        const paymentsData = await paymentsApi.getAll();
        setPayments(paymentsData);

        // Fetch tenants - admin sees all tenants, users see only themselves
        const tenantsData = await tenantsApi.getAll();
        setTenants(tenantsData);

        // If user is not admin, set the selected tenant to the current user's tenant
        if (!isAdmin && tenantsData.length > 0) {
          // Find tenant that matches the current user's email
          const userTenant = tenantsData.find(tenant => tenant.email === session?.user?.email);
          if (userTenant) {
            setSelectedTenant(userTenant);
          }
        }

        console.log("Fetched payments:", paymentsData.length);
        console.log("Fetched tenants:", tenantsData.length);
        console.log("Selected tenant:", selectedTenant?.id);

        setError("");
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again.");
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAdmin, session?.user?.email]);

  // Filter payments based on search query
  const filteredPayments = payments.filter(
    (payment) =>
      payment.tenant?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.tenant?.room?.roomNumber?.includes(searchQuery) ||
      payment.tenant?.room?.property?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.amount.toString().includes(searchQuery) ||
      payment.paymentType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddPayment = async () => {
    try {
      const paymentData = {
        amount: parseFloat(formData.amount),
        paymentType: formData.paymentType,
        tenantId: formData.tenantId,
      };

      await paymentsApi.create(paymentData);

      // Refresh the payments list
      const paymentsData = await paymentsApi.getAll();
      setPayments(paymentsData);

      setIsAddModalOpen(false);
      resetForm();
      toast.success("Payment added successfully");
    } catch (err) {
      console.error("Error adding payment:", err);
      toast.error("Failed to add payment");
    }
  };

  const handleMarkAsPaid = async (paymentId: string) => {
    try {
      await paymentsApi.update(paymentId, { status: "WAITING_APPROVAL" });

      // Refresh the payments list
      const paymentsData = await paymentsApi.getAll();
      setPayments(paymentsData);

      toast.success("Payment marked as paid and waiting for approval");
    } catch (err) {
      console.error("Error updating payment:", err);
      toast.error("Failed to update payment");
    }
  };

  const handleApprovePayment = async (paymentId: string) => {
    try {
      console.log("Approving payment:", paymentId);

      const result = await paymentsApi.update(paymentId, { status: "PAID" });
      console.log("Payment approved:", result);

      // Refresh the payments list
      const paymentsData = await paymentsApi.getAll();
      setPayments(paymentsData);

      toast.success("Payment approved successfully");
    } catch (err) {
      console.error("Error approving payment:", err);
      toast.error("Failed to approve payment: " + (err.message || "Unknown error"));
    }
  };

  const handleDeclinePayment = async (paymentId: string) => {
    try {
      console.log("Declining payment:", paymentId);

      const result = await paymentsApi.update(paymentId, { status: "FAILED" });
      console.log("Payment declined:", result);

      // Refresh the payments list
      const paymentsData = await paymentsApi.getAll();
      setPayments(paymentsData);

      toast.success("Payment declined");
    } catch (err) {
      console.error("Error declining payment:", err);
      toast.error("Failed to decline payment: " + (err.message || "Unknown error"));
    }
  };

  const openQrModal = (tenant: any) => {
    console.log("Opening QR modal for tenant:", tenant);
    setSelectedTenant(tenant);
    setIsQrModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      amount: "",
      paymentType: "RENT",
      tenantId: "",
    });
  };

  const handleCreatePayment = async () => {
    if (!selectedTenant) {
      toast.error("No tenant information found");
      return;
    }

    try {
      setIsCreatingPayment(true);

      console.log("Creating payment for tenant:", selectedTenant);

      // Create a new payment with WAITING_APPROVAL status
      const paymentData = {
        amount: parseFloat(selectedTenant.rentAmount),
        paymentType: "RENT",
        tenantId: selectedTenant.id,
        status: "WAITING_APPROVAL"
      };

      console.log("Payment data:", paymentData);

      const result = await paymentsApi.create(paymentData);
      console.log("Payment created:", result);

      // Refresh the payments list
      const paymentsData = await paymentsApi.getAll();
      setPayments(paymentsData);

      setIsQrModalOpen(false);
      toast.success("Payment marked as paid and waiting for approval");
    } catch (err) {
      console.error("Error creating payment:", err);
      toast.error("Failed to create payment: " + (err.message || "Unknown error"));
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "WAITING_APPROVAL":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "PAID":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "FAILED":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "REFUNDED":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isAdmin ? "Payment Management" : "Your Payments"}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {isAdmin
                ? "Manage payments, approve or decline payment requests"
                : "View your payment history and make new payments"}
            </p>
          </div>
          {!isAdmin && (
            <button
              type="button"
              className="inline-flex items-center rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              onClick={() => {
                // For regular users, we already set the selectedTenant in useEffect
                if (selectedTenant) {
                  setIsQrModalOpen(true);
                } else {
                  toast.error("No tenant information found. Please contact support.");
                }
              }}
            >
              <LucidePlus className="mr-2 h-4 w-4" />
              Make Payment
            </button>
          )}
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
          placeholder="Search payments by tenant, room, property, amount, type, or status..."
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

      {/* Payments Table */}
      {isLoading ? (
        <div className="flex h-60 items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-indigo-600"></div>
            <span className="mt-4 text-sm font-medium text-gray-700 dark:text-gray-300">Loading payments...</span>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center shadow-sm dark:border-red-900 dark:bg-red-900/20">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <LucideAlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="mb-2 text-lg font-medium text-red-800 dark:text-red-300">{error}</h3>
          <p className="mb-4 text-sm text-red-700 dark:text-red-400">We couldn't load the payment data. Please try again.</p>
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
                      <span>Tenant</span>
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    <div className="flex items-center">
                      <span>Room/Property</span>
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    <div className="flex items-center">
                      <span>Amount</span>
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    <div className="flex items-center">
                      <span>Type</span>
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    <div className="flex items-center">
                      <span>Date</span>
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    <div className="flex items-center">
                      <span>Status</span>
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    <span>Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/40"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                            {payment.tenant?.name?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{payment.tenant?.name || "Unknown"}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{payment.tenant?.email || "No email"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">{payment.tenant?.room?.roomNumber || "Unknown"}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{payment.tenant?.room?.property?.name || "Unknown"}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">₹{payment.amount.toLocaleString()}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          {payment.paymentType.replace(/_/g, " ")}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(payment.status)}`}>
                          {payment.status.replace(/_/g, " ")}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          {payment.status === "PENDING" && !isAdmin && (
                            <button
                              type="button"
                              className="inline-flex items-center rounded-md bg-green-50 p-2 text-green-600 transition-colors hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30"
                              onClick={() => handleMarkAsPaid(payment.id)}
                            >
                              <LucideCheck className="h-4 w-4" />
                            </button>
                          )}
                          {payment.status === "WAITING_APPROVAL" && isAdmin && (
                            <>
                              <button
                                type="button"
                                className="inline-flex items-center rounded-md bg-green-50 p-2 text-green-600 transition-colors hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30"
                                onClick={() => handleApprovePayment(payment.id)}
                              >
                                <LucideCheck className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                className="inline-flex items-center rounded-md bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                                onClick={() => handleDeclinePayment(payment.id)}
                              >
                                <LucideX className="h-4 w-4" />
                              </button>
                            </>
                          )}
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
                        <h3 className="mb-1 text-lg font-medium text-gray-900 dark:text-white">No payments found</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {searchQuery ? "Try adjusting your search criteria" : "No payment records available"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Make Payment</h2>
              <button
                type="button"
                className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                onClick={() => setIsQrModalOpen(false)}
              >
                <LucideX className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="bg-white p-4 rounded-lg">
                {selectedTenant ? (
                  <>
                    <div className="mb-4 text-center">
                      <p className="text-sm font-medium text-gray-700">Amount: <span className="font-bold">₹{selectedTenant.rentAmount}</span></p>
                      <p className="text-xs text-gray-500">Tenant: {selectedTenant.name}</p>
                    </div>
                    <QRCode
                      value={`upi://pay?pa=example@upi&pn=PG%20Management&am=${selectedTenant.rentAmount || ''}&cu=INR&tn=Rent%20Payment`}
                      size={200}
                    />
                  </>
                ) : (
                  <div className="h-48 w-48 flex items-center justify-center">
                    <p className="text-sm text-gray-500">No tenant information available</p>
                  </div>
                )}
              </div>
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Scan this QR code to make your payment using any UPI app.
              </p>
              <div className="w-full space-y-4">
                <div className="rounded-md bg-yellow-50 p-4 dark:bg-yellow-900/20">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400 dark:text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Important</h3>
                      <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-200">
                        <p>After completing the payment, click the button below to mark it as paid. Your payment will be pending approval from the admin.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleCreatePayment}
                  disabled={isCreatingPayment}
                >
                  {isCreatingPayment ? (
                    <>
                      <svg className="mr-2 -ml-1 h-4 w-4 animate-spin text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    "I've Made the Payment"
                  )}
                </button>
                <button
                  type="button"
                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  onClick={() => setIsQrModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
