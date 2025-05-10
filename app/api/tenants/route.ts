import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth";
import { z } from "zod";

const tenantSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Valid email is required" }),
  phone: z.string().min(1, { message: "Phone is required" }),
  leaseEnd: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Valid date is required",
  }),
  rentAmount: z.number().positive(),
  roomId: z.string().min(1, { message: "Room ID is required" }),
  propertyId: z.string().min(1, { message: "Property ID is required" }),
});

// GET all tenants (optionally filtered by propertyId)
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");

    // Build the query
    const query: any = {
      where: {},
      include: {
        room: {
          select: {
            roomNumber: true,
            type: true,
            propertyId: true,
            property: {
              select: {
                name: true,
                userId: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    };

    // If propertyId is provided, filter by it
    if (propertyId) {
      query.where.room = {
        propertyId: propertyId,
      };
    } else {
      // Otherwise, get all tenants from rooms in properties owned by the user
      query.where.room = {
        property: {
          userId: session.user.id,
        },
      };
    }

    const tenants = await prisma.tenant.findMany(query);

    return NextResponse.json(tenants);
  } catch (error) {
    console.error("Error fetching tenants:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// POST create a new tenant
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const validatedFields = tenantSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validatedFields.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Check if the property exists and belongs to the user
    const property = await prisma.property.findUnique({
      where: {
        id: validatedFields.data.propertyId,
      },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    if (property.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if the room exists, belongs to the specified property, and is available
    const room = await prisma.room.findUnique({
      where: {
        id: validatedFields.data.roomId,
      },
      include: {
        tenants: true,
      },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (room.propertyId !== validatedFields.data.propertyId) {
      return NextResponse.json(
        { error: "Room does not belong to the specified property" },
        { status: 400 }
      );
    }

    if (!room.isAvailable || room.tenants.length > 0) {
      return NextResponse.json(
        { error: "Room is not available" },
        { status: 400 }
      );
    }

    // Create the tenant and update the room availability in a transaction
    const tenant = await prisma.$transaction(async (tx) => {
      // Create the tenant
      const newTenant = await tx.tenant.create({
        data: {
          name: validatedFields.data.name,
          email: validatedFields.data.email,
          phone: validatedFields.data.phone,
          leaseStart: new Date(),
          leaseEnd: new Date(validatedFields.data.leaseEnd),
          rentAmount: validatedFields.data.rentAmount,
          roomId: validatedFields.data.roomId,
          userId: session.user.id,
        },
      });

      // Update the room availability
      await tx.room.update({
        where: {
          id: validatedFields.data.roomId,
        },
        data: {
          isAvailable: false,
        },
      });

      return newTenant;
    });

    return NextResponse.json(tenant, { status: 201 });
  } catch (error) {
    console.error("Error creating tenant:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
