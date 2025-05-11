import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth";
import { z } from "zod";

const paymentSchema = z.object({
  amount: z.number().positive(),
  paymentType: z.enum(["RENT", "SECURITY_DEPOSIT", "MAINTENANCE", "OTHER"]),
  tenantId: z.string().min(1, { message: "Tenant ID is required" }),
  status: z.enum(["PENDING", "WAITING_APPROVAL", "PAID", "FAILED", "REFUNDED"]).optional(),
});

// GET all payments (optionally filtered by tenantId)
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get("tenantId");

    // Build the query
    const query: any = {
      where: {},
      include: {
        tenant: {
          select: {
            name: true,
            email: true,
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
      orderBy: {
        paymentDate: "desc",
      },
    };

    // If tenantId is provided, filter by it
    if (tenantId) {
      query.where.tenantId = tenantId;
    } else if (session.user.role !== "ADMIN") {
      // For regular users, only show their own payments
      query.where.tenant = {
        userId: session.user.id,
      };
    }
    // For admins, show all payments (no additional filter)

    const payments = await prisma.payment.findMany(query);

    return NextResponse.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// POST create a new payment
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const validatedFields = paymentSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validatedFields.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Check if the tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: {
        id: validatedFields.data.tenantId,
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // For regular users, they can only create payments for themselves
    // For admins, they can create payments for any tenant
    if (session.user.role !== "ADMIN" && tenant.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Create the payment
    const payment = await prisma.payment.create({
      data: {
        amount: validatedFields.data.amount,
        paymentType: validatedFields.data.paymentType,
        status: validatedFields.data.status || "PENDING",
        tenantId: validatedFields.data.tenantId,
      },
    });

    return NextResponse.json(payment);
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
