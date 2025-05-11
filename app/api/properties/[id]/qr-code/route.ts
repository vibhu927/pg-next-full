import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth";

// Generate a QR code for a property
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the property exists and belongs to the user
    const property = await prisma.property.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    if (property.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Generate a UPI QR code URL (in a real app, you would use a proper UPI ID)
    const upiId = "example@upi";
    const propertyName = encodeURIComponent(property.name);
    const qrCodeData = `upi://pay?pa=${upiId}&pn=${propertyName}&cu=INR`;

    // Update the property with the QR code data
    const updatedProperty = await prisma.property.update({
      where: {
        id: params.id,
      },
      data: {
        paymentQrCode: qrCodeData,
      },
    });

    return NextResponse.json({
      success: true,
      qrCodeData: updatedProperty.paymentQrCode,
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// GET the QR code for a property
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the property exists
    const property = await prisma.property.findUnique({
      where: {
        id: params.id,
      },
      include: {
        rooms: {
          include: {
            tenant: true,
          },
        },
      },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Check if the user is authorized (either the owner or a tenant in this property)
    const isOwner = property.userId === session.user.id;
    const isTenant = property.rooms.some(room => 
      room.tenant && room.tenant.userId === session.user.id
    );

    if (!isOwner && !isTenant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // If the property doesn't have a QR code yet, generate one
    if (!property.paymentQrCode) {
      const upiId = "example@upi";
      const propertyName = encodeURIComponent(property.name);
      const qrCodeData = `upi://pay?pa=${upiId}&pn=${propertyName}&cu=INR`;

      // Update the property with the QR code data
      const updatedProperty = await prisma.property.update({
        where: {
          id: params.id,
        },
        data: {
          paymentQrCode: qrCodeData,
        },
      });

      return NextResponse.json({
        success: true,
        qrCodeData: updatedProperty.paymentQrCode,
      });
    }

    return NextResponse.json({
      success: true,
      qrCodeData: property.paymentQrCode,
    });
  } catch (error) {
    console.error("Error fetching QR code:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
