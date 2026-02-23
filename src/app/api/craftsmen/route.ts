import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const governorate = searchParams.get("governorate");
    const sortBy = searchParams.get("sortBy") || "rating";
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = 12;

    const where: Record<string, unknown> = {
      user: { isActive: true },
    };

    if (governorate) {
      where.user = { ...(where.user as object), governorate };
    }

    if (category) {
      where.categories = { some: { slug: category } };
    }

    const orderBy =
      sortBy === "rating"
        ? { user: { avgRating: "desc" as const } }
        : sortBy === "reviews"
        ? { user: { totalReviews: "desc" as const } }
        : { createdAt: "desc" as const };

    const [craftsmen, total] = await Promise.all([
      prisma.craftsmanProfile.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              nameAr: true,
              image: true,
              governorate: true,
              avgRating: true,
              totalReviews: true,
            },
          },
          categories: { select: { id: true, name: true, nameAr: true, slug: true, icon: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.craftsmanProfile.count({ where }),
    ]);

    return NextResponse.json(
      { craftsmen, total, pages: Math.ceil(total / limit), page },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
    );
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
