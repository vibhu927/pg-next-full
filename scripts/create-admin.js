// Script to create an admin user
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('Creating admin user...');

    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create the admin user
    const admin = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    console.log('Admin created successfully:');
    console.log({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    });

    // Create a property for the admin
    const property = await prisma.property.create({
      data: {
        name: 'Admin Property',
        address: '123 Admin Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        userId: admin.id,
      },
    });

    console.log('Property created for admin:', property.name);

    console.log('\nLogin credentials:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
