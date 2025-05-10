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

// GET a specific tenant
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: {
        id: params.id,
      },
      include: {
        room: true,
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Check if the tenant belongs to the current user
    if (tenant.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(tenant);
  } catch (error) {
    console.error("Error fetching tenant:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// PUT update a tenant
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    // Check if the tenant exists
    const existingTenant = await prisma.tenant.findUnique({
      where: {
        id: params.id,
      },
      include: {
        room: true,
      },
    });

    if (!existingTenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Check if the tenant belongs to the current user
    if (existingTenant.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
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

    // If the room is being changed, check if the new room is available
    if (validatedFields.data.roomId !== existingTenant.roomId) {
      const newRoom = await prisma.room.findUnique({
        where: {
          id: validatedFields.data.roomId,
        },
        include: {
          tenants: true,
        },
      });

      if (!newRoom) {
        return NextResponse.json({ error: "Room not found" }, { status: 404 });
      }

      if (newRoom.propertyId !== validatedFields.data.propertyId) {
        return NextResponse.json(
          { error: "Room does not belong to the specified property" },
          { status: 400 }
        );
      }

      if (!newRoom.isAvailable || newRoom.tenants.length > 0) {
        return NextResponse.json(
          { error: "Room is not available" },
          { status: 400 }
        );
      }
    }

    // Update the tenant and handle room availability in a transaction
    const updatedTenant = await prisma.$transaction(async (tx) => {
      // If the room is being changed, update the old room's availability
      if (validatedFields.data.roomId !== existingTenant.roomId) {
        await tx.room.update({
          where: {
            id: existingTenant.roomId,
          },
          data: {
            isAvailable: true,
          },
        });

        // Update the new room's availability
        await tx.room.update({
          where: {
            id: validatedFields.data.roomId,
          },
          data: {
            isAvailable: false,
          },
        });
      }

      // Update the tenant
      return await tx.tenant.update({
        where: {
          id: params.id,
        },
        data: {
          name: validatedFields.data.name,
          email: validatedFields.data.email,
          phone: validatedFields.data.phone,
          leaseEnd: new Date(validatedFields.data.leaseEnd),
          rentAmount: validatedFields.data.rentAmount,
          roomId: validatedFields.data.roomId,
        },
      });
    });

    return NextResponse.json(updatedTenant);
  } catch (error) {
    console.error("Error updating tenant:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// DELETE a tenant
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the tenant exists
    const existingTenant = await prisma.tenant.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!existingTenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Check if the tenant belongs to the current user
    if (existingTenant.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete the tenant and update the room availability in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete the tenant
      await tx.tenant.delete({
        where: {
          id: params.id,
        },
      });

      // Update the room availability if the tenant had a room
      if (existingTenant.roomId) {
        await tx.room.update({
          where: {
            id: existingTenant.roomId,
          },
          data: {
            isAvailable: true,
          },
        });
      }
    });

    return NextResponse.json({ message: "Tenant deleted successfully" });
  } catch (error) {
    console.error("Error deleting tenant:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
