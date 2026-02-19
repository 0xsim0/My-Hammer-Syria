import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createBidSchema } from "@/lib/validations/bid";
import { safeTrigger, PUSHER_EVENTS, getUserChannel } from "@/lib/pusher";

type RouteParams = { params: Promise<{ jobId: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId } = await params;

    if (session.user.role === "CUSTOMER") {
      const job = await prisma.job.findUnique({ where: { id: jobId } });
      if (!job || job.customerId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const bids = await prisma.bid.findMany({
        where: { jobId },
        include: {
          craftsman: {
            select: {
              id: true,
              name: true,
              nameAr: true,
              image: true,
              avgRating: true,
              totalReviews: true,
              governorate: true,
              craftsmanProfile: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ bids });
    }

    if (session.user.role === "CRAFTSMAN") {
      const bid = await prisma.bid.findUnique({
        where: {
          jobId_craftsmanId: { jobId, craftsmanId: session.user.id },
        },
      });

      return NextResponse.json({ bids: bid ? [bid] : [] });
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "CRAFTSMAN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { jobId } = await params;

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    if (job.status !== "OPEN") {
      return NextResponse.json(
        { error: "Job is not accepting bids" },
        { status: 400 }
      );
    }

    const existingBid = await prisma.bid.findUnique({
      where: {
        jobId_craftsmanId: { jobId, craftsmanId: session.user.id },
      },
    });
    if (existingBid) {
      return NextResponse.json(
        { error: "You have already bid on this job" },
        { status: 409 }
      );
    }

    const body = await request.json();
    const parsed = createBidSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const bid = await prisma.bid.create({
      data: {
        ...parsed.data,
        jobId,
        craftsmanId: session.user.id,
      },
    });

    await prisma.notification.create({
      data: {
        userId: job.customerId,
        type: "NEW_BID",
        titleEn: "New bid on your job",
        titleAr: "عرض جديد على طلبك",
        link: `/jobs/${jobId}`,
      },
    });

    await safeTrigger(
      getUserChannel(job.customerId),
      PUSHER_EVENTS.NEW_NOTIFICATION,
      { type: "NEW_BID", jobId }
    );

    return NextResponse.json(bid, { status: 201 });
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
