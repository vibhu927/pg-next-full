// Script to create a non-admin user
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createUser() {
  try {
    console.log('Creating non-admin user...');

    // Hash the password
    const hashedPassword = await bcrypt.hash('user123', 10);

    // Create the user
    const user = await prisma.user.upsert({
      where: { email: 'user@example.com' },
      update: {},
      create: {
        name: 'Regular User',
        email: 'user@example.com',
        password: hashedPassword,
        role: 'USER',
      },
    });

    console.log('User created successfully:');
    console.log({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    // Create a property for the user
    const property = await prisma.property.create({
      data: {
        name: 'User Residence',
        address: '456 User Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        userId: user.id,
      },
    });

    console.log('Property created for user:', property.name);

    // Create a room in the property
    const room = await prisma.room.create({
      data: {
        roomNumber: '101',
        floor: '1',
        type: 'SINGLE',
        capacity: 1,
        price: 5000,
        isAvailable: false,
        propertyId: property.id,
      },
    });

    console.log('Room created:', room.roomNumber);

    // Create a tenant record for the user
    const tenant = await prisma.tenant.create({
      data: {
        name: 'User Tenant',
        email: 'user@example.com',
        phone: '+91 9876543210',
        rentAmount: 5000,
        securityDeposit: 10000,
        leaseStart: new Date(),
        leaseEnd: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        userId: user.id,
        roomId: room.id,
      },
    });

    console.log('Tenant record created for user');

    // Create some payment records
    const payment1 = await prisma.payment.create({
      data: {
        amount: 5000,
        paymentType: 'RENT',
        status: 'PAID',
        tenantId: tenant.id,
        paymentDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      },
    });

    const payment2 = await prisma.payment.create({
      data: {
        amount: 5000,
        paymentType: 'RENT',
        status: 'PENDING',
        tenantId: tenant.id,
        paymentDate: new Date(),
      },
    });

    console.log('Payment records created for user');

    console.log('\nLogin credentials:');
    console.log('Email: user@example.com');
    console.log('Password: user123');

  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();
