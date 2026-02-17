import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { pusherServer, PUSHER_EVENTS, getUserChannel } from "@/lib/pusher";

const createReviewSchema = z.object({
  jobId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  qualityRating: z.number().int().min(1).max(5).optional(),
  punctualityRating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(2000).optional(),
  commentAr: z.string().max(2000).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createReviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { jobId, ...reviewData } = parsed.data;

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        bids: { where: { status: "ACCEPTED" } },
        review: true,
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Job must be completed before reviewing" },
        { status: 400 }
      );
    }

    if (job.customerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (job.review) {
      return NextResponse.json(
        { error: "Review already exists for this job" },
        { status: 409 }
      );
    }

    const acceptedBid = job.bids[0];
    if (!acceptedBid) {
      return NextResponse.json(
        { error: "No accepted bid found" },
        { status: 400 }
      );
    }

    const revieweeId = acceptedBid.craftsmanId;

    const review = await prisma.review.create({
      data: {
        ...reviewData,
        jobId,
        reviewerId: session.user.id,
        revieweeId,
      },
    });

    // Recalculate average rating
    const { _avg, _count } = await prisma.review.aggregate({
      where: { revieweeId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.user.update({
      where: { id: revieweeId },
      data: {
        avgRating: _avg.rating ?? 0,
        totalReviews: _count.rating,
      },
    });

    await prisma.notification.create({
      data: {
        userId: revieweeId,
        type: "NEW_REVIEW",
        titleEn: "You received a new review",
        titleAr: "لقد تلقيت تقييمًا جديدًا",
        link: `/jobs/${jobId}`,
      },
    });

    await pusherServer.trigger(
      getUserChannel(revieweeId),
      PUSHER_EVENTS.NEW_NOTIFICATION,
      { type: "NEW_REVIEW", jobId }
    );

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
