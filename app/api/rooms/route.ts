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

// GET all rooms (optionally filtered by propertyId)
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
        property: {
          select: {
            name: true,
            userId: true,
          },
        },
      },
      orderBy: {
        roomNumber: "asc",
      },
    };

    // If propertyId is provided, filter by it
    if (propertyId) {
      query.where.propertyId = propertyId;
    } else {
      // Otherwise, get all rooms from properties owned by the user
      query.where.property = {
        userId: session.user.id,
      };
    }

    const rooms = await prisma.room.findMany(query);

    // All rooms should already belong to the user based on the query
    const userRooms = rooms;

    return NextResponse.json(userRooms);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// POST create a new room
export async function POST(req: Request) {
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

    const room = await prisma.room.create({
      data: validatedFields.data,
    });

    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
