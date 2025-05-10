import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth";
import { z } from "zod";

const roomSchema = z.object({
  roomNumber: z.string().min(1, { message: "Room number is required" }),
  floor: z.string().optional(),
  type: z.enum(["SINGLE", "DOUBLE", "TRIPLE", "SUITE"]),
  capacity: z.number().int().positive(),
  price: z.number().positive(),
  isAvailable: z.boolean(),
  propertyId: z.string().min(1, { message: "Property ID is required" }),
});

// GET a specific room
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const room = await prisma.room.findUnique({
      where: {
        id: params.id,
      },
      include: {
        property: {
          select: {
            name: true,
            userId: true,
          },
        },
        tenants: true,
      },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Check if the room belongs to a property owned by the current user
    if (room.property.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(room);
  } catch (error) {
    console.error("Error fetching room:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// PUT update a room
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

    const validatedFields = roomSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validatedFields.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Check if the room exists
    const existingRoom = await prisma.room.findUnique({
      where: {
        id: params.id,
      },
      include: {
        property: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!existingRoom) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Check if the room belongs to a property owned by the current user
    if (existingRoom.property.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if the new propertyId (if changed) belongs to the current user
    if (validatedFields.data.propertyId !== existingRoom.propertyId) {
      const newProperty = await prisma.property.findUnique({
        where: {
          id: validatedFields.data.propertyId,
        },
      });

      if (!newProperty) {
        return NextResponse.json({ error: "Property not found" }, { status: 404 });
      }

      if (newProperty.userId !== session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    const updatedRoom = await prisma.room.update({
      where: {
        id: params.id,
      },
      data: validatedFields.data,
    });

    return NextResponse.json(updatedRoom);
  } catch (error) {
    console.error("Error updating room:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// DELETE a room
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the room exists
    const existingRoom = await prisma.room.findUnique({
      where: {
        id: params.id,
      },
      include: {
        property: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!existingRoom) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Check if the room belongs to a property owned by the current user
    if (existingRoom.property.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.room.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error("Error deleting room:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
