import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { updateJobSchema } from "@/lib/validations/job";

type RouteParams = { params: Promise<{ jobId: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { jobId } = await params;

    const job = await prisma.job.update({
      where: { id: jobId },
      data: { viewCount: { increment: 1 } },
      include: {
        category: true,
        customer: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            image: true,
            avgRating: true,
            governorate: true,
            createdAt: true,
          },
        },
        bids: {
          include: {
            craftsman: {
              select: {
                id: true,
                name: true,
                nameAr: true,
                image: true,
                avgRating: true,
                governorate: true,
              },
            },
          },
        },
      },
    });

    // Parse images from JSON string to array for clients
    const parsed = {
      ...job,
      images: JSON.parse((job.images as string) || "[]"),
    };

    return NextResponse.json(parsed);
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error(error);
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId } = await params;
    const job = await prisma.job.findUnique({ where: { id: jobId } });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.customerId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = updateJobSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await prisma.job.update({
      where: { id: jobId },
      data: {
        ...parsed.data,
        deadline: parsed.data.deadline
          ? new Date(parsed.data.deadline)
          : undefined,
      },
      include: { category: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId } = await params;
    const job = await prisma.job.findUnique({ where: { id: jobId } });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.customerId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    // Handle status updates (e.g. marking as COMPLETED)
    const data: Record<string, unknown> = {};
    if (body.status && ["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(body.status)) {
      data.status = body.status;
    }

    // Also support field updates via updateJobSchema
    const parsed = updateJobSchema.safeParse(body);
    if (parsed.success) {
      Object.assign(data, parsed.data);
      if (parsed.data.deadline) {
        data.deadline = new Date(parsed.data.deadline);
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const updated = await prisma.job.update({
      where: { id: jobId },
      data,
      include: { category: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId } = await params;
    const job = await prisma.job.findUnique({ where: { id: jobId } });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.customerId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.job.delete({ where: { id: jobId } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
