import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  updateProfileSchema,
  updateCraftsmanProfileSchema,
} from "@/lib/validations/user";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        nameAr: true,
        email: true,
        phone: true,
        image: true,
        role: true,
        governorate: true,
        avgRating: true,
        totalReviews: true,
        isVerified: true,
        createdAt: true,
        craftsmanProfile: {
          include: { categories: { select: { id: true } } },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: parsed.data,
      select: {
        id: true,
        name: true,
        nameAr: true,
        email: true,
        phone: true,
        image: true,
        role: true,
        governorate: true,
        avgRating: true,
        totalReviews: true,
        isVerified: true,
        createdAt: true,
        craftsmanProfile: true,
      },
    });

    if (
      session.user.role === "CRAFTSMAN" &&
      body.craftsmanProfile
    ) {
      const craftsmanParsed = updateCraftsmanProfileSchema.safeParse(
        body.craftsmanProfile
      );

      if (craftsmanParsed.success) {
        const { categoryIds, ...profileData } = craftsmanParsed.data;

        await prisma.craftsmanProfile.update({
          where: { userId: session.user.id },
          data: {
            ...profileData,
            ...(categoryIds && {
              categories: {
                set: categoryIds.map((id) => ({ id })),
              },
            }),
          },
        });
      }
    }

    const updatedUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        nameAr: true,
        email: true,
        phone: true,
        image: true,
        role: true,
        governorate: true,
        avgRating: true,
        totalReviews: true,
        isVerified: true,
        createdAt: true,
        craftsmanProfile: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
