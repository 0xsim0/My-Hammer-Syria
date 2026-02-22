import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const craftsmanProfile = await prisma.craftsmanProfile.findUnique({
      where: { userId: session.user.id },
      include: { portfolioItems: { orderBy: { createdAt: "desc" } } },
    });

    if (!craftsmanProfile) {
      return NextResponse.json({ portfolioItems: [] });
    }

    return NextResponse.json({ portfolioItems: craftsmanProfile.portfolioItems });
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { imageUrl, title, titleAr, description, descriptionAr } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: "imageUrl is required" }, { status: 400 });
    }

    const craftsmanProfile = await prisma.craftsmanProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!craftsmanProfile) {
      return NextResponse.json(
        { error: "Craftsman profile not found" },
        { status: 404 }
      );
    }

    const item = await prisma.portfolioItem.create({
      data: {
        craftsmanProfileId: craftsmanProfile.id,
        imageUrl,
        title,
        titleAr,
        description,
        descriptionAr,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
