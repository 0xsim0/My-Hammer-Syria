import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { pusherServer, PUSHER_EVENTS, getUserChannel } from "@/lib/pusher";

type RouteParams = { params: Promise<{ jobId: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
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

    if (job.customerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (job.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { error: "Job must be in progress to complete" },
        { status: 400 }
      );
    }

    const acceptedBid = await prisma.bid.findFirst({
      where: { jobId, status: "ACCEPTED" },
    });

    const updated = await prisma.job.update({
      where: { id: jobId },
      data: { status: "COMPLETED" },
    });

    if (acceptedBid) {
      await prisma.notification.create({
        data: {
          userId: acceptedBid.craftsmanId,
          type: "JOB_COMPLETED",
          titleEn: "Job has been marked as completed",
          titleAr: "تم وضع علامة اكتمال على العمل",
          link: `/jobs/${jobId}`,
        },
      });

      await pusherServer.trigger(
        getUserChannel(acceptedBid.craftsmanId),
        PUSHER_EVENTS.NEW_NOTIFICATION,
        { type: "JOB_COMPLETED", jobId }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
