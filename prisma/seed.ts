import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create a test user
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('Created user:', user.name);

  // Create properties
  const property1 = await prisma.property.upsert({
    where: { id: 'clm1' },
    update: {},
    create: {
      id: 'clm1',
      name: 'Sunshine Apartments',
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      userId: user.id,
    },
  });

  const property2 = await prisma.property.upsert({
    where: { id: 'clm2' },
    update: {},
    create: {
      id: 'clm2',
      name: 'Green Valley Residency',
      address: '456 Park Avenue',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      userId: user.id,
    },
  });

  console.log('Created properties:', property1.name, property2.name);

  // Create rooms for property 1
  const rooms1 = await Promise.all([
    prisma.room.upsert({
      where: { id: 'clr1' },
      update: {},
      create: {
        id: 'clr1',
        roomNumber: '101',
        floor: '1',
        type: 'SINGLE',
        capacity: 1,
        price: 500,
        isAvailable: true,
        propertyId: property1.id,
      },
    }),
    prisma.room.upsert({
      where: { id: 'clr2' },
      update: {},
      create: {
        id: 'clr2',
        roomNumber: '102',
        floor: '1',
        type: 'DOUBLE',
        capacity: 2,
        price: 800,
        isAvailable: false,
        propertyId: property1.id,
      },
    }),
    prisma.room.upsert({
      where: { id: 'clr3' },
      update: {},
      create: {
        id: 'clr3',
        roomNumber: '201',
        floor: '2',
        type: 'SINGLE',
        capacity: 1,
        price: 550,
        isAvailable: true,
        propertyId: property1.id,
      },
    }),
  ]);

  // Create rooms for property 2
  const rooms2 = await Promise.all([
    prisma.room.upsert({
      where: { id: 'clr4' },
      update: {},
      create: {
        id: 'clr4',
        roomNumber: '301',
        floor: '3',
        type: 'SUITE',
        capacity: 3,
        price: 1200,
        isAvailable: true,
        propertyId: property2.id,
      },
    }),
    prisma.room.upsert({
      where: { id: 'clr5' },
      update: {},
      create: {
        id: 'clr5',
        roomNumber: '302',
        floor: '3',
        type: 'DOUBLE',
        capacity: 2,
        price: 900,
        isAvailable: false,
        propertyId: property2.id,
      },
    }),
  ]);

  console.log('Created rooms:', rooms1.length + rooms2.length);

  // Create tenants
  const tenant1 = await prisma.tenant.upsert({
    where: { id: 'clt1' },
    update: {},
    create: {
      id: 'clt1',
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '+1 (555) 123-4567',
      leaseStart: new Date('2023-01-01'),
      leaseEnd: new Date('2024-12-31'),
      rentAmount: 850,
      userId: user.id,
      roomId: rooms1[1].id, // Room 102
    },
  });

  const tenant2 = await prisma.tenant.upsert({
    where: { id: 'clt2' },
    update: {},
    create: {
      id: 'clt2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      phone: '+1 (555) 234-5678',
      leaseStart: new Date('2023-02-15'),
      leaseEnd: new Date('2024-10-15'),
      rentAmount: 950,
      userId: user.id,
      roomId: rooms2[1].id, // Room 302
    },
  });

  console.log('Created tenants:', tenant1.name, tenant2.name);

  console.log('Database seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
