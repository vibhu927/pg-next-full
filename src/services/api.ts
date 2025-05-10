// API service for making requests to the backend

// Properties API
export const propertiesApi = {
  // Get all properties
  getAll: async () => {
    const response = await fetch('/api/properties');
    if (!response.ok) {
      throw new Error('Failed to fetch properties');
    }
    return response.json();
  },

  // Get a property by ID
  getById: async (id: string) => {
    const response = await fetch(`/api/properties/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch property');
    }
    return response.json();
  },

  // Create a new property
  create: async (data: any) => {
    const response = await fetch('/api/properties', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create property');
    }
    return response.json();
  },

  // Update a property
  update: async (id: string, data: any) => {
    const response = await fetch(`/api/properties/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update property');
    }
    return response.json();
  },

  // Delete a property
  delete: async (id: string) => {
    const response = await fetch(`/api/properties/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete property');
    }
    return response.json();
  },
};

// Rooms API
export const roomsApi = {
  // Get all rooms
  getAll: async (propertyId?: string) => {
    const url = propertyId ? `/api/rooms?propertyId=${propertyId}` : '/api/rooms';
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch rooms');
    }
    return response.json();
  },

  // Get a room by ID
  getById: async (id: string) => {
    const response = await fetch(`/api/rooms/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch room');
    }
    return response.json();
  },

  // Create a new room
  create: async (data: any) => {
    const response = await fetch('/api/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create room');
    }
    return response.json();
  },

  // Update a room
  update: async (id: string, data: any) => {
    const response = await fetch(`/api/rooms/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update room');
    }
    return response.json();
  },

  // Delete a room
  delete: async (id: string) => {
    const response = await fetch(`/api/rooms/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete room');
    }
    return response.json();
  },
};

// Tenants API
export const tenantsApi = {
  // Get all tenants
  getAll: async (propertyId?: string) => {
    const url = propertyId ? `/api/tenants?propertyId=${propertyId}` : '/api/tenants';
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch tenants');
    }
    return response.json();
  },

  // Get a tenant by ID
  getById: async (id: string) => {
    const response = await fetch(`/api/tenants/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch tenant');
    }
    return response.json();
  },

  // Create a new tenant
  create: async (data: any) => {
    const response = await fetch('/api/tenants', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create tenant');
    }
    return response.json();
  },

  // Update a tenant
  update: async (id: string, data: any) => {
    const response = await fetch(`/api/tenants/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update tenant');
    }
    return response.json();
  },

  // Delete a tenant
  delete: async (id: string) => {
    const response = await fetch(`/api/tenants/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete tenant');
    }
    return response.json();
  },
};
