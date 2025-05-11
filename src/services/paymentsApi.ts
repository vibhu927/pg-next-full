// Payments API service

export const paymentsApi = {
  // Get all payments
  getAll: async (tenantId?: string) => {
    const url = tenantId ? `/api/payments?tenantId=${tenantId}` : '/api/payments';
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch payments');
    }
    return response.json();
  },

  // Get a payment by ID
  getById: async (id: string) => {
    const response = await fetch(`/api/payments/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch payment');
    }
    return response.json();
  },

  // Create a new payment
  create: async (data: any) => {
    const response = await fetch('/api/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create payment');
    }
    return response.json();
  },

  // Update a payment
  update: async (id: string, data: any) => {
    const response = await fetch(`/api/payments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update payment');
    }
    return response.json();
  },

  // Delete a payment
  delete: async (id: string) => {
    const response = await fetch(`/api/payments/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete payment');
    }
    return response.json();
  },

  // Get monthly revenue data
  getMonthlyRevenue: async () => {
    const response = await fetch('/api/analytics/monthly-revenue');
    if (!response.ok) {
      throw new Error('Failed to fetch monthly revenue data');
    }
    return response.json();
  },
};
