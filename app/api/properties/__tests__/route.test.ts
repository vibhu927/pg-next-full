import { NextRequest } from 'next/server';
import { GET, POST } from '../route';
import { prisma } from '@/src/lib/prisma';
import { getServerSession } from 'next-auth/next';

// Mock NextAuth
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    property: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe('Properties API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('returns 401 if user is not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('returns properties for authenticated user', async () => {
      const mockSession = {
        user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
      };
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      const mockProperties = [
        {
          id: 'prop-1',
          name: 'Property 1',
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          totalRooms: 10,
          occupiedRooms: 5,
          userId: 'user-123',
          rooms: [],
        },
      ];
      (prisma.property.findMany as jest.Mock).mockResolvedValue(mockProperties);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockProperties);
      expect(prisma.property.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        include: {
          rooms: {
            select: {
              id: true,
              roomNumber: true,
              isAvailable: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('POST', () => {
    it('returns 401 if user is not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/properties', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('validates input data', async () => {
      const mockSession = {
        user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
      };
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      const request = new NextRequest('http://localhost:3000/api/properties', {
        method: 'POST',
        body: JSON.stringify({
          // Missing required fields
          name: 'Property 1',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid input');
      expect(data.details).toBeDefined();
    });

    it('creates a new property for authenticated user', async () => {
      const mockSession = {
        user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
      };
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      const mockProperty = {
        id: 'prop-1',
        name: 'Property 1',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        totalRooms: 10,
        occupiedRooms: 5,
        userId: 'user-123',
      };
      (prisma.property.create as jest.Mock).mockResolvedValue(mockProperty);

      const request = new NextRequest('http://localhost:3000/api/properties', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Property 1',
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          totalRooms: 10,
          occupiedRooms: 5,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockProperty);
      expect(prisma.property.create).toHaveBeenCalledWith({
        data: {
          name: 'Property 1',
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          totalRooms: 10,
          occupiedRooms: 5,
          userId: 'user-123',
        },
      });
    });
  });
});
