// Mock data for shipments
const mockShipments = [
  {
    id: "1",
    pickupAddress: {
      street: "123 Main Street",
      city: "New York",
      state: "NY",
      zip: "10001"
    },
    deliveryAddress: {
      street: "456 Park Avenue",
      city: "Los Angeles",
      state: "CA",
      zip: "90001"
    },
    packageType: "Box",
    weight: "10",
    dimensions: "12x10x8",
    budget: 500,
    description: "Fragile items, handle with care",
    status: "pending",
    createdAt: "2023-01-15T10:30:00Z",
    userId: "user1"
  },
  {
    id: "2",
    pickupAddress: {
      street: "789 Broadway",
      city: "Chicago",
      state: "IL",
      zip: "60601"
    },
    deliveryAddress: {
      street: "101 Market Street",
      city: "San Francisco",
      state: "CA",
      zip: "94105"
    },
    packageType: "Pallet",
    weight: "100",
    dimensions: "48x40x48",
    budget: 1200,
    description: "Heavy machinery parts",
    status: "in_transit",
    createdAt: "2023-01-20T14:45:00Z",
    userId: "user1"
  },
  {
    id: "3",
    pickupAddress: {
      street: "555 5th Avenue",
      city: "Miami",
      state: "FL",
      zip: "33101"
    },
    deliveryAddress: {
      street: "777 7th Street",
      city: "Seattle",
      state: "WA",
      zip: "98101"
    },
    packageType: "Envelope",
    weight: "0.5",
    dimensions: "12x9x0.5",
    budget: 200,
    description: "Important documents",
    status: "delivered",
    createdAt: "2023-01-10T09:15:00Z",
    userId: "user2"
  },
  {
    id: "4",
    pickupAddress: {
      street: "222 2nd Avenue",
      city: "Boston",
      state: "MA",
      zip: "02108"
    },
    deliveryAddress: {
      street: "444 4th Street",
      city: "Austin",
      state: "TX",
      zip: "78701"
    },
    packageType: "Box",
    weight: "15",
    dimensions: "18x14x12",
    budget: 600,
    description: "Electronics",
    status: "pending",
    createdAt: "2023-01-25T11:20:00Z",
    userId: "user2"
  },
  {
    id: "5",
    pickupAddress: {
      street: "333 3rd Street",
      city: "Denver",
      state: "CO",
      zip: "80201"
    },
    deliveryAddress: {
      street: "666 6th Avenue",
      city: "Phoenix",
      state: "AZ",
      zip: "85001"
    },
    packageType: "Crate",
    weight: "75",
    dimensions: "36x24x24",
    budget: 900,
    description: "Artwork, fragile",
    status: "pending",
    createdAt: "2023-01-30T16:10:00Z",
    userId: "user3"
  }
];

// Mock data for bids
const mockBids = [
  {
    id: "1",
    shipmentId: "1",
    driverId: "driver1",
    amount: 450,
    note: "Can deliver within 3 days",
    status: "pending",
    createdAt: "2023-01-16T11:30:00Z"
  },
  {
    id: "2",
    shipmentId: "1",
    driverId: "driver2",
    amount: 480,
    note: "Can deliver tomorrow",
    status: "accepted",
    createdAt: "2023-01-16T12:45:00Z"
  },
  {
    id: "3",
    shipmentId: "2",
    driverId: "driver1",
    amount: 1100,
    note: "Have experience with heavy machinery",
    status: "accepted",
    createdAt: "2023-01-21T09:20:00Z"
  },
  {
    id: "4",
    shipmentId: "4",
    driverId: "driver3",
    amount: 550,
    note: "Can handle electronics carefully",
    status: "pending",
    createdAt: "2023-01-26T14:15:00Z"
  },
  {
    id: "5",
    shipmentId: "5",
    driverId: "driver2",
    amount: 850,
    note: "Specialized in handling artwork",
    status: "rejected",
    createdAt: "2023-01-31T10:05:00Z"
  }
];

// Get all shipments
export const getShipments = async () => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockShipments;
};

// Get shipment by ID
export const getShipmentById = async (id) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockShipments.find(shipment => shipment.id === id);
};

// Get shipments by user ID
export const getShipmentsByUserId = async (userId) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockShipments.filter(shipment => shipment.userId === userId);
};

// Create a new shipment
export const createShipment = async (shipmentData) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  const newShipment = {
    id: (mockShipments.length + 1).toString(),
    ...shipmentData,
    status: "pending",
    createdAt: new Date().toISOString()
  };
  
  mockShipments.push(newShipment);
  return newShipment;
};

// Update a shipment
export const updateShipment = async (id, shipmentData) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const index = mockShipments.findIndex(shipment => shipment.id === id);
  if (index === -1) {
    throw new Error("Shipment not found");
  }
  
  const updatedShipment = {
    ...mockShipments[index],
    ...shipmentData
  };
  
  mockShipments[index] = updatedShipment;
  return updatedShipment;
};

// Delete a shipment
export const deleteShipment = async (id) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const index = mockShipments.findIndex(shipment => shipment.id === id);
  if (index === -1) {
    throw new Error("Shipment not found");
  }
  
  mockShipments.splice(index, 1);
  return { success: true };
};

// Get all bids
export const getBids = async () => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockBids;
};

// Get bids by shipment ID
export const getBidsByShipmentId = async (shipmentId) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 400));
  return mockBids.filter(bid => bid.shipmentId === shipmentId);
};

// Get bids by driver ID
export const getBidsByDriverId = async (driverId) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 400));
  return mockBids.filter(bid => bid.driverId === driverId);
};

// Create a new bid
export const createBid = async (bidData) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const newBid = {
    id: (mockBids.length + 1).toString(),
    ...bidData,
    status: "pending",
    createdAt: new Date().toISOString()
  };
  
  mockBids.push(newBid);
  return newBid;
};

// Update a bid
export const updateBid = async (id, bidData) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = mockBids.findIndex(bid => bid.id === id);
  if (index === -1) {
    throw new Error("Bid not found");
  }
  
  const updatedBid = {
    ...mockBids[index],
    ...bidData
  };
  
  mockBids[index] = updatedBid;
  return updatedBid;
};

// Get available shipments for drivers
export const getAvailableShipments = async () => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // Get shipments with status "pending"
  return mockShipments.filter(shipment => shipment.status === "pending");
};
