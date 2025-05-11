import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth";
import { z } from "zod";

const paymentUpdateSchema = z.object({
  amount: z.number().positive().optional(),
  paymentType: z.enum(["RENT", "SECURITY_DEPOSIT", "MAINTENANCE", "OTHER"]).optional(),
  status: z.enum(["PENDING", "WAITING_APPROVAL", "PAID", "FAILED", "REFUNDED"]).optional(),
});

// GET a specific payment
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payment = await prisma.payment.findUnique({
      where: {
        id: params.id,
      },
      include: {
        tenant: {
          select: {
            name: true,
            email: true,
            userId: true,
            room: {
              select: {
                roomNumber: true,
                property: {
                  select: {
                    name: true,
                    userId: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Check if the user is authorized to view this payment
    // Allow admin users, the tenant's user, and the property owner to view
    const isAdmin = session.user.role === "ADMIN";
    const isTenantUser = payment.tenant.userId === session.user.id;
    const isPropertyOwner = payment.tenant.room.property.userId === session.user.id;

    if (!isAdmin && !isTenantUser && !isPropertyOwner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(payment);
  } catch (error) {
    console.error("Error fetching payment:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// PUT update a payment
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

    const validatedFields = paymentUpdateSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validatedFields.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Check if the payment exists
    const existingPayment = await prisma.payment.findUnique({
      where: {
        id: params.id,
      },
      include: {
        tenant: {
          select: {
            userId: true,
            room: {
              select: {
                property: {
                  select: {
                    userId: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!existingPayment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Check if the user is authorized to update this payment
    // Allow admin users, the tenant's user, and the property owner to update
    const isAdmin = session.user.role === "ADMIN";
    const isTenantUser = existingPayment.tenant.userId === session.user.id;
    const isPropertyOwner = existingPayment.tenant.room.property.userId === session.user.id;

    console.log("User role:", session.user.role);
    console.log("Is admin:", isAdmin);
    console.log("Is tenant user:", isTenantUser);
    console.log("Is property owner:", isPropertyOwner);

    if (!isAdmin && !isTenantUser && !isPropertyOwner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update the payment
    const payment = await prisma.payment.update({
      where: {
        id: params.id,
      },
      data: {
        ...validatedFields.data,
      },
    });

    return NextResponse.json(payment);
  } catch (error) {
    console.error("Error updating payment:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// DELETE a payment
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the payment exists and belongs to the current user
    const existingPayment = await prisma.payment.findUnique({
      where: {
        id: params.id,
      },
      include: {
        tenant: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!existingPayment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Allow admin users and the tenant's user to delete
    const isAdmin = session.user.role === "ADMIN";
    const isTenantUser = existingPayment.tenant.userId === session.user.id;

    if (!isAdmin && !isTenantUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.payment.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting payment:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
