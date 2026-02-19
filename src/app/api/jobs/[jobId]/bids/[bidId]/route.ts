import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { updateBidStatusSchema } from "@/lib/validations/bid";
import { safeTrigger, PUSHER_EVENTS, getUserChannel } from "@/lib/pusher";

type RouteParams = { params: Promise<{ jobId: string; bidId: string }> };

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId, bidId } = await params;

    const body = await request.json();
    const parsed = updateBidStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { status } = parsed.data;

    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: { job: true },
    });

    if (!bid || bid.jobId !== jobId) {
      return NextResponse.json({ error: "Bid not found" }, { status: 404 });
    }

    // WITHDRAWN: craftsman withdraws own bid
    if (status === "WITHDRAWN") {
      if (bid.craftsmanId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const updated = await prisma.bid.update({
        where: { id: bidId },
        data: { status: "WITHDRAWN" },
      });

      return NextResponse.json(updated);
    }

    // ACCEPTED / REJECTED: customer who owns the job
    if (bid.job.customerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (status === "ACCEPTED") {
      const [updated] = await prisma.$transaction([
        prisma.bid.update({
          where: { id: bidId },
          data: { status: "ACCEPTED" },
        }),
        prisma.bid.updateMany({
          where: { jobId, id: { not: bidId }, status: "PENDING" },
          data: { status: "REJECTED" },
        }),
        prisma.job.update({
          where: { id: jobId },
          data: { status: "IN_PROGRESS" },
        }),
        prisma.conversation.create({
          data: {
            jobId,
            participants: {
              create: [
                { userId: bid.job.customerId },
                { userId: bid.craftsmanId },
              ],
            },
          },
        }),
        prisma.notification.create({
          data: {
            userId: bid.craftsmanId,
            type: "BID_ACCEPTED",
            titleEn: "Your bid was accepted!",
            titleAr: "تم قبول عرضك!",
            link: `/jobs/${jobId}`,
          },
        }),
      ]);

      await safeTrigger(
        getUserChannel(bid.craftsmanId),
        PUSHER_EVENTS.NEW_NOTIFICATION,
        { type: "BID_ACCEPTED", jobId }
      );

      return NextResponse.json(updated);
    }

    if (status === "REJECTED") {
      const updated = await prisma.bid.update({
        where: { id: bidId },
        data: { status: "REJECTED" },
      });

      await prisma.notification.create({
        data: {
          userId: bid.craftsmanId,
          type: "BID_REJECTED",
          titleEn: "Your bid was rejected",
          titleAr: "تم رفض عرضك",
          link: `/jobs/${jobId}`,
        },
      });

      await safeTrigger(
        getUserChannel(bid.craftsmanId),
        PUSHER_EVENTS.NEW_NOTIFICATION,
        { type: "BID_REJECTED", jobId }
      );

      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
