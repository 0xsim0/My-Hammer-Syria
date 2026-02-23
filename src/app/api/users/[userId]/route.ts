import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ userId: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        nameAr: true,
        image: true,
        role: true,
        governorate: true,
        avgRating: true,
        totalReviews: true,
        isVerified: true,
        createdAt: true,
        craftsmanProfile: {
          include: {
            categories: true,
            portfolioItems: true,
          },
        },
        reviewsReceived: {
          take: 5,
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
                nameAr: true,
                image: true,
              },
            },
            job: {
              select: {
                id: true,
                title: true,
                titleAr: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900" },
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
